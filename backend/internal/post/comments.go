package post

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"notification-api/internal/database"
	"notification-api/internal/id"
	"notification-api/internal/ws"
)

func ListarPalpites(c *gin.Context) {
	postID := c.Param("id")

	rows, err := database.DB.Query(`
		SELECT c.id, c.post_id, c.content, c.created_at, c.author_id, u.name, u.avatar_color, p.author_id
		FROM comments c
		JOIN users u ON c.author_id = u.id
		JOIN posts p ON c.post_id = p.id
		WHERE c.post_id = $1
		ORDER BY c.created_at ASC`, postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao ler palpites"})
		return
	}
	defer rows.Close()

	palpites := []CommentResponse{}
	for rows.Next() {
		var p CommentResponse
		if err := rows.Scan(&p.ID, &p.PostID, &p.Content, &p.CreatedAt, &p.AuthorID, &p.AuthorName, &p.AuthorColor, &p.PostOwnerID); err != nil {
			fmt.Println("Erro no Scan de palpite:", err)
			continue
		}
		palpites = append(palpites, p)
	}
	c.JSON(http.StatusOK, palpites)
}

func CriarPalpite(c *gin.Context) {
	userID, _ := c.Get("user_id")
	postID := c.Param("id")

	var input struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O palpite não pode estar vazio!"})
		return
	}

	commentID := id.Generate()
	_, err := database.DB.Exec(
		"INSERT INTO comments (id, post_id, author_id, content) VALUES ($1, $2, $3, $4)",
		commentID, postID, userID, input.Content,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "O palpite perdeu-se no caminho"})
		return
	}

	var p CommentResponse
	err = database.DB.QueryRow(`
		SELECT c.id, c.post_id, c.content, c.created_at, c.author_id, u.name, u.avatar_color, posts.author_id
		FROM comments c
		JOIN users u ON c.author_id = u.id
		JOIN posts ON c.post_id = posts.id
		WHERE c.id = $1`, commentID,
	).Scan(&p.ID, &p.PostID, &p.Content, &p.CreatedAt, &p.AuthorID, &p.AuthorName, &p.AuthorColor, &p.PostOwnerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Palpite salvo mas não conseguimos lê-lo de volta"})
		return
	}

	ws.Broadcast(ws.SocketMessage{Type: "comment.created", Payload: p})

	c.JSON(http.StatusCreated, p)
}

func DeletarComentario(c *gin.Context) {
    commentID := c.Param("commentId")
    userID := c.MustGet("user_id").(string)

    var createdAt time.Time
    var authorID string

    err := database.DB.QueryRow("SELECT author_id, created_at FROM comments WHERE id = $1", commentID).Scan(&authorID, &createdAt)
    if err == sql.ErrNoRows {
        c.JSON(404, gin.H{"error": "Que palpite? Isso já não está aqui."})
        return
    }
    if err != nil {
        c.JSON(500, gin.H{"error": "Erro ao procurar o palpite"})
        return
    }

    if authorID != userID {
        c.JSON(403, gin.H{"error": "Não podes apagar o que não escreveste!"})
        return
    }

    if time.Since(createdAt) > 15*time.Minute {
        c.JSON(403, gin.H{"error": "O tempo de te arrependeres já passou. Agora aguenta!"})
        return
    }

    database.DB.Exec("DELETE FROM comments WHERE id = $1", commentID)
    c.JSON(200, gin.H{"message": "Bitaite removido a tempo."})
}
