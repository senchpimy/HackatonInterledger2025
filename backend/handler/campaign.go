package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"gofundme-backend/model"
	"gofundme-backend/store"

	"github.com/gorilla/mux"
)

func CreateCampaignHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Title          string  `json:"title"`
		Description    string  `json:"description"`
		Goal           float64 `json:"goal"`
		Currency       string  `json:"currency"`
		PaymentPointer string  `json:"paymentPointer"`
		UserID         int     `json:"userId"` // El ID del usuario que crea la campaña
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Cuerpo de la petición inválido", http.StatusBadRequest)
		return
	}

	if requestBody.UserID == 0 {
		http.Error(w, "El ID del usuario es obligatorio", http.StatusBadRequest)
		return
	}

	campaign := model.Campaign{
		UserID:         requestBody.UserID,
		Title:          requestBody.Title,
		Description:    requestBody.Description,
		Goal:           requestBody.Goal,
		Currency:       requestBody.Currency,
		PaymentPointer: requestBody.PaymentPointer,
	}

	id, err := store.CreateCampaign(campaign)
	if err != nil {
		http.Error(w, "No se pudo crear la campaña", http.StatusInternalServerError)
		return
	}

	campaign.ID = id
	campaign.CreatedAt = time.Now() // Aproximación, idealmente se leería de la BD.

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(campaign)
}

func GetCampaignsHandler(w http.ResponseWriter, r *http.Request) {
	campaigns, err := store.GetCampaigns()
	if err != nil {
		log.Println(err)
		http.Error(w, "No se pudieron recuperar las campañas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(campaigns)
}

func GetCampaignHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Println(err)
		http.Error(w, "ID de campaña inválido", http.StatusBadRequest)
		return
	}

	campaign, err := store.GetCampaignByID(id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error al recuperar la campaña", http.StatusInternalServerError)
		return
	}

	if campaign == nil {
		log.Println(err)
		http.Error(w, "Campaña no encontrada", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(campaign)
}

func GetAllCampaignsForIndexingHandler(w http.ResponseWriter, r *http.Request) {
	// Usamos la función que ya existe en el store para obtener todas las campañas
	campaigns, err := store.GetCampaigns()
	if err != nil {
		// No necesitas loguear aquí porque store.GetCampaigns ya lo hace
		http.Error(w, "Error al obtener las campañas de la base de datos", http.StatusInternalServerError)
		return
	}

	// Establecemos la cabecera y enviamos la respuesta en formato JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(campaigns)
}
