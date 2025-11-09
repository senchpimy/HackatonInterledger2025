package final

import "time"

type Amount struct {
	Value      string `json:"value"`
	AssetCode  string `json:"assetCode"`
	AssetScale int    `json:"assetScale"`
}

type IlpStreamConnection struct {
	IlpAddress   string `json:"ilpAddress"`
	SharedSecret string `json:"sharedSecret"`
}

type FinalResponse struct {
	ID                  string              `json:"id"`
	PaymentPointer      string              `json:"paymentPointer"`
	IncomingAmount      Amount              `json:"incomingAmount"`
	IlpStreamConnection IlpStreamConnection `json:"ilpStreamConnection"`
	Completed           bool                `json:"completed"`
	ExpiresAt           time.Time           `json:"expiresAt"`
	CreatedAt           time.Time           `json:"createdAt"`
}
