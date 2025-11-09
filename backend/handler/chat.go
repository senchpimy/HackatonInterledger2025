package handler

import (
	"encoding/json"
	"gofundme-backend/chatbot" // Importamos nuestro nuevo paquete
	"log"
	"net/http"
)

// chatApiRequest es la estructura que esperamos recibir en el body de la petición a nuestra API de Go.
type chatApiRequest struct {
	Prompt string `json:"prompt"`
}

// ChatHandler maneja las peticiones a la ruta /api/chat
func ChatHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Decodificar el JSON que nos llega en la petición
	var requestPayload chatApiRequest
	err := json.NewDecoder(r.Body).Decode(&requestPayload)
	if err != nil {
		http.Error(w, "Cuerpo de la petición inválido", http.StatusBadRequest)
		return
	}

	if requestPayload.Prompt == "" {
		http.Error(w, "El campo 'prompt' no puede estar vacío", http.StatusBadRequest)
		return
	}

	// 2. Llamar a la lógica de nuestro cliente del chatbot
	botResponse, err := chatbot.QueryToBot(requestPayload.Prompt)
	if err != nil {
		// Si hay un error (ej. la API de Python está caída), lo registramos y enviamos un error 500
		log.Printf("Error al comunicarse con el servicio de chatbot: %v", err)
		http.Error(w, "Error interno del servidor al contactar el chatbot", http.StatusInternalServerError)
		return
	}

	// 3. Si todo fue bien, devolvemos la respuesta del bot como JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(botResponse)
}
