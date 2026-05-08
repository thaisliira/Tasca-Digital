package event

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"notification-api/internal/database"
	"notification-api/internal/id"
)

func ResponderEvento(c *gin.Context) {
	eventID := c.Param("id")
	userID := c.MustGet("user_id").(string)
	var input struct{ Status string `json:"status"` }

	if err := c.ShouldBindJSON(&input); err != nil || (input.Status != "going" && input.Status != "not_going") {
		c.JSON(400, gin.H{"error": "Ou vens ou não vens. Decide-te!"})
		return
	}

	query := `INSERT INTO event_responses (event_id, user_id, status) VALUES ($1, $2, $3)
	          ON CONFLICT (event_id, user_id) DO UPDATE SET status = EXCLUDED.status`

	_, err := database.DB.Exec(query, eventID, userID, input.Status)
	if err != nil {
		c.JSON(500, gin.H{"error": "O segurança barrou o teu voto"})
		return
	}
	c.JSON(200, gin.H{"message": "Voto registado!"})
}

func AtualizarEvento(c *gin.Context) {
	eventID := c.Param("id")
	userID := c.MustGet("user_id").(string)

	var creatorID string
	err := database.DB.QueryRow("SELECT creator_id FROM events WHERE id = $1", eventID).Scan(&creatorID)
	if err == sql.ErrNoRows {
		c.JSON(404, gin.H{"error": "Que evento? Isso não existe aqui."})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Erro ao verificar o evento"})
		return
	}
	if creatorID != userID {
		c.JSON(403, gin.H{"error": "Não podes editar a festa dos outros, carago!"})
		return
	}

	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Location    string `json:"location"`
		EventDate   string `json:"event_date"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}

	query := `UPDATE events
		SET title       = COALESCE(NULLIF($1, ''), title),
		    description = COALESCE(NULLIF($2, ''), description),
		    location    = COALESCE(NULLIF($3, ''), location),
		    event_date  = CASE WHEN $4 = '' THEN event_date ELSE $4::timestamptz END
		WHERE id = $5`
	if _, err := database.DB.Exec(query, input.Title, input.Description, input.Location, input.EventDate, eventID); err != nil {
		c.JSON(500, gin.H{"error": "Erro ao atualizar o evento"})
		return
	}

	c.JSON(200, gin.H{"message": "Evento atualizado!"})
}

func DeletarEvento(c *gin.Context) {
	eventID := c.Param("id")
	userID := c.MustGet("user_id").(string)

	var creatorID string
	err := database.DB.QueryRow("SELECT creator_id FROM events WHERE id = $1", eventID).Scan(&creatorID)
	if err == sql.ErrNoRows {
		c.JSON(404, gin.H{"error": "Que evento? Isso não existe aqui."})
		return
	}

	if creatorID != userID {
		c.JSON(403, gin.H{"error": "Não podes cancelar a festa dos outros, carago!"})
		return
	}

	database.DB.Exec("DELETE FROM events WHERE id = $1", eventID)
	c.JSON(200, gin.H{"message": "Evento varrido para baixo do tapete."})
}

func ListarEventos(c *gin.Context) {
	userID := c.MustGet("user_id").(string)

	query := `
		SELECT e.id, e.creator_id, e.title, e.description, e.location, e.event_date, u.name,
		COUNT(CASE WHEN r.status = 'going' THEN 1 END) as going,
		COUNT(CASE WHEN r.status = 'not_going' THEN 1 END) as not_going,
		COALESCE((SELECT status FROM event_responses WHERE event_id = e.id AND user_id = $1), '')
		FROM events e
		JOIN users u ON e.creator_id = u.id
		LEFT JOIN event_responses r ON e.id = r.event_id
		GROUP BY e.id, u.name ORDER BY e.event_date ASC`

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Não conseguimos ler a ementa de eventos"})
		return
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var e Event
		rows.Scan(&e.ID, &e.CreatorID, &e.Title, &e.Description, &e.Location, &e.EventDate, &e.CreatorName, &e.TotalGoing, &e.TotalNot, &e.MyStatus)
		events = append(events, e)
	}
	c.JSON(200, events)
}

func CriarEvento(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		Location    string `json:"location"`
		EventDate   string `json:"event_date" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Preenche os dados todos, ó nabo!"})
		return
	}

	eventID := id.Generate()
	query := `INSERT INTO events (id, creator_id, title, description, location, event_date)
	          VALUES ($1, $2, $3, $4, $5, $6)`

	_, err := database.DB.Exec(query, eventID, userID, input.Title, input.Description, input.Location, input.EventDate)
	if err != nil {
		c.JSON(500, gin.H{"error": "O quadro de giz partiu-se ao criar o evento"})
		return
	}

	c.JSON(201, gin.H{"id": eventID, "message": "Evento marcado no calendário!"})
}
