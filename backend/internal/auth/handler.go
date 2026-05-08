package auth

import (
	"database/sql"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"notification-api/internal/database"
	"notification-api/internal/id"
	"notification-api/internal/user"
)

func isProduction() bool {
	return os.Getenv("APP_ENV") == "production"
}

func setAuthCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", token, 3600*24, "/", "", isProduction(), true)
}

type signupInput struct {
	Name        string `json:"name" binding:"required,min=4"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	Department  string `json:"department"`
	AvatarColor string `json:"avatar_color"`
}

func Signup(c *gin.Context) {
	var input signupInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := user.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha"})
		return
	}

	uid := id.Generate()
	_, err = database.DB.Exec(
		`INSERT INTO users (id, name, email, password_hash, department, avatar_color)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		uid, input.Name, input.Email, hash, input.Department, input.AvatarColor,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email já cadastrado"})
		return
	}

	token, err := GenerateToken(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}
	setAuthCookie(c, token)

	c.JSON(http.StatusCreated, user.User{
		ID:          uid,
		Name:        input.Name,
		Email:       input.Email,
		Department:  input.Department,
		AvatarColor: input.AvatarColor,
	})
}

type loginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var input loginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var u user.User
	err := database.DB.QueryRow(
		`SELECT id, name, email, password_hash, department, avatar_color FROM users WHERE email = $1`,
		input.Email,
	).Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Department, &u.AvatarColor)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro no banco de dados"})
		return
	}

	if !user.CheckPasswordHash(input.Password, u.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
		return
	}

	token, err := GenerateToken(u.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}
	setAuthCookie(c, token)

	c.JSON(http.StatusOK, u)
}

func Logout(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", "", -1, "/", "", isProduction(), true)
	c.JSON(http.StatusOK, gin.H{"message": "Logout realizado"})
}

func Me(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Não autorizado"})
		return
	}

	var u user.User
	err := database.DB.QueryRow(
		`SELECT id, name, email, department, avatar_color FROM users WHERE id = $1`,
		userID,
	).Scan(&u.ID, &u.Name, &u.Email, &u.Department, &u.AvatarColor)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
		return
	}

	c.JSON(http.StatusOK, u)
}
