package database

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
    _ "github.com/lib/pq"
)

var DB *sql.DB

func ConectaComBanco() {
    err := godotenv.Load()
    if err != nil {
        fmt.Println("Aviso: Arquivo .env não encontrado. Usando variáveis do sistema.")
    }

    dbUser := os.Getenv("DB_USER")
    dbPassword := os.Getenv("DB_PASSWORD")
    dbName := os.Getenv("DB_NAME")
    dbHost := os.Getenv("DB_HOST")
    dbPort := os.Getenv("DB_PORT")
    if dbPort == "" {
        dbPort = "5432"
    }

    connStr := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable host=%s port=%s", dbUser, dbPassword, dbName, dbHost, dbPort)

    DB, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal("Erro ao abrir a conexão: ", err)
    }

    err = DB.Ping()
    if err != nil {
        log.Fatal("Erro ao se comunicar com o banco: ", err)
    }

    fmt.Println("Conexão com o PostgreSQL estabelecida com segurança via .env!")

    preparaBanco()
}

func preparaBanco() {
    DB.Exec("DROP TABLE IF EXISTS notifications")
    // Migração: as tabelas de evento foram criadas com UUID + FKs erradas. Recriamos com VARCHAR(50).
    DB.Exec("DROP TABLE IF EXISTS event_comments, event_responses, events CASCADE")
    // Migração: as direct_messages foram criadas com UUID + FKs erradas. Recriamos com VARCHAR(50).
    DB.Exec("DROP TABLE IF EXISTS direct_messages CASCADE")

    queries := []string{
        `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        department VARCHAR(50),
        avatar_color VARCHAR(20)
    )`,
        `CREATE TABLE IF NOT EXISTS posts (
            id VARCHAR(50) PRIMARY KEY,
            author_id VARCHAR(50) REFERENCES users(id),
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS comments (
            id VARCHAR(50) PRIMARY KEY,
            post_id VARCHAR(50) REFERENCES posts(id) ON DELETE CASCADE,
            author_id VARCHAR(50) REFERENCES users(id),
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS reactions (
            id SERIAL PRIMARY KEY,
            post_id VARCHAR(50) REFERENCES posts(id) ON DELETE CASCADE,
            user_id VARCHAR(50) REFERENCES users(id),
            emoji VARCHAR(10),
            UNIQUE(post_id, user_id, emoji)
        )`,
        `CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR(50) PRIMARY KEY,
            recipient_id VARCHAR(50) REFERENCES users(id),
            actor_id VARCHAR(50) REFERENCES users(id),
            type VARCHAR(20), -- 'comment' ou 'reaction'
            post_id VARCHAR(50) REFERENCES posts(id) ON DELETE CASCADE,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS events (
            id VARCHAR(50) PRIMARY KEY,
            creator_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            location TEXT,
            event_date TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS event_responses (
            id SERIAL PRIMARY KEY,
            event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
            user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
            status TEXT CHECK (status IN ('going', 'not_going')), -- 'vou' ou 'não vou'
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

            -- O SEGREDO: Garante que um par (evento, user) seja único
            UNIQUE(event_id, user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS event_comments (
            id VARCHAR(50) PRIMARY KEY,
            event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
            author_id VARCHAR(50) REFERENCES users(id),
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS direct_messages (
            id VARCHAR(50) PRIMARY KEY,
            sender_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            receiver_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            -- Soft-delete por lado: cada freguês esconde a sua cópia da mesa,
            -- a do outro fica intacta até ele também decidir esquecer.
            deleted_by_sender BOOLEAN DEFAULT FALSE,
            deleted_by_receiver BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`,
        `CREATE INDEX IF NOT EXISTS idx_dm_conversation ON direct_messages (sender_id, receiver_id)`,
    }

    for _, q := range queries {
        _, err := DB.Exec(q)
        if err != nil {
            log.Fatalf("Erro ao criar tabelas: %v", err)
        }
    }
}
