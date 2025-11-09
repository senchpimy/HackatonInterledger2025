package main

import (
	"fmt"
	"log"
	"net/http"

	"gofundme-backend/handler"
	"gofundme-backend/store"

	"github.com/gorilla/mux"
)

func main() {
	// Inicializar la base de datos
	store.InitDB("bd.db")
	log.Println("Base de datos inicializada correctamente.")

	r := mux.NewRouter()

	// Rutas de la API
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/campaigns", handler.CreateCampaignHandler).Methods("POST")
	api.HandleFunc("/campaigns", handler.GetCampaignsHandler).Methods("GET")
	api.HandleFunc("/campaigns/{id:[0-9]+}", handler.GetCampaignHandler).Methods("GET")
	api.HandleFunc("/campaigns/{id:[0-9]+}/donations", handler.CreateDonationHandler).Methods("POST")

	// Ruta de verificación de estado
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "API de GoFundMe está en funcionamiento")
	}).Methods("GET")

	log.Println("Servidor escuchando en http://localhost:8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
