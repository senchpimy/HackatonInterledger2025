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
	api.HandleFunc("/register", handler.RegisterUser).Methods("POST")
	api.HandleFunc("/login", handler.LoginUser).Methods("POST")
	api.HandleFunc("/payments/initiate", handler.InitiatePaymentHandler).Methods("POST")
	api.HandleFunc("/payments/finalize", handler.FinalizePaymentHandler).Methods("POST")

	// Ruta de verificación de estado
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "API de GoFundMe está en funcionamiento")
	}).Methods("GET")

	// Middleware de CORS
	corsHandler := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			h.ServeHTTP(w, r)
		})
	}

	log.Println("Servidor escuchando en http://localhost:8080")
	if err := http.ListenAndServe(":8080", corsHandler(r)); err != nil {
		log.Fatal(err)
	}
}
