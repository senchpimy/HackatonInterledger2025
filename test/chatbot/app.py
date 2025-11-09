import google.genai as genai
import chromadb
# import pandas as pd # <-- Ya no necesitamos pandas
import os
import re
import requests # <-- NUEVO: Para hacer peticiones HTTP
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 

# --- MODELOS Y CONFIGURACIÓN ---
EMBEDDING_MODEL = 'text-embedding-004'  
CHAT_MODEL = 'gemini-2.5-flash'          

PERSIST_DIRECTORY = "chroma_db_data" 
FLASK_PORT = 5218
# NUEVA CONSTANTE: La URL de nuestro backend de Go
GO_API_URL = "http://localhost:8080/api/all-campaigns"

app = Flask(__name__)
CORS(app) 

try:
    client_gemini = genai.Client()
except Exception as e:
    print(f"Error al inicializar el cliente de Gemini: {e}")
    
client_chroma = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
collection = client_chroma.get_or_create_collection(name="mi_base_de_conocimiento")

# --- 2. FASE DE OBTENCIÓN DE DATOS (AHORA DESDE LA API) ---
def fetch_campaigns_from_go_api():
    """Obtiene los datos de las campañas desde el backend de Go."""
    try:
        print(f"Obteniendo campañas desde: {GO_API_URL}")
        response = requests.get(GO_API_URL, timeout=10) # Timeout de 10 segundos
        response.raise_for_status() # Lanza un error si la respuesta no es 2xx
        campaigns = response.json()
        if not campaigns:
            print("Advertencia: La API de Go no devolvió campañas.")
            return []
        print(f"Se obtuvieron {len(campaigns)} campañas de la API de Go.")
        return campaigns
    except requests.exceptions.RequestException as e:
        print(f"\n❌ ERROR CRÍTICO: No se pudo conectar con la API de Go en {GO_API_URL}.")
        print(f"   Asegúrate de que el servidor de Go esté corriendo en el puerto 8080.")
        print(f"   Error original: {e}")
        return None # Devolvemos None para indicar un fallo

# 3. FASE DE INDEXACIÓN (MODIFICADA)

def get_gemini_embedding(text):
    response = client_gemini.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text 
    )
    return response.embeddings[0].values

def indexar_datos():
    # Primero, borramos la colección antigua para asegurar datos frescos
    client_chroma.delete_collection(name="mi_base_de_conocimiento")
    collection = client_chroma.get_or_create_collection(name="mi_base_de_conocimiento")
    print("--- Colección antigua eliminada. Preparando para re-indexar. ---")
    
    campaigns_data = fetch_campaigns_from_go_api()
    
    # Si la API falló, no continuamos con la indexación
    if campaigns_data is None:
        print("--- Indexación abortada debido a un error de conexión con la API. ---")
        return

    if not campaigns_data:
        print("--- No hay datos para indexar. ---")
        return

    print(f"--- Indexando {len(campaigns_data)} campañas desde la API de Go ---")
    documentos = []
    metadatos = []
    ids = []

    # ❗️ IMPORTANTE: El JSON de Go usa mayúsculas iniciales (Title, Description, etc.)
    for campaign in campaigns_data:
        texto_completo = (
            f"ID de la Causa: {campaign['ID']}. "
            f"Título: {campaign['Title']}. "
            f"Descripción: {campaign['Description']}. "
            # Podemos añadir más campos si son útiles para el contexto
            f"Meta de recaudación: {campaign['Goal']} {campaign['Currency']}. "
            f"Creador: {campaign['CreatorUsername']}."
        )
        documentos.append(texto_completo)
        # Los metadatos son opcionales, pero útiles si los necesitas
        metadatos.append({'titulo': campaign['Title']}) 
        ids.append(str(campaign['ID']))

    try:
        embeddings_list = [get_gemini_embedding(doc) for doc in documentos]
        collection.add(
            embeddings=embeddings_list,
            documents=documentos,
            metadatas=metadatos,
            ids=ids
        )
        print(f"--- Indexación completa. Documentos guardados en '{PERSIST_DIRECTORY}'. ---")
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO DE INDEXACIÓN: {e}")

# --- 4. FUNCIÓN CENTRAL DEL CHATBOT RAG (Generación) ---

