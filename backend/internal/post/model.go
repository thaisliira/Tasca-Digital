package post

import "time"

type PostResponse struct {
	ID            string    `json:"id"`
	Content       string    `json:"content"`
	CreatedAt     time.Time `json:"created_at"`
	AuthorName    string    `json:"author_name"`
	AuthorColor   string    `json:"author_color"`
	ReactionCount int       `json:"reaction_count"`
	AuthorID      string    `json:"author_id"`
	CommentCount  int       `json:"comment_count"`
}

type ReactionUpdate struct {
	PostID        string `json:"post_id"`
	ReactionCount int    `json:"reaction_count"`
	ActorID       string `json:"actor_id"`
	ActorName     string `json:"actor_name"`
	PostOwnerID   string `json:"post_owner_id"`
	Added         bool   `json:"added"`
}

type CommentResponse struct {
	ID          string    `json:"id"`
	PostID      string    `json:"post_id"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"created_at"`
	AuthorID    string    `json:"author_id"`
	AuthorName  string    `json:"author_name"`
	AuthorColor string    `json:"author_color"`
	PostOwnerID string    `json:"post_owner_id"`
}

type PublicPost struct {
	Content       string `json:"content"`
	AuthorName    string `json:"author_name"`
	AvatarColor   string `json:"avatar_color"`
	ReactionCount int    `json:"reaction_count"`
	CommentCount  int    `json:"comment_count"`
}
