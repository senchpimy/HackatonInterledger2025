package main

import (
	"bufio"
	"context"
	"encoding/base64"
	"encoding/json"
	_ "encoding/pem"
	"fmt"
	"log"
	"os"

	op "github.com/interledger/open-payments-go"
	as "github.com/interledger/open-payments-go/generated/authserver"
	rs "github.com/interledger/open-payments-go/generated/resourceserver"
)

// printJSON es una función de ayuda para imprimir structs de forma legible.
func printJSON(step string, data interface{}) {
	fmt.Printf("\n%s\n", step)
	bytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Fatalf("Error al serializar a JSON: %v", err)
	}
	fmt.Println(string(bytes))
}

func main() {
	// --- Configuración ---
	const privateKeyPath = "private.key"
	const keyId = "685c6458-134d-4f80-b6e9-5011e397ee3f"
	const clientWalletAddressURL = "https://ilp.interledger-test.dev/clientzerokm"
	const sendingWalletAddressURL = "https://ilp.interledger-test.dev/zerokmaccount"
	const receivingWalletAddressURL = "https://ilp.interledger-test.dev/64688b96"

	// --- Paso 0: Inicialización del Cliente ---
	pemFileBytes, err := os.ReadFile(privateKeyPath)
	if err != nil {
		log.Fatalf("Error al leer el archivo de la clave privada: %v", err)
	}

	// 2. Codificar TODO el contenido del archivo a Base64.
	privateKeyBase64 := base64.StdEncoding.EncodeToString(pemFileBytes)

	// 3. Pasar ese string Base64 a la función.
	client, err := op.NewAuthenticatedClient(
		clientWalletAddressURL,
		privateKeyBase64,
		keyId,
	)
	if err != nil {
		log.Fatalf("No se pudo crear el cliente autenticado: %v", err)
	}
	fmt.Println("✅ Cliente autenticado creado con éxito.")

	ctx := context.Background()

	// --- Paso 1: Obtener detalles de las Wallet Addresses ---
	sendingWalletAddress, err := client.WalletAddress.Get(ctx, op.WalletAddressGetParams{URL: sendingWalletAddressURL})
	if err != nil {
		log.Fatalf("Error obteniendo la wallet emisora: %v", err)
	}

	receivingWalletAddress, err := client.WalletAddress.Get(ctx, op.WalletAddressGetParams{URL: receivingWalletAddressURL})
	if err != nil {
		log.Fatalf("Error obteniendo la wallet receptora: %v", err)
	}

	printJSON("--- Paso 1: Detalles de las Wallets Obtenidos ---", map[string]interface{}{
		"sendingWalletAddress":   sendingWalletAddress,
		"receivingWalletAddress": receivingWalletAddress,
	})

	// --- Paso 2: Obtener Grant para crear Incoming Payment ---
	incomingAccess := as.AccessIncoming{
		Type:    as.IncomingPayment,
		Actions: []as.AccessIncomingActions{as.AccessIncomingActionsCreate, as.AccessIncomingActionsRead, as.AccessIncomingActionsComplete},
	}
	incomingAccessItem := as.AccessItem{}
	if err := incomingAccessItem.FromAccessIncoming(incomingAccess); err != nil {
		log.Fatalf("Error al crear AccessItem para incoming payment: %v", err)
	}

	incomingPaymentGrant, err := client.Grant.Request(ctx, op.GrantRequestParams{
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
		log.Fatalf("Error solicitando grant para incoming payment: %v", err)
	}
	printJSON("--- Paso 2: Grant para Incoming Payment Obtenido ---", incomingPaymentGrant)

	// --- Paso 3: Crear el Incoming Payment ---
	incomingPayment, err := client.IncomingPayment.Create(ctx, op.IncomingPaymentCreateParams{
		BaseURL:     *receivingWalletAddress.ResourceServer,
		AccessToken: incomingPaymentGrant.AccessToken.Value,
		Payload: rs.CreateIncomingPaymentJSONBody{
			WalletAddressSchema: *receivingWalletAddress.Id,
			IncomingAmount: &rs.Amount{
				Value:      "1700",
				AssetCode:  receivingWalletAddress.AssetCode,
				AssetScale: receivingWalletAddress.AssetScale,
			},
		},
	})
	if err != nil {
		log.Fatalf("Error creando el incoming payment: %v", err)
	}
	printJSON("--- Paso 3: Incoming Payment Creado ---", incomingPayment)

	// --- Paso 4: Obtener Grant para crear Quote ---
	quoteAccess := as.AccessQuote{
		Type:    as.Quote,
		Actions: []as.AccessQuoteActions{as.Create, as.Read},
	}
	quoteAccessItem := as.AccessItem{}
	if err := quoteAccessItem.FromAccessQuote(quoteAccess); err != nil {
		log.Fatalf("Error al crear AccessItem para quote: %v", err)
	}

	quoteGrant, err := client.Grant.Request(ctx, op.GrantRequestParams{
		URL: *sendingWalletAddress.AuthServer,
		RequestBody: as.GrantRequestWithAccessToken{
			AccessToken: struct {
				Access as.Access `json:"access"`
			}{
				Access: []as.AccessItem{quoteAccessItem},
			},
		},
	})
	if err != nil {
		log.Fatalf("Error solicitando grant para quote: %v", err)
	}
	printJSON("--- Paso 4: Grant para Quote Obtenido ---", quoteGrant)

	// --- Paso 5: Crear la Quote ---
	quote, err := client.Quote.Create(ctx, op.QuoteCreateParams{
		BaseURL:     *sendingWalletAddress.ResourceServer,
		AccessToken: quoteGrant.AccessToken.Value,
		Payload: rs.CreateQuoteJSONBody0{
			WalletAddressSchema: *sendingWalletAddress.Id,
			Receiver:            *incomingPayment.Id,
			Method:              "ilp",
		},
	})
	if err != nil {
		log.Fatalf("Error creando la quote: %v", err)
	}
	printJSON("--- Paso 5: Quote Creada ---", quote)

	// --- Paso 6: Solicitar Grant interactivo para Outgoing Payment ---
	limitData := as.LimitsOutgoing1{
		DebitAmount: as.Amount{
			AssetCode:  quote.DebitAmount.AssetCode,
			AssetScale: quote.DebitAmount.AssetScale,
			Value:      quote.DebitAmount.Value,
		},
	}
	var limits as.LimitsOutgoing
	err = limits.FromLimitsOutgoing1(limitData)
	if err != nil {
		log.Fatalf("Error al crear los límites para el grant: %v", err)
	}
	outgoingAccess := as.AccessOutgoing{
		Type:       as.OutgoingPayment,
		Actions:    []as.AccessOutgoingActions{as.AccessOutgoingActionsCreate, as.AccessOutgoingActionsRead},
		Identifier: *sendingWalletAddress.Id,
		Limits:     &limits,
	}
	outgoingAccessItem := as.AccessItem{}
	if err := outgoingAccessItem.FromAccessOutgoing(outgoingAccess); err != nil {
		log.Fatalf("Error al crear AccessItem para outgoing payment: %v", err)
	}

	outgoingPaymentGrant, err := client.Grant.Request(ctx, op.GrantRequestParams{
		URL: *sendingWalletAddress.AuthServer,
		RequestBody: as.GrantRequestWithAccessToken{
			AccessToken: struct {
				Access as.Access `json:"access"`
			}{
				Access: []as.AccessItem{outgoingAccessItem},
			},
			Interact: &as.InteractRequest{
				Start: []as.InteractRequestStart{as.InteractRequestStartRedirect},
			},
		},
	})
	if err != nil {
		log.Fatalf("Error solicitando grant para outgoing payment: %v", err)
	}
	printJSON("--- Paso 6: Grant Interactivo para Outgoing Payment Solicitado ---", outgoingPaymentGrant)

	// --- Paso 7: Interacción del Usuario ---
	fmt.Println("\n🛑 ACCIÓN REQUERIDA 🛑")
	fmt.Println("Navega a la siguiente URL en tu navegador para aprobar el pago:")
	fmt.Println(outgoingPaymentGrant.Interact.Redirect)
	fmt.Print("Una vez aprobado, presiona Enter para continuar...")
	bufio.NewReader(os.Stdin).ReadBytes('\n')

	// --- Paso 8: Continuar el Grant para finalizarlo ---
	finalizedGrant, err := client.Grant.Continue(ctx, op.GrantContinueParams{
		URL:         outgoingPaymentGrant.Continue.Uri,
		AccessToken: outgoingPaymentGrant.Continue.AccessToken.Value,
	})
	if err != nil {
		log.Fatalf("Error al continuar el grant. ¿Aprobaste el pago en el navegador? Error: %v", err)
	}
	printJSON("--- Paso 8: Grant Finalizado con Éxito ---", finalizedGrant)

	// --- Paso 9: Crear el Outgoing Payment ---
	var paymentPayload rs.CreateOutgoingPaymentRequest
	err = paymentPayload.FromCreateOutgoingPaymentWithQuote(rs.CreateOutgoingPaymentWithQuote{
		WalletAddressSchema: *sendingWalletAddress.Id,
		QuoteId:             *quote.Id,
	})
	if err != nil {
		log.Fatalf("Error creando el payload del outgoing payment: %v", err)
	}

	outgoingPayment, err := client.OutgoingPayment.Create(ctx, op.OutgoingPaymentCreateParams{
		BaseURL:     *sendingWalletAddress.ResourceServer,
		AccessToken: finalizedGrant.AccessToken.Value,
		Payload:     paymentPayload,
	})
	if err != nil {
		log.Fatalf("Error creando el outgoing payment: %v", err)
	}

	printJSON("--- Paso 9: Outgoing Payment Creado ¡Fondos en camino! ---", outgoingPayment)
}
