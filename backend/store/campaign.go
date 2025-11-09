package store

import (
	"database/sql"
	"gofundme-backend/model"
	"log"
)

// CreateCampaign inserta una nueva campaña en la base de datos.
// Devuelve el ID de la campaña recién creada o un error.
func CreateCampaign(campaign model.Campaign) (int, error) {
	query := `
		INSERT INTO campaigns (title, description, goal, currency, payment_pointer)
		VALUES (?, ?, ?, ?, ?);
	`
	res, err := DB.Exec(query, campaign.Title, campaign.Description, campaign.Goal, campaign.Currency, campaign.PaymentPointer)
	if err != nil {
		log.Printf("Error al ejecutar la consulta de creación de campaña: %v", err)
		return 0, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		log.Printf("Error al obtener el ID de la última inserción: %v", err)
		return 0, err
	}

	return int(id), nil
}

// GetCampaigns recupera todas las campañas de la base de datos.
func GetCampaigns() ([]model.Campaign, error) {
	query := `SELECT id, title, description, goal, amount_raised, currency, payment_pointer, created_at FROM campaigns;`
	rows, err := DB.Query(query)
	if err != nil {
		log.Printf("Error al consultar campañas: %v", err)
		return nil, err
	}
	defer rows.Close()

	var campaigns []model.Campaign
	for rows.Next() {
		var campaign model.Campaign
		if err := rows.Scan(&campaign.ID, &campaign.Title, &campaign.Description, &campaign.Goal, &campaign.AmountRaised, &campaign.Currency, &campaign.PaymentPointer, &campaign.CreatedAt); err != nil {
			log.Printf("Error al escanear fila de campaña: %v", err)
			return nil, err
		}
		campaigns = append(campaigns, campaign)
	}

	return campaigns, nil
}

// GetCampaignByID recupera una única campaña por su ID.
func GetCampaignByID(id int) (*model.Campaign, error) {
	query := `SELECT id, title, description, goal, amount_raised, currency, payment_pointer, created_at FROM campaigns WHERE id = ?;`
	row := DB.QueryRow(query, id)

	var campaign model.Campaign
	if err := row.Scan(&campaign.ID, &campaign.Title, &campaign.Description, &campaign.Goal, &campaign.AmountRaised, &campaign.Currency, &campaign.PaymentPointer, &campaign.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No encontrado no es un error de aplicación
		}
		log.Printf("Error al escanear fila de campaña: %v", err)
		return nil, err
	}

	return &campaign, nil
}
