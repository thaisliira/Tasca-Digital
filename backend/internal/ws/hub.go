package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

type SocketMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type envelope struct {
	msg     SocketMessage
	userIDs map[string]bool
}

type Hub struct {
	clientes  map[*websocket.Conn]string
	broadcast chan envelope
	mu        sync.Mutex
}

var hub = Hub{
	clientes:  make(map[*websocket.Conn]string),
	broadcast: make(chan envelope),
}

func init() {
	go func() {
		for {
			env := <-hub.broadcast
			hub.mu.Lock()
			for cliente, userID := range hub.clientes {
				if env.userIDs != nil && !env.userIDs[userID] {
					continue
				}
				err := cliente.WriteJSON(env.msg)
				if err != nil {
					cliente.Close()
					delete(hub.clientes, cliente)
				}
			}
			hub.mu.Unlock()
		}
	}()
}

func Broadcast(msg SocketMessage) {
	hub.broadcast <- envelope{msg: msg}
}

func BroadcastTo(userIDs []string, msg SocketMessage) {
	set := make(map[string]bool, len(userIDs))
	for _, id := range userIDs {
		set[id] = true
	}
	hub.broadcast <- envelope{msg: msg, userIDs: set}
}

func register(conn *websocket.Conn, userID string) {
	hub.mu.Lock()
	hub.clientes[conn] = userID
	hub.mu.Unlock()
}