def generar_respuesta_chatbot(query, n_results=2):
    if collection.count() == 0:
        return "Lo siento, la base de conocimiento está vacía..."
        
    try:
        query_embedding = get_gemini_embedding(query)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        contexto_recuperado = "RECOMENDACIONES DE CAUSAS ENCONTRADAS:\n"
        
        if results and results['documents'] and results['documents'][0]:
            for i in range(len(results['documents'][0])):
                # (El contexto se construye igual, usando el documento completo)
                documento = results['documents'][0][i]
                contexto_recuperado += f"### CAUSA {i+1}\n{documento}\n\n"

        # 🌟 MODIFICACIÓN 2: Nuevas instrucciones en el System Prompt
        system_prompt = (
            "Eres un 'Asistente Recomendador de Beneficencia' llamado RAG-Bot. "
            "Tu trabajo es analizar la consulta del usuario y las 'RECOMENDACIONES DE CAUSAS' proporcionadas (que incluyen un 'ID de la Causa')."
            "\n1. Si el usuario pide información general o una recomendación (ej. 'ayudar animales'), responde normalmente y sugiere la mejor causa."
            "\n2. Si el usuario pregunta por una *iniciativa específica* (ej. 'qué es Patitas Felices', 'háblame del Fondo Global'), "
            "resume la información y **DEBES** añadir al final el código: [INTENT:SHOW_DETAILS][URL:/iniciativa/ID_DE_LA_CAUSA]. "
            "Reemplaza 'ID_DE_LA_CAUSA' con el ID numérico que encontraste en el contexto."
            "\n3. Si el usuario expresa intención de donar (ej. 'quiero pagar'), responde con una pregunta de confirmación y "
            "**DEBES** añadir el código: [INTENT:CONFIRM_DONATE]."
        )

        prompt_final = (
            f"{system_prompt}\n\n"
            f"CONTEXTO RECUPERADO:\n{contexto_recuperado}\n"
            f"Pregunta del usuario: '{query}'"
        )
        
        response = client_gemini.models.generate_content(
            model=CHAT_MODEL,
            contents=prompt_final,
        )
        
        return response.text

    except Exception as e:
        return f"Lo siento, hubo un error al procesar tu solicitud: {e}."

# --- 5. RUTAS DE FLASK (API) ---

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    data = request.get_json()
    user_prompt = data.get("prompt", "")

    if not user_prompt:
        return jsonify({"respuesta": "Error: Se requiere el campo 'prompt'."}), 400
    
    respuesta_texto = generar_respuesta_chatbot(user_prompt)

    # 🌟 MODIFICACIÓN 3: Lógica de Acciones (Botones)
    action = "none"
    url = ""
    button_text = "" # Nuevo campo para el texto del botón
    
    # Acción 1: Confirmar Donación
    if "[INTENT:CONFIRM_DONATE]" in respuesta_texto:
        action = "offer_donation"
        url = "/donaciones" # URL genérica de donaciones
        respuesta_texto = respuesta_texto.replace("[INTENT:CONFIRM_DONATE]", "").strip()

    # Acción 2: Mostrar Detalles de Iniciativa
    elif "[INTENT:SHOW_DETAILS]" in respuesta_texto:
        action = "offer_details"
        # Extraemos la URL que Gemini construyó
        match = re.search(r"\[URL:(.*?)\]", respuesta_texto)
        if match:
            url = match.group(1) # ej. "/iniciativa/103"
            
            # (Opcional) Extraer el título del contexto para el botón
            # Por simplicidad, usaremos un texto genérico
            button_text = "Ver más detalles" 
        
        # Limpiamos los códigos de la respuesta
        respuesta_texto = re.sub(r"\[INTENT:SHOW_DETAILS\]", "", respuesta_texto)
        respuesta_texto = re.sub(r"\[URL:.*?\]", "", respuesta_texto).strip()

    # 3. Enviamos el JSON con la respuesta Y la acción
    return jsonify({
        "respuesta": respuesta_texto,
        "action": action,
        "url": url,
        "button_text": button_text # Enviamos el texto del botón
    })

if __name__ == "__main__":
    # ❗️ IMPORTANTE: Borra la carpeta 'chroma_db_data' ANTES de ejecutar esto
    # para forzar la reindexación con los IDs.
    print(f"Iniciando servidor Flask. Accede a http://127.0.0.1:{FLASK_PORT}/")
    app.run(debug=True, host='0.0.0.0', port=FLASK_PORT)
