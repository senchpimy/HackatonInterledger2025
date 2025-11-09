import google.genai as genai
import chromadb
import pandas as pd
import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 

# --- MODELOS Y CONFIGURACIÓN ---
EMBEDDING_MODEL = 'text-embedding-004'  
CHAT_MODEL = 'gemini-2.5-flash'          

# Directorio donde se guardarán los embeddings (Persistencia)
PERSIST_DIRECTORY = "chroma_db_data" 
FLASK_PORT = 5209 # Puerto 5204 (o el que tengas libre)

# Inicializar Flask
app = Flask(__name__)
CORS(app) 

# Inicializar el cliente de Gemini
try:
    client_gemini = genai.Client()
except Exception as e:
    print(f"Error al inicializar el cliente de Gemini: {e}")
    
# Inicializar ChromaDB (PERSISTENTE)
client_chroma = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
collection = client_chroma.get_or_create_collection(name="mi_base_de_conocimiento")

# 2. Datos de ejemplo (Base de Conocimiento de Beneficencia)
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

# 3. FASE DE INDEXACIÓN (Correcta)

def get_gemini_embedding(text):
    """Obtiene el embedding de un texto usando el modelo de Gemini."""
    response = client_gemini.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text 
    )
    return response.embeddings[0].values

def indexar_datos():
    """Genera embeddings e indexa los documentos SOLO si la colección está vacía."""
    
    if collection.count() == 0:
        print("--- Indexando datos con Google Gemini (Causas de Beneficencia) ---")
        documentos = []
        metadatos = []
        ids = []

        for index, row in df.iterrows():
            texto_completo = (
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
            print("El chatbot no funcionará hasta que se indexen los datos (revisa tu cuota de Gemini).")
            
    else:
        print(f"--- Colección ya indexada ({collection.count()} documentos). Cargando desde '{PERSIST_DIRECTORY}'. ---")


# Ejecutar la indexación al iniciar la aplicación
with app.app_context():
    indexar_datos()

# --- 4. FUNCIÓN CENTRAL DEL CHATBOT RAG (Generación) ---

def generar_respuesta_chatbot(query, n_results=2):
    """
    Busca contexto en ChromaDB y usa Gemini para generar una respuesta de recomendación.
    """
    if collection.count() == 0:
        return "Lo siento, la base de conocimiento está vacía. Debes indexar los datos primero (revisa la cuota de la API)."
        
    try:
        # A. Recuperación
        query_embedding = get_gemini_embedding(query)

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # B. Aumento y C. Generación
        contexto_recuperado = "RECOMENDACIONES DE CAUSAS ENCONTRADAS:\n"
        
        if results and results['documents'] and results['documents'][0]:
            for i in range(len(results['documents'][0])):
                titulo = results['metadatas'][0][i]['titulo']
                preferencias = results['metadatas'][0][i]['preferencias']
                documento = results['documents'][0][i]
                
                contexto_recuperado += (
                    f"### CAUSA {i+1} (Título: {titulo})\n"
                    f"Etiquetas: {preferencias}\n"
                    f"Detalle: {documento}\n\n"
                )

        # 🌟 NUEVO SYSTEM PROMPT: Pide una pregunta de confirmación en lugar de un código secreto.
        system_prompt = (
            "Eres un 'Asistente Recomendador de Beneficencia' llamado RAG-Bot. "
            "Tu trabajo es analizar la consulta del usuario y las 'RECOMENDACIONES DE CAUSAS' proporcionadas. "
            "Genera una respuesta concisa y amigable que sugiera la mejor asociación. "
            "Destaca el **Título** de la causa y explica por qué se alinea con sus intereses. "
            "\n**IMPORTANTE: Si el usuario expresa una clara intención de donar (ej. 'si quiero donar', 'quiero pagar'), "
            "NO incluyas un código. En su lugar, responde con una pregunta de confirmación como: "
            "'¡Excelente! ¿Te gustaría que te dirija a la página de donaciones para esta causa?' e incluye el código [INTENT:CONFIRM_DONATE] al final.**"
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
        
        respuesta_modelo = response.text
        return respuesta_modelo

    except Exception as e:
        return f"Lo siento, hubo un error al procesar tu solicitud: {e}. Podría ser un límite de cuota o un error de conexión."

# --- 5. RUTAS DE FLASK (API) ---

@app.route("/")
def index():
    """Ruta principal que sirve el archivo HTML."""
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    """Endpoint para la comunicación del chatbot (MODIFICADO PARA OFRECER DONACIÓN)."""
    data = request.get_json()
    user_prompt = data.get("prompt", "")

    if not user_prompt:
        return jsonify({"respuesta": "Error: Se requiere el campo 'prompt'."}), 400
    
    # 1. Obtenemos la respuesta de texto de Gemini
    respuesta_texto = generar_respuesta_chatbot(user_prompt)

    # 2. 🌟 LÓGICA DE ACCIÓN (Botones)
    action = "none"
    url = ""
    
    # Busca el código de confirmación en la respuesta de Gemini
    if "[INTENT:CONFIRM_DONATE]" in respuesta_texto:
        action = "offer_donation" # <-- Nueva acción para mostrar botones
        url = "/donaciones" # <-- Tu URL de donaciones
        
        # Limpiamos el código secreto para que el usuario no lo vea
        respuesta_texto = respuesta_texto.replace("[INTENT:CONFIRM_DONATE]", "").strip()

    # 3. Enviamos el JSON con la respuesta Y la acción
    return jsonify({
        "respuesta": respuesta_texto,
        "action": action,
        "url": url
    })

if __name__ == "__main__":
    print(f"Iniciando servidor Flask. Accede a http://127.0.0.1:{FLASK_PORT}/")
    app.run(debug=True, host='0.0.0.0', port=FLASK_PORT)