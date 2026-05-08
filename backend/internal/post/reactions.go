package post

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"notification-api/internal/database"
	"notification-api/internal/ws"
)

func AlternarBrinde(c *gin.Context) {
	userID, _ := c.Get("user_id")
	postID := c.Param("id")
	emoji := "🍻"
	var exists bool
	queryCheck := `SELECT EXISTS(SELECT 1 FROM reactions WHERE post_id=$1 AND user_id=$2 AND emoji=$3)`
	database.DB.QueryRow(queryCheck, postID, userID, emoji).Scan(&exists)

	added := !exists
	if exists {
		database.DB.Exec("DELETE FROM reactions WHERE post_id=$1 AND user_id=$2 AND emoji=$3", postID, userID, emoji)
	} else {
		database.DB.Exec("INSERT INTO reactions (post_id, user_id, emoji) VALUES ($1, $2, $3)", postID, userID, emoji)
	}

	var count int
	database.DB.QueryRow("SELECT COUNT(*) FROM reactions WHERE post_id=$1", postID).Scan(&count)

	var actorName string
	database.DB.QueryRow("SELECT name FROM users WHERE id=$1", userID).Scan(&actorName)

	var postOwnerID string
	database.DB.QueryRow("SELECT author_id FROM posts WHERE id=$1", postID).Scan(&postOwnerID)

	ws.Broadcast(ws.SocketMessage{
		Type: "reaction.updated",
		Payload: ReactionUpdate{
			PostID:        postID,
			ReactionCount: count,
			ActorID:       userID.(string),
			ActorName:     actorName,
			PostOwnerID:   postOwnerID,
			Added:         added,
		},
	})

	c.Status(http.StatusOK)
}
