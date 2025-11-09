import google.genai as genai
import chromadb
import pandas as pd
import os
import re  # 🌟 NUEVO: Importamos regex para extraer la URL
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 

# --- MODELOS Y CONFIGURACIÓN ---
EMBEDDING_MODEL = 'text-embedding-004'  
CHAT_MODEL = 'gemini-2.5-flash'          

PERSIST_DIRECTORY = "chroma_db_data" 
FLASK_PORT = 5218 # O el puerto que tengas libre

app = Flask(__name__)
CORS(app) 

try:
    client_gemini = genai.Client()
except Exception as e:
    print(f"Error al inicializar el cliente de Gemini: {e}")
    
client_chroma = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
collection = client_chroma.get_or_create_collection(name="mi_base_de_conocimiento")

# 2. Datos de ejemplo (Sin cambios)
data = {
    'id': [101, 102, 103, 104, 105],
    'titulo': [
        "Fondo Global para la Conservación de Océanos",
        "Asociación de Apoyo Educativo para Niños",
        "Albergue de Rescate Animal 'Patitas Felices'",
        "Iniciativa para el Suministro de Agua Potable",
        "Red de Asistencia a Personas Mayores en Hogares"
    ],
    'descripcion': [
        "Asociación dedicada a la limpieza de plásticos marinos y protección de especies. Necesitan voluntarios para eventos de limpieza de playas.",
        "Ofrece becas y tutorías a niños de comunidades de bajos ingresos. Buscan donaciones para útiles escolares.",
        "Rescata perros y gatos abandonados, proporcionando atención veterinaria y buscando adopción. Necesitan pienso y mantas.",
        "Organización que instala filtros de agua en zonas rurales con escasez. Buscan financiación para la compra de materiales.",
        "Proporciona compañía, alimentos y medicinas a personas mayores que viven solas. Se buscan voluntarios para visitas semanales."
    ],
    'preferencias': [
        "Medio Ambiente, Animales, Voluntariado, Océanos, Global, Cambio Climático",
        "Educación, Niños, Becas, Tutoría, Local, Pobreza",
        "Animales, Mascotas, Adopción, Pienso, Local, Veterinaria",
        "Salud, Suministro, Agua, Zonas Rurales, Financiación, Infraestructura",
        "Salud, Personas Mayores, Compañía, Voluntariado, Hogares, Comunidad"
    ]
}
df = pd.DataFrame(data)

# 3. FASE DE INDEXACIÓN

def get_gemini_embedding(text):
    response = client_gemini.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text 
    )
    return response.embeddings[0].values

def indexar_datos():
    if collection.count() == 0:
        print("--- Indexando datos con Google Gemini (Causas de Beneficencia) ---")
        documentos = []
        metadatos = []
        ids = []

        for index, row in df.iterrows():
            # 🌟 MODIFICACIÓN 1: Incluimos el ID en el texto que Gemini leerá
            texto_completo = (
                f"ID de la Causa: {row['id']}. " # <-- El ID ahora es visible para el LLM
                f"Título: {row['titulo']}. "
                f"Descripción: {row['descripcion']}. "
                f"Preferencias/Etiquetas clave: {row['preferencias']}"
            )
            documentos.append(texto_completo)
            metadatos.append({'titulo': row['titulo'], 'preferencias': row['preferencias']}) 
            ids.append(str(row['id']))

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
            
    else:
        print(f"--- Colección ya indexada ({collection.count()} documentos). Cargando desde '{PERSIST_DIRECTORY}'. ---")

with app.app_context():
    indexar_datos()

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