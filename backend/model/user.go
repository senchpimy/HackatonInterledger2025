package model

type User struct {
	ID            int    `json:"id"`
	Username      string `json:"username"`
	PasswordHash  string `json:"-"`
	WalletAddress string `json:"walletAddress"`
	KeyID         string `json:"keyId"`
}
