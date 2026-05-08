package user

type User struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	PasswordHash string `json:"-"`
	Department   string `json:"department"`
	AvatarColor  string `json:"avatar_color"`
}
