package handler

import (
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"gofundme-backend/openpayments"
	"gofundme-backend/store"

	"github.com/gorilla/mux"
)

type DonationRequest struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}

func CreateDonationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	campaignID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "ID de campaña inválido", http.StatusBadRequest)
		return
	}

	var req DonationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Cuerpo de la petición inválido", http.StatusBadRequest)
		return
	}

	campaign, err := store.GetCampaignByID(campaignID)
	if err != nil {
		http.Error(w, "Error al recuperar la campaña", http.StatusInternalServerError)
		return
	}
	if campaign == nil {
		http.Error(w, "Campaña no encontrada", http.StatusNotFound)
		return
	}

	opClient, err := openpayments.NewClient()
	if err != nil {
		http.Error(w, "Error al inicializar el cliente de Open Payments", http.StatusInternalServerError)
		return
	}

	amountInMinorUnits := int64(math.Round(req.Amount * 100))
	description := "Donación para la campaña: " + campaign.Title

	incomingPayment, err := opClient.CreateIncomingPayment(r.Context(), campaign.PaymentPointer, amountInMinorUnits, description)
	if err != nil {
		http.Error(w, "No se pudo procesar la solicitud de donación con Open Payments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(incomingPayment)
}
