package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"gofundme-backend/model"
	"gofundme-backend/store"
)

// RegisterUser maneja el registro de un nuevo usuario.
func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Username      string `json:"username"`
		Password      string `json:"password"`
		WalletAddress string `json:"walletAddress"`
		KeyID         string `json:"keyId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Cuerpo de la solicitud inválido", http.StatusBadRequest)
		return
	}

	if requestBody.Username == "" || requestBody.Password == "" || requestBody.WalletAddress == "" || requestBody.KeyID == "" {
		http.Error(w, "Todos los campos son obligatorios", http.StatusBadRequest)
		return
	}

	// Comprobar si el nombre de usuario ya existe
	existingUser, err := store.GetUserByUsername(requestBody.Username)
	if err != nil {
		log.Printf("Error al comprobar si el usuario existe: %v", err)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}
	if existingUser != nil {
		http.Error(w, "El nombre de usuario ya está en uso", http.StatusConflict)
		return
	}

	// Crear el nuevo usuario
	newUser := &model.User{
		Username:      requestBody.Username,
		WalletAddress: requestBody.WalletAddress,
		KeyID:         requestBody.KeyID,
	}

	if err := store.CreateUser(newUser, requestBody.Password); err != nil {
		log.Printf("Error al crear el usuario: %v", err)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newUser) // El hash de la contraseña no se enviará gracias a `json:"-"`
}

// LoginUser maneja el inicio de sesión de un usuario.
func LoginUser(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Cuerpo de la solicitud inválido", http.StatusBadRequest)
		return
	}

	if requestBody.Username == "" || requestBody.Password == "" {
		http.Error(w, "El nombre de usuario y la contraseña son obligatorios", http.StatusBadRequest)
		return
	}

	// Obtener el usuario por su nombre de usuario
	user, err := store.GetUserByUsername(requestBody.Username)
	if err != nil {
		log.Printf("Error al obtener el usuario: %v", err)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.Error(w, "Credenciales inválidas", http.StatusUnauthorized)
		return
	}

	// Comprobar la contraseña
	if !store.CheckPasswordHash(requestBody.Password, user.PasswordHash) {
		http.Error(w, "Credenciales inválidas", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user) // El hash de la contraseña no se enviará
}