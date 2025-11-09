// handler/payment.go
package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"gofundme-backend/openpayments"

	op "github.com/interledger/open-payments-go"
	as "github.com/interledger/open-payments-go/generated/authserver"
	rs "github.com/interledger/open-payments-go/generated/resourceserver"
)

// Estructuras y constantes (sin cambios)
type InitiatePaymentRequest struct {
	IncomingPaymentId string `json:"incomingPaymentId"`
}
type InitiatePaymentResponse struct {
	RedirectUrl string `json:"redirectUrl"`
}
type FinalizePaymentRequest struct {
	InteractRef string `json:"interactRef"`
}
type GrantInfo struct {
	ContinueToken string `json:"continueToken"`
	ContinueUri   string `json:"continueUri"`
	QuoteId       string `json:"quoteId"`
}

const (
	sendingWalletAddressURL = "https://ilp.interledger-test.dev/zerokmaccount"
)

// Funciones save/load (sin cambios)
func saveGrantInfo(ref string, info GrantInfo) error {
	bytes, err := json.Marshal(info)
	if err != nil {
		return fmt.Errorf("error al serializar grant info: %w", err)
	}
	filename := filepath.Join(os.TempDir(), "grant_"+ref+".json")
	log.Printf("[DEBUG] Guardando grant info en el archivo: %s", filename)
	return os.WriteFile(filename, bytes, 0600)
}
func loadAndClearGrantInfo(ref string) (GrantInfo, error) {
	var info GrantInfo
	filename := filepath.Join(os.TempDir(), "grant_"+ref+".json")
	log.Printf("[DEBUG] Buscando grant info en el archivo: %s", filename)
	bytes, err := os.ReadFile(filename)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			log.Printf("[WARN] No se encontró el archivo de grant para la referencia: %s", ref)
			return info, os.ErrNotExist
		}
		return info, fmt.Errorf("error al leer el archivo de grant: %w", err)
	}
	defer func() {
		log.Printf("[DEBUG] Borrando archivo de grant: %s", filename)
		os.Remove(filename)
	}()
	if err := json.Unmarshal(bytes, &info); err != nil {
		return info, fmt.Errorf("error al deserializar grant info: %w", err)
	}
	return info, nil
}

