package openpayments

import (
	"context"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"log"

	"gofundme-backend/openpayments/final"
	op "github.com/interledger/open-payments-go"
	as "github.com/interledger/open-payments-go/generated/authserver"
	rs "github.com/interledger/open-payments-go/generated/resourceserver"
)

const (
	privateKeyPath           = "../test/private.key"
	keyId                    = "685c6458-134d-4f80-b6e9-5011e397ee3f"
	clientWalletAddressURL   = "https://ilp.interledger-test.dev/clientzerokm"
)

// Client is a client for interacting with an Open Payments server.
type Client struct {
	*op.AuthenticatedClient
}

// NewClient creates and authenticates a new Open Payments client.
func NewClient() (*Client, error) {
	pemFileBytes, err := ioutil.ReadFile(privateKeyPath)
	if err != nil {
		// Intentar una ruta alternativa si estamos ejecutando desde el directorio del backend
		log.Printf("No se pudo leer la clave privada en la ruta inicial, intentando ruta alternativa...")
		pemFileBytes, err = ioutil.ReadFile("../../test/private.key")
		if err != nil {
			return nil, fmt.Errorf("error al leer el archivo de la clave privada desde ambas rutas: %v", err)
		}
	}

	privateKeyBase64 := base64.StdEncoding.EncodeToString(pemFileBytes)

	authenticatedClient, err := op.NewAuthenticatedClient(
		clientWalletAddressURL,
		privateKeyBase64,
		keyId,
	)
	if err != nil {
		return nil, fmt.Errorf("no se pudo crear el cliente autenticado: %v", err)
	}

	log.Println("✅ Cliente de Open Payments autenticado con éxito.")
	return &Client{AuthenticatedClient: authenticatedClient}, nil
}

// CreateIncomingPayment creates an incoming payment on the Open Payments server.
func (c *Client) CreateIncomingPayment(ctx context.Context, receivingWalletAddressURL string, amount int64, description string) (*final.FinalResponse, error) {
	// 1. Get receiving wallet address details
	receivingWalletAddress, err := c.WalletAddress.Get(ctx, op.WalletAddressGetParams{URL: receivingWalletAddressURL})
	if err != nil {
		return nil, fmt.Errorf("error obteniendo la wallet receptora: %v", err)
	}

	// 2. Request grant for creating an incoming payment
	incomingAccess := as.AccessIncoming{
		Type:    as.IncomingPayment,
		Actions: []as.AccessIncomingActions{as.AccessIncomingActionsCreate, as.AccessIncomingActionsRead, as.AccessIncomingActionsComplete},
	}
	incomingAccessItem := as.AccessItem{}
	if err := incomingAccessItem.FromAccessIncoming(incomingAccess); err != nil {
		return nil, fmt.Errorf("error al crear AccessItem para incoming payment: %v", err)
	}

	incomingPaymentGrant, err := c.Grant.Request(ctx, op.GrantRequestParams{
		URL: *receivingWalletAddress.AuthServer,
		RequestBody: as.GrantRequestWithAccessToken{
			AccessToken: struct {
				Access as.Access `json:"access"`
			}{
				Access: []as.AccessItem{incomingAccessItem},
			},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("error solicitando grant para incoming payment: %v", err)
	}

	// 3. Create the incoming payment
	incomingPayment, err := c.IncomingPayment.Create(ctx, op.IncomingPaymentCreateParams{
		BaseURL:     *receivingWalletAddress.ResourceServer,
		AccessToken: incomingPaymentGrant.AccessToken.Value,
		Payload: rs.CreateIncomingPaymentJSONBody{
			WalletAddressSchema: *receivingWalletAddress.Id,
			IncomingAmount: &rs.Amount{
				Value:      fmt.Sprintf("%d", amount),
				AssetCode:  receivingWalletAddress.AssetCode,
				AssetScale: receivingWalletAddress.AssetScale,
			},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("error creando el incoming payment: %v", err)
	}

	return toFinalResponse(&incomingPayment, receivingWalletAddress.Id), nil
}

func toFinalResponse(ip *rs.IncomingPaymentWithMethods, walletAddressId *string) *final.FinalResponse {
	// The open-payments-go library does not currently expose the IlpStreamConnection
	// in the IncomingPaymentWithMethods struct. For now, we will mock this data.
	// In a real application, you would need to make a separate call to the
	// /incoming-payments/{id}/connection-details endpoint to get this information.
	return &final.FinalResponse{
		ID:             *ip.Id,
		PaymentPointer: *walletAddressId,
		IncomingAmount: final.Amount{
			Value:      ip.IncomingAmount.Value,
			AssetCode:  ip.IncomingAmount.AssetCode,
			AssetScale: ip.IncomingAmount.AssetScale,
		},
		IlpStreamConnection: final.IlpStreamConnection{
			IlpAddress:   "g.us.example.mock-payment-id-12345",
			SharedSecret: "mock_shared_secret_for_testing_only",
		},
		Completed: ip.Completed,
		ExpiresAt: *ip.ExpiresAt,
		CreatedAt: ip.CreatedAt,
	}
}
