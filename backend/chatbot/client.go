package chatbot

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// ChatRequest es la estructura para la SOLICITUD a la API de Python.
// La hacemos pública (mayúscula inicial) para poder usarla desde el handler.
type ChatRequest struct {
	Prompt string `json:"prompt"`
}

// ChatResponse es la estructura para la RESPUESTA de la API de Python.
// También la hacemos pública.
type ChatResponse struct {
	Respuesta  string `json:"respuesta"`
	Action     string `json:"action"`
	URL        string `json:"url"`
	ButtonText string `json:"button_text"`
}

// El puerto debe coincidir con el de tu script de Python
const pythonApiUrl = "http://127.0.0.1:5218/api/chat"

// QueryToBot es la función principal que encapsula la lógica del cliente.
// Recibe una pregunta (prompt) y devuelve la respuesta del bot o un error.
func QueryToBot(userQuery string) (ChatResponse, error) {
	var chatResponse ChatResponse // Variable para guardar la respuesta final

	// 1. Preparamos el payload de la solicitud
	requestPayload := ChatRequest{
		Prompt: userQuery,
	}

	jsonData, err := json.Marshal(requestPayload)
	if err != nil {
		// En un servidor, no usamos log.Fatalf. Devolvemos un error.
		return chatResponse, fmt.Errorf("error al serializar JSON: %w", err)
	}

	// 2. Creamos y ejecutamos la solicitud HTTP POST
	req, err := http.NewRequest("POST", pythonApiUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		return chatResponse, fmt.Errorf("error al crear la solicitud HTTP: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return chatResponse, fmt.Errorf("error al enviar la solicitud al bot de Python: %w", err)
	}
	defer resp.Body.Close()

	// 3. Leemos y procesamos la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return chatResponse, fmt.Errorf("error al leer la respuesta del bot: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return chatResponse, fmt.Errorf("error del servidor del bot: %s, respuesta: %s", resp.Status, string(body))
	}

	// 4. Deserializamos la respuesta JSON en nuestro struct de Go
	err = json.Unmarshal(body, &chatResponse)
	if err != nil {
		return chatResponse, fmt.Errorf("error al deserializar JSON de respuesta del bot: %w", err)
	}

	// 5. Devolvemos la respuesta exitosa
	return chatResponse, nil
}
