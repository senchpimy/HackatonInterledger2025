// store/db.go
package store

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3" // El driver de SQLite se registra en sql
)

// DB es la conexión a la base de datos que usará la aplicación.
var DB *sql.DB

// InitDB inicializa la conexión a la base de datos y crea las tablas necesarias.
func InitDB(dataSourceName string) {
	var err error
	DB, err = sql.Open("sqlite3", dataSourceName)
	if err != nil {
		log.Fatalf("Error al abrir la base de datos: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("Error al conectar con la base de datos: %v", err)
	}

	createTable()
}

// createTable crea la tabla 'campaigns' si no existe.
func createTable() {
	query := `
	CREATE TABLE IF NOT EXISTS campaigns (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		title TEXT NOT NULL,
		description TEXT,
		goal REAL NOT NULL,
		amount_raised REAL NOT NULL DEFAULT 0,
		currency TEXT NOT NULL,
		payment_pointer TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`

	_, err := DB.Exec(query)
	if err != nil {
		log.Fatalf("Error al crear la tabla de campañas: %v", err)
	}

	userQuery := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		wallet_address TEXT NOT NULL,
		key_id TEXT NOT NULL
	);`

	_, err = DB.Exec(userQuery)
	if err != nil {
		log.Fatalf("Error al crear la tabla de usuarios: %v", err)
	}
}
