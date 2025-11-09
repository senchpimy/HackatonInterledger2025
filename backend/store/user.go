package store

import (
	"database/sql"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gofundme-backend/model"
)

// HashPassword genera un hash bcrypt para una contraseña.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash compara una contraseña en texto plano con su hash.
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// CreateUser inserta un nuevo usuario en la base de datos con una contraseña hasheada.
func CreateUser(user *model.User, password string) error {
	hashedPassword, err := HashPassword(password)
	if err != nil {
		return err
	}

	query := "INSERT INTO users (username, password_hash, wallet_address) VALUES (?, ?, ?)"
	stmt, err := DB.Prepare(query)
	if err != nil {
		log.Printf("Error preparing query: %v", err)
		return err
	}
	defer stmt.Close()

	res, err := stmt.Exec(user.Username, hashedPassword, user.WalletAddress)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		log.Printf("Error getting last insert ID: %v", err)
		return err
	}

	user.ID = int(id)
	user.PasswordHash = hashedPassword // Asignamos el hash para uso interno si es necesario
	return nil
}

// GetUserByUsername busca un usuario por su nombre de usuario.
func GetUserByUsername(username string) (*model.User, error) {
	query := "SELECT id, username, password_hash, wallet_address FROM users WHERE username = ?"
	row := DB.QueryRow(query, username)

	var user model.User
	err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.WalletAddress)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No es un error, simplemente no se encontró el usuario.
		}
		log.Printf("Error scanning user row: %v", err)
		return nil, err
	}

	return &user, nil
}
