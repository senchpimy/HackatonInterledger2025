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
	var campaign model.Campaign
	if err := json.NewDecoder(r.Body).Decode(&campaign); err != nil {
		http.Error(w, "Cuerpo de la petición inválido", http.StatusBadRequest)
		return
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
