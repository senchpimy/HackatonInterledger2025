package store

import (
	"database/sql"
	"gofundme-backend/model"
	"log"
)

// CreateCampaign inserta una nueva campaña en la base de datos, asociándola a un usuario.
func CreateCampaign(campaign model.Campaign) (int, error) {
	query := `
		INSERT INTO campaigns (user_id, title, description, goal, currency, payment_pointer)
		VALUES (?, ?, ?, ?, ?, ?);
	`
	res, err := DB.Exec(query, campaign.UserID, campaign.Title, campaign.Description, campaign.Goal, campaign.Currency, campaign.PaymentPointer)
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

// GetCampaigns recupera todas las campañas de la base de datos
func GetCampaigns() ([]model.Campaign, error) {
	query := `
		SELECT c.id, c.title, c.description, c.goal, c.amount_raised, c.currency, c.payment_pointer, c.created_at, u.username
		FROM campaigns c
		JOIN users u ON c.user_id = u.id;
	`
	rows, err := DB.Query(query)
	if err != nil {
		log.Printf("Error al consultar campañas: %v", err)
		return nil, err
	}
	defer rows.Close()

	var campaigns []model.Campaign
	for rows.Next() {
		var campaign model.Campaign
		if err := rows.Scan(&campaign.ID, &campaign.Title, &campaign.Description, &campaign.Goal, &campaign.AmountRaised, &campaign.Currency, &campaign.PaymentPointer, &campaign.CreatedAt, &campaign.CreatorUsername); err != nil {
			log.Printf("Error al escanear fila de campaña: %v", err)
			return nil, err
		}
		campaigns = append(campaigns, campaign)
	}

	return campaigns, nil
}

// GetCampaignByID recupera una única campaña por su ID
func GetCampaignByID(id int) (*model.Campaign, error) {
	query := `
		SELECT c.id, c.title, c.description, c.goal, c.amount_raised, c.currency, c.payment_pointer, c.created_at, u.username
		FROM campaigns c
		JOIN users u ON c.user_id = u.id
		WHERE c.id = ?;
	`
	row := DB.QueryRow(query, id)

	var campaign model.Campaign
	if err := row.Scan(&campaign.ID, &campaign.Title, &campaign.Description, &campaign.Goal, &campaign.AmountRaised, &campaign.Currency, &campaign.PaymentPointer, &campaign.CreatedAt, &campaign.CreatorUsername); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No encontrado no es un error de aplicación
		}
		log.Printf("Error al escanear fila de campaña: %v", err)
		return nil, err
	}

	return &campaign, nil
}

