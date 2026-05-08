package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"notification-api/internal/database"
)

type Freguês struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Department  string `json:"department"`
	AvatarColor string `json:"avatar_color"`
}

func ListarFregueses(c *gin.Context) {
	userID := c.MustGet("user_id").(string)

	rows, err := database.DB.Query(
		`SELECT id, name, COALESCE(department, ''), COALESCE(avatar_color, '')
		 FROM users
		 WHERE id <> $1
		 ORDER BY name ASC`,
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Não conseguimos espreitar a freguesia"})
		return
	}
	defer rows.Close()

	fregueses := []Freguês{}
	for rows.Next() {
		var f Freguês
		if err := rows.Scan(&f.ID, &f.Name, &f.Department, &f.AvatarColor); err != nil {
			continue
		}
		fregueses = append(fregueses, f)
	}
	c.JSON(http.StatusOK, fregueses)
}

func AtualizarPerfil(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var input struct {
		Name            string `json:"name"`
		Department      string `json:"department"`
		AvatarColor     string `json:"avatar_color"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if input.Name != "" || input.Department != "" || input.AvatarColor != "" {
		_, err := database.DB.Exec(
			`UPDATE users
			 SET name          = COALESCE(NULLIF($1, ''), name),
			     department    = COALESCE(NULLIF($2, ''), department),
			     avatar_color  = COALESCE(NULLIF($3, ''), avatar_color)
			 WHERE id = $4`,
			input.Name, input.Department, input.AvatarColor, userID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar dados"})
			return
		}
	}

	if input.CurrentPassword != "" && input.NewPassword != "" {
		var passwordHash string
		if err := database.DB.QueryRow("SELECT password_hash FROM users WHERE id = $1", userID).Scan(&passwordHash); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao validar senha atual"})
			return
		}

		if !CheckPasswordHash(input.CurrentPassword, passwordHash) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha atual incorreta"})
			return
		}

		newHash, err := HashPassword(input.NewPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar nova senha"})
			return
		}
		if _, err := database.DB.Exec("UPDATE users SET password_hash = $1 WHERE id = $2", newHash, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao guardar nova senha"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Perfil atualizado com sucesso!"})
}
