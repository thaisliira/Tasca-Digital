package routes

import (
	"notification-api/internal/auth"
	"notification-api/internal/chat"
	"notification-api/internal/event"
	"notification-api/internal/post"
	"notification-api/internal/user"
	"notification-api/internal/ws"

	"github.com/gin-gonic/gin"
)

func ConfiguraRotas(router *gin.Engine) {
	router.POST("/signup", auth.Signup)
	router.POST("/login", auth.Login)
	router.POST("/logout", auth.Logout)
	router.GET("/posts/public", post.ListarPostasPublicas)

	authGroup := router.Group("/")
	authGroup.Use(auth.Middleware())
	{
		authGroup.GET("/ws", ws.HandleWebSocket)

		authGroup.GET("/me", auth.Me)
		authGroup.GET("/users", user.ListarFregueses)
		authGroup.GET("/posts", post.ListarPostas)
		authGroup.POST("/posts", post.CriarPosta)
		authGroup.DELETE("/posts/:id", post.DeletarPosta)
		authGroup.POST("/posts/:id/reactions", post.AlternarBrinde)
		authGroup.GET("/posts/:id/comments", post.ListarPalpites)
		authGroup.POST("/posts/:id/comments", post.CriarPalpite)
		authGroup.PUT("/me", user.AtualizarPerfil)
		authGroup.DELETE("/posts/:id/comments/:commentId", post.DeletarComentario)

		authGroup.POST("/events", event.CriarEvento)
		authGroup.GET("/events", event.ListarEventos)
		authGroup.PUT("/events/:id", event.AtualizarEvento)
		authGroup.DELETE("/events/:id", event.DeletarEvento)
		authGroup.POST("/events/:id/responses", event.ResponderEvento)
		authGroup.POST("/events/:id/comments", event.CriarComentarioEvento)
		authGroup.GET("/events/:id/comments", event.ListarComentariosEvento)

		authGroup.POST("/messages", chat.EnviarMensagem)
		authGroup.GET("/messages/:friendID", chat.BuscarConversa)
		authGroup.DELETE("/messages/:friendID", chat.ApagarConversa)
	}
}
