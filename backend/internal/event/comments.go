package event

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"notification-api/internal/database"
	"notification-api/internal/id"
)

func ListarComentariosEvento(c *gin.Context) {
	eventID := c.Param("id")

	rows, err := database.DB.Query(`
		SELECT c.id, u.name, u.avatar_color, c.content, c.created_at
		FROM event_comments c
		JOIN users u ON c.author_id = u.id
		WHERE c.event_id = $1
		ORDER BY c.created_at ASC`, eventID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Não conseguimos ler os bitaites do evento"})
		return
	}
	defer rows.Close()

	comentarios := []Comment{}
	for rows.Next() {
		var ct Comment
		if err := rows.Scan(&ct.ID, &ct.AuthorName, &ct.AuthorColor, &ct.Content, &ct.CreatedAt); err != nil {
			fmt.Println("Erro no Scan de comentário de evento:", err)
			continue
		}
		comentarios = append(comentarios, ct)
	}
	c.JSON(200, comentarios)
}

func CriarComentarioEvento(c *gin.Context) {
	eventID := c.Param("id")
	userID := c.MustGet("user_id").(string)
	var input struct { Content string `json:"content" binding:"required"` }

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Manda um bitaite com conteúdo!"})
		return
	}

	commentID := id.Generate()
	query := `INSERT INTO event_comments (id, event_id, author_id, content) VALUES ($1, $2, $3, $4)`
	_, err := database.DB.Exec(query, commentID, eventID, userID, input.Content)
	if err != nil {
		c.JSON(500, gin.H{"error": "A caneta falhou ao escrever o comentário"})
		return
	}
	c.JSON(201, gin.H{"message": "Bitaite enviado para a mesa!"})
}