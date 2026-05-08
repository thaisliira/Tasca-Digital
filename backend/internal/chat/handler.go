package chat

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"notification-api/internal/database"
	"notification-api/internal/id"
	"notification-api/internal/ws"
)

func BuscarConversa(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	friendID := c.Param("friendID")

	query := `
		SELECT id, sender_id, content, created_at
		FROM direct_messages
		WHERE (sender_id = $1 AND receiver_id = $2 AND deleted_by_sender = FALSE)
		   OR (sender_id = $2 AND receiver_id = $1 AND deleted_by_receiver = FALSE)
		ORDER BY created_at ASC`

	rows, err := database.DB.Query(query, userID, friendID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "O estafeta perdeu os bilhetes pelo caminho..."})
		return
	}
	defer rows.Close()

	conversa := []DirectMessage{}

	for rows.Next() {
		var msg DirectMessage
		err := rows.Scan(&msg.ID, &msg.SenderID, &msg.Content, &msg.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao ler a letra do remetente"})
			return
		}
		conversa = append(conversa, msg)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "A conversa ficou a meio..."})
		return
	}

	c.JSON(http.StatusOK, conversa)
}

func EnviarMensagem(c *gin.Context) {
	senderID := c.MustGet("user_id").(string)

	var input struct {
		ReceiverID string `json:"receiver_id" binding:"required"`
		Content    string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tens de dizer para quem é e o que queres dizer, carago!"})
		return
	}

	if senderID == input.ReceiverID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Não comeces a falar sozinho, que o pessoal ainda pensa que bebeste demais!"})
		return
	}

	msgID := id.Generate()
	createdAt := time.Now()
	query := `
		INSERT INTO direct_messages (id, sender_id, receiver_id, content, created_at)
		VALUES ($1, $2, $3, $4, $5)`

	if _, err := database.DB.Exec(query, msgID, senderID, input.ReceiverID, input.Content, createdAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "O estafeta tropeçou e a mensagem não chegou."})
		return
	}

	ws.BroadcastTo([]string{senderID, input.ReceiverID}, ws.SocketMessage{
		Type: "dm.created",
		Payload: gin.H{
			"id":          msgID,
			"sender_id":   senderID,
			"receiver_id": input.ReceiverID,
			"content":     input.Content,
			"created_at":  createdAt,
		},
	})

	c.JSON(http.StatusCreated, gin.H{
		"id":         msgID,
		"created_at": createdAt,
		"message":    "Bilhete entregue com sucesso!",
	})
}

func ApagarConversa(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	friendID := c.Param("friendID")

	if _, err := database.DB.Exec(
		`UPDATE direct_messages
		 SET deleted_by_sender = TRUE
		 WHERE sender_id = $1 AND receiver_id = $2`,
		userID, friendID,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Não conseguimos limpar a tua mesa..."})
		return
	}

	if _, err := database.DB.Exec(
		`UPDATE direct_messages
		 SET deleted_by_receiver = TRUE
		 WHERE sender_id = $1 AND receiver_id = $2`,
		friendID, userID,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Não conseguimos limpar a tua mesa..."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Conversa esquecida (só do teu lado)."})
}
