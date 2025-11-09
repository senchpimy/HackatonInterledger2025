package model

import "time"

type Campaign struct {
	ID              int       `json:"id"`
	UserID          int       `json:"-"` // ID del usuario que creó la campaña
	CreatorUsername string    `json:"creatorUsername,omitempty"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Goal            float64   `json:"goal"`
	AmountRaised    float64   `json:"amountRaised"`
	Currency        string    `json:"currency"`
	PaymentPointer  string    `json:"paymentPointer"`
	CreatedAt       time.Time `json:"createdAt"`
}
