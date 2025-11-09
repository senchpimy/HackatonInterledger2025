package openpayments

import (
	"log"
	"net/http"
	"time"
)

// Amount representa un monto monetario en Open Payments.
// El valor se representa como una cadena de texto en las unidades menores (ej. centavos).
type Amount struct {
	Value      string `json:"value"`
	AssetCode  string `json:"assetCode"`
	AssetScale int    `json:"assetScale"`
}

// IncomingPaymentRequest es el cuerpo de la petición para crear un pago entrante.
type IncomingPaymentRequest struct {
	IncomingAmount Amount    `json:"incomingAmount"`
	ExpiresAt      time.Time `json:"expiresAt"`
	Description    string    `json:"description"`
}

// IlpStreamConnection contiene los detalles del Interledger Protocol para el pago.
type IlpStreamConnection struct {
	IlpAddress   string `json:"ilpAddress"`
	SharedSecret string `json:"sharedSecret"`
}

// IncomingPaymentResponse es la respuesta exitosa al crear un pago entrante.
// Esto es lo que el frontend necesitará para realizar el pago.
type IncomingPaymentResponse struct {
	ID                  string              `json:"id"`
	PaymentPointer      string              `json:"paymentPointer"`
	IncomingAmount      Amount              `json:"incomingAmount"`
	IlpStreamConnection IlpStreamConnection `json:"ilpStreamConnection"`
	Completed           bool                `json:"completed"`
	ExpiresAt           time.Time           `json:"expiresAt"`
	CreatedAt           time.Time           `json:"createdAt"`
}

// Client es un cliente para interactuar con un servidor de Open Payments.
type Client struct {
	HttpClient *http.Client
}

func (c *Client) CreateIncomingPayment(paymentPointer string, amount Amount, description string) (*IncomingPaymentResponse, error) {

	log.Printf("SIMULANDO: Llamada a Open Payments para crear pago entrante en %s", paymentPointer)

	mockResponse := &IncomingPaymentResponse{
		ID:             "mock-payment-id-12345",
		PaymentPointer: paymentPointer,
		IncomingAmount: amount,
		IlpStreamConnection: IlpStreamConnection{
			IlpAddress:   "g.us.example.mock-payment-id-12345",
			SharedSecret: "mock_shared_secret_for_testing_only",
		},
		Completed: false,
		ExpiresAt: time.Now().Add(10 * time.Minute),
		CreatedAt: time.Now(),
	}

	return mockResponse, nil
}
