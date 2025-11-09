package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"	
	"log"
	"net/http"
	"os"
)

// 1. Estructura para la SOLICITUD (lo que Go envía)
// Debe coincidir con lo que tu API de Flask espera: {"prompt": "..."}
type ChatRequest struct {
	Prompt string `json:"prompt"`
}

// 2. Estructura para la RESPUESTA (lo que Go recibe)
// Debe coincidir con la respuesta JSON de tu API de Flask
type ChatResponse struct {
	Respuesta   string `json:"respuesta"`
	Action      string `json:"action"`
	URL         string `json:"url"`
	ButtonText  string `json:"button_text"`
}

// El puerto debe coincidir con el de tu script de Python
const pythonApiUrl = "http://127.0.0.1:5218/api/chat"

func main() {
	// 3. Obtenemos la pregunta de los argumentos de la línea de comandos
	if len(os.Args) < 2 {
		fmt.Println("Uso: go run . \"Tu pregunta aquí\"")
		fmt.Println("\nEjemplo: go run . \"Háblame de Patitas Felices\"")
		return
	}
	// Unimos todos los argumentos para formar una sola pregunta
	userQuery := os.Args[1]

	fmt.Printf("Enviando consulta a Python: \"%s\"\n", userQuery)
	fmt.Println("-------------------------------------------------")

	// 4. Preparamos el payload de la solicitud
	requestPayload := ChatRequest{
		Prompt: userQuery,
	}

	// Convertimos el struct de Go a JSON
	jsonData, err := json.Marshal(requestPayload)
	if err != nil {
		log.Fatalf("Error al serializar JSON: %v", err)
	}

	// 5. Creamos y ejecutamos la solicitud HTTP POST
	req, err := http.NewRequest("POST", pythonApiUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Error al crear la solicitud HTTP: %v", err)
	}
	// Es crucial establecer el tipo de contenido
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error al enviar la solicitud: %v. \n¿Está el servidor de Python corriendo en el puerto 5214?", err)
	}
	defer resp.Body.Close()

	// 6. Leemos y procesamos la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Error al leer la respuesta: %v", err)
	}

	// Manejamos respuestas de error del servidor
	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Error del servidor: %s\nRespuesta: %s", resp.Status, string(body))
	}

	// 7. Deserializamos la respuesta JSON en nuestro struct de Go
	var chatResponse ChatResponse
	err = json.Unmarshal(body, &chatResponse)
	if err != nil {
		log.Fatalf("Error al deserializar JSON de respuesta: %v\nRespuesta recibida: %s", err, string(body))
	}

	// 8. Mostramos los resultados
	fmt.Printf("Respuesta de RAG-Bot: %s\n", chatResponse.Respuesta)
	fmt.Printf("Acción Detectada:    %s\n", chatResponse.Action)
	fmt.Printf("URL (si aplica):     %s\n", chatResponse.URL)
	fmt.Printf("Texto Botón (si aplica): %s\n", chatResponse.ButtonText)
}