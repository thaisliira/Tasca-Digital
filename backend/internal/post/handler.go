package post

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"notification-api/internal/database"
	"notification-api/internal/id"
	"notification-api/internal/ws"
)

func ListarPostas(c *gin.Context) {
	query := `
		SELECT
    p.id, p.content, p.created_at, p.author_id, u.name, u.avatar_color,
    (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) as reaction_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count -- 👈 Novo contador
	FROM posts p
	JOIN users u ON p.author_id = u.id
	ORDER BY p.created_at DESC`

	rows, err := database.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao ler o balcão"})
		return
	}
	defer rows.Close()

	postas := []PostResponse{}
	for rows.Next() {
		var p PostResponse
		err := rows.Scan(
			&p.ID,
			&p.Content,
			&p.CreatedAt,
			&p.AuthorID,
			&p.AuthorName,
			&p.AuthorColor,
			&p.ReactionCount,
			&p.CommentCount,
		)
		if err != nil {
			fmt.Println("Erro no Scan:", err)
			continue
		}
		postas = append(postas, p)
	}
	c.JSON(http.StatusOK, postas)
}

func CriarPosta(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Quem é você? Faça login!"})
		return
	}

	var input struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A posta não pode estar vazia!"})
		return
	}

	postID := id.Generate()
	_, err := database.DB.Exec(
		"INSERT INTO posts (id, author_id, content) VALUES ($1, $2, $3)",
		postID, userID, input.Content,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "A posta caiu ao chão (erro no banco)"})
		return
	}

	var p PostResponse
	database.DB.QueryRow(`
		SELECT p.id, p.content, p.created_at, p.author_id, u.name, u.avatar_color,
			(SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) as reaction_count
		FROM posts p JOIN users u ON p.author_id = u.id
		WHERE p.id = $1`, postID,
	).Scan(&p.ID, &p.Content, &p.CreatedAt, &p.AuthorID, &p.AuthorName, &p.AuthorColor, &p.ReactionCount)

	ws.Broadcast(ws.SocketMessage{Type: "post.created", Payload: p})

	c.JSON(http.StatusCreated, p)
}

func DeletarPosta(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Identifica-te primeiro!"})
		return
	}

	postID := c.Param("id")

	var authorID string
	err := database.DB.QueryRow("SELECT author_id FROM posts WHERE id = $1", postID).Scan(&authorID)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Essa posta já não está no balcão"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar dono da posta"})
		return
	}

	if authorID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Não podes apagar a posta dos outros, carago!"})
		return
	}

	_, err = database.DB.Exec("DELETE FROM posts WHERE id = $1", postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "A posta ficou colada ao balcão (erro ao apagar)"})
		return
	}

	ws.Broadcast(ws.SocketMessage{Type: "post.deleted", Payload: gin.H{"post_id": postID}})

	c.Status(http.StatusNoContent)
}

func ListarPostasPublicas(c *gin.Context) {
	query := `
		SELECT
			p.content,
			u.name,
			u.avatar_color,
			(SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) AS reaction_count,
			(SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
		FROM posts p
		JOIN users u ON p.author_id = u.id
		ORDER BY p.created_at DESC
		LIMIT 2`

	rows, err := database.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Janela fechada"})
		return
	}
	defer rows.Close()

	publicPosts := []PublicPost{}
	for rows.Next() {
		var p PublicPost
		if err := rows.Scan(&p.Content, &p.AuthorName, &p.AvatarColor, &p.ReactionCount, &p.CommentCount); err != nil {
			fmt.Println("Erro no Scan de posta pública:", err)
			continue
		}
		publicPosts = append(publicPosts, p)
	}

	c.JSON(http.StatusOK, publicPosts)
}