// InitiatePaymentHandler con la corrección
func InitiatePaymentHandler(w http.ResponseWriter, r *http.Request) {
	// ... (código inicial sin cambios hasta la creación del grant interactivo) ...
	var req InitiatePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Cuerpo inválido", http.StatusBadRequest)
		return
	}
	opClient, err := openpayments.NewClient()
	if err != nil {
		http.Error(w, "Error cliente", http.StatusInternalServerError)
		return
	}
	ctx := context.Background()
	sendingWalletAddress, err := opClient.WalletAddress.Get(ctx, op.WalletAddressGetParams{URL: sendingWalletAddressURL})
	if err != nil {
		http.Error(w, "Error wallet", http.StatusInternalServerError)
		return
	}
	quoteAccess := as.AccessQuote{Type: as.Quote, Actions: []as.AccessQuoteActions{as.Create, as.Read}}
	quoteAccessItem := as.AccessItem{}
	_ = quoteAccessItem.FromAccessQuote(quoteAccess)
	quoteGrant, err := opClient.Grant.Request(ctx, op.GrantRequestParams{URL: *sendingWalletAddress.AuthServer, RequestBody: as.GrantRequestWithAccessToken{AccessToken: struct {
		Access as.Access `json:"access"`
	}{Access: []as.AccessItem{quoteAccessItem}}}})
	if err != nil {
		http.Error(w, "Error grant quote", http.StatusInternalServerError)
		return
	}
	quote, err := opClient.Quote.Create(ctx, op.QuoteCreateParams{BaseURL: *sendingWalletAddress.ResourceServer, AccessToken: quoteGrant.AccessToken.Value, Payload: rs.CreateQuoteJSONBody0{WalletAddressSchema: *sendingWalletAddress.Id, Receiver: req.IncomingPaymentId, Method: "ilp"}})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creando quote: %v", err), http.StatusInternalServerError)
		return
	}
	limitData := as.LimitsOutgoing1{DebitAmount: as.Amount{AssetCode: quote.DebitAmount.AssetCode, AssetScale: quote.DebitAmount.AssetScale, Value: quote.DebitAmount.Value}}
	var limits as.LimitsOutgoing
	_ = limits.FromLimitsOutgoing1(limitData)
	outgoingAccess := as.AccessOutgoing{Type: as.OutgoingPayment, Actions: []as.AccessOutgoingActions{as.AccessOutgoingActionsCreate, as.AccessOutgoingActionsRead}, Identifier: *sendingWalletAddress.Id, Limits: &limits}
	outgoingAccessItem := as.AccessItem{}
	_ = outgoingAccessItem.FromAccessOutgoing(outgoingAccess)
	outgoingPaymentGrant, err := opClient.Grant.Request(ctx, op.GrantRequestParams{URL: *sendingWalletAddress.AuthServer, RequestBody: as.GrantRequestWithAccessToken{AccessToken: struct {
		Access as.Access `json:"access"`
	}{Access: []as.AccessItem{outgoingAccessItem}}, Interact: &as.InteractRequest{Start: []as.InteractRequestStart{as.InteractRequestStartRedirect}}}})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error grant interactivo: %v", err), http.StatusInternalServerError)
		return
	}
	if outgoingPaymentGrant.Interact == nil || outgoingPaymentGrant.Continue.Uri == "" {
		http.Error(w, "Respuesta no interactiva", http.StatusInternalServerError)
		return
	}

	// --- INICIO DE LA CORRECCIÓN ---
	// La referencia que nos devolverá el frontend es la que está en la URL de REDIRECCIÓN.
	redirectUrl := outgoingPaymentGrant.Interact.Redirect
	urlParts := strings.Split(redirectUrl, "/")
	interactRef := urlParts[len(urlParts)-1]

	// Limpiamos los parámetros de consulta por si acaso (ej. ?clientName=...)
	interactRef = strings.Split(interactRef, "?")[0]
	// --- FIN DE LA CORRECCIÓN ---

	// Ahora usamos esta referencia correcta como clave para guardar los datos.
	grantInfo := GrantInfo{
		ContinueToken: outgoingPaymentGrant.Continue.AccessToken.Value,
		ContinueUri:   outgoingPaymentGrant.Continue.Uri,
		QuoteId:       *quote.Id,
	}
	if err := saveGrantInfo(interactRef, grantInfo); err != nil {
		log.Printf("[ERROR] No se pudo guardar la información del grant: %v", err)
		http.Error(w, "Error al guardar estado del pago", http.StatusInternalServerError)
		return
	}

	log.Printf("Grant interactivo iniciado. Ref a guardar: %s. Redirigiendo al usuario a: %s", interactRef, redirectUrl)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(InitiatePaymentResponse{
		RedirectUrl: redirectUrl,
	})
}

// FinalizePaymentHandler (sin cambios)
func FinalizePaymentHandler(w http.ResponseWriter, r *http.Request) {
	var req FinalizePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Cuerpo inválido", http.StatusBadRequest)
		return
	}

	grantInfo, err := loadAndClearGrantInfo(req.InteractRef)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			http.Error(w, "Referencia de interacción inválida o expirada", http.StatusNotFound)
		} else {
			log.Printf("[ERROR] No se pudo cargar info de grant: %v", err)
			http.Error(w, "Error al recuperar estado del pago", http.StatusInternalServerError)
		}
		return
	}

	opClient, err := openpayments.NewClient()
	if err != nil {
		http.Error(w, "Error cliente", http.StatusInternalServerError)
		return
	}

	ctx := context.Background()
	sendingWalletAddress, _ := opClient.WalletAddress.Get(ctx, op.WalletAddressGetParams{URL: sendingWalletAddressURL})

	finalizedGrant, err := opClient.Grant.Continue(ctx, op.GrantContinueParams{
		URL:         grantInfo.ContinueUri,
		AccessToken: grantInfo.ContinueToken,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al continuar grant: %v", err), http.StatusInternalServerError)
		return
	}
	log.Println("Grant finalizado con éxito.")

	var paymentPayload rs.CreateOutgoingPaymentRequest
	err = paymentPayload.FromCreateOutgoingPaymentWithQuote(rs.CreateOutgoingPaymentWithQuote{
		WalletAddressSchema: *sendingWalletAddress.Id,
		QuoteId:             grantInfo.QuoteId,
	})
	if err != nil {
		http.Error(w, "Error creando payload", http.StatusInternalServerError)
		return
	}

	outgoingPayment, err := opClient.OutgoingPayment.Create(ctx, op.OutgoingPaymentCreateParams{
		BaseURL:     *sendingWalletAddress.ResourceServer,
		AccessToken: finalizedGrant.AccessToken.Value,
		Payload:     paymentPayload,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creando outgoing payment: %v", err), http.StatusInternalServerError)
		return
	}
	log.Println("Outgoing payment creado con éxito. ¡Fondos en camino!")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(outgoingPayment)
}
