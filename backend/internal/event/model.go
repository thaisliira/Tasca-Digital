package event

import (
	"time"
)

type Event struct {
	ID          string    `json:"id"`
	CreatorID   string    `json:"creator_id"`
	CreatorName string    `json:"creator_name"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	EventDate   time.Time `json:"event_date"`
	TotalGoing  int       `json:"total_going"`
	TotalNot    int       `json:"total_not_going"`
	MyStatus    string    `json:"my_status"`
	CreatedAt   time.Time `json:"created_at"`
}

type Comment struct {
	ID          string    `json:"id"`
	AuthorName  string    `json:"author_name"`
	AuthorColor string    `json:"author_color"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"created_at"`
}