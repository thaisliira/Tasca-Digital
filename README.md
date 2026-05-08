# 🍷 Tasca Digital

> Aqui manda-se a posta e bate-se o copo.

Uma rede social interna em formato de tasca portuguesa: posta o que te vai na alma, brinda nas postas dos colegas, marca eventos no quadro e fala em privado no reservado.

---

## 📜 Ementa
- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar (Docker)](#como-rodar-docker--recomendado)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [API — Visão Geral](#api--visão-geral)
- [WebSockets & Toasts](#websockets--toasts)

---

## 🛠️ Stack

**Backend**
- Go 1.26 + [Gin](https://github.com/gin-gonic/gin)
- PostgreSQL 15
- WebSockets ([gorilla/websocket](https://github.com/gorilla/websocket)) para tempo real
- JWT em cookie HttpOnly
- bcrypt para senhas

**Frontend**
- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- TypeScript em modo estrito
- date-fns

**Infra**
- Docker + docker-compose

---

## 🎯 Funcionalidades

- **Postas (Feed)** — Criar, apagar (só o autor), brindar 🍻 e dar palpites 💬.
  - *Detalhe UI:* O placeholder oficial da casa é: *"Manda uma posta de pescada, se faz favor..."*
- **Quadro de Avisos (Eventos)** — Onde a malta se organiza com RSVP (vou / bazei) e comentários.
- **O Reservado (DM)** — Mensagens privadas em tempo real. Conta com *soft-delete* por lado (limpa o teu canto da mesa sem apagar a conversa do outro).
- **Alertas de Balcão (Toasts)** — Recebes avisos instantâneos via WebSocket quando há brindes ou palpites novos, sem acumular histórico.
- **Ficha do Freguês (Perfil)** — Nome, ofício, cor da carica (avatar) e troca de senha.
- **Vitrine Pública** — Pré-visualização desfocada das postas mais recentes para quem ainda não entrou (Login/Signup).

---

## 📂 Estrutura do projeto

```text
.
├── backend/                 # API em Go
│   ├── cmd/api/             # Ponto de entrada (main.go)
│   └── internal/
│       ├── auth/            # Login, signup, JWT, middleware
│       ├── chat/            # Mensagens directas (DM)
│       ├── database/        # Conexão e migrações
│       ├── event/           # Eventos, respostas, comentários
│       ├── id/              # Geração de IDs aleatórios
│       ├── middleware/      # CORS
│       ├── post/            # Postas, comentários, reactions
│       ├── routes/          # Registo de rotas
│       ├── user/            # Perfil, hashing de senha
│       └── ws/              # Hub de WebSocket
├── frontend/                # App Next.js
│   └── src/
│       ├── app/             # Páginas (App Router)
│       │   ├── components/  # Componentes partilhados
│       │   ├── dashboard/   # Feed (O Balcão)
│       │   ├── events/      # Quadro de avisos
│       │   ├── messages/    # Reservado (DMs)
│       │   ├── settings/    # Ficha do freguês
│       │   ├── login/
│       │   └── signup/
│       └── lib/             # Clientes de API e auth
├── docker-compose.yml
└── .env.example
```

---

## Como rodar (Docker — recomendado)

Pré-requisitos: Docker e Docker Compose.

```bash
# 1. Copia o exemplo de ambiente e ajusta o JWT_SECRET
cp .env.example .env

# 2. Sobe os três serviços (db, backend, frontend)
docker-compose up --build
```

Depois é só abrir:

- Frontend → http://localhost:3000
- Backend  → http://localhost:8080
- Postgres → localhost:5433 (mapeado para 5432 dentro do container)

Para parar:

```bash
docker-compose down            # mantém os dados no volume
docker-compose down -v         # apaga também o volume do Postgres
```

---

## Desenvolvimento local (sem Docker)

### Backend

```bash
cd backend

# Postgres precisa estar rodando localmente — ou use só o serviço db do compose:
# docker-compose up db

# Variáveis de ambiente (cria um .env na raiz do backend ou exporta)
export DB_USER=user DB_PASSWORD=password DB_NAME=notification_db
export DB_HOST=localhost DB_PORT=5433
export JWT_SECRET=qualquer_coisa_grande
export APP_ENV=development

go mod download
go run ./cmd/api
```

A API fica em `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App em `http://localhost:3000`. O cliente já aponta para `http://localhost:8080` quando corre no browser.

---

## API — visão geral

Todas as rotas autenticadas exigem o cookie `auth_token` (JWT em HttpOnly).

### Públicas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/signup` | Criar conta (devolve cookie) |
| `POST` | `/login` | Entrar (devolve cookie) |
| `POST` | `/logout` | Sair (limpa cookie) |
| `GET`  | `/posts/public` | Vitrine: 2 postas mais recentes |

### Autenticadas

| Método | Rota | Descrição |
|---|---|---|
| `GET`  | `/me` | Dados do utilizador logado |
| `PUT`  | `/me` | Atualizar nome/ofício/cor/senha |
| `GET`  | `/users` | Listar fregueses (excepto o próprio) |
| `GET`  | `/posts` | Listar postas |
| `POST` | `/posts` | Criar posta |
| `DELETE` | `/posts/:id` | Apagar posta (só o autor) |
| `POST` | `/posts/:id/reactions` | Brindar / desbrindar |
| `GET`  | `/posts/:id/comments` | Listar palpites |
| `POST` | `/posts/:id/comments` | Criar palpite |
| `DELETE` | `/posts/:id/comments/:commentId` | Apagar palpite (até 15 min depois) |
| `GET`  | `/events` | Listar eventos |
| `POST` | `/events` | Criar evento |
| `PUT`  | `/events/:id` | Atualizar evento (só criador) |
| `DELETE` | `/events/:id` | Apagar evento (só criador) |
| `POST` | `/events/:id/responses` | Responder vou / não vou |
| `GET`  | `/events/:id/comments` | Listar comentários |
| `POST` | `/events/:id/comments` | Criar comentário |
| `GET`  | `/messages/:friendID` | Buscar conversa |
| `POST` | `/messages` | Enviar DM |
| `DELETE` | `/messages/:friendID` | Esquecer conversa (só do teu lado) |
| `GET`  | `/ws` | Upgrade para WebSocket |

### Eventos WebSocket

O servidor emite mensagens com o formato `{ type, payload }`:

- `post.created`, `post.deleted`
- `reaction.updated`
- `comment.created`
- `dm.created` (privado, só ao remetente e destinatário)

---

## Notas

- O backend faz `DROP TABLE` em algumas tabelas no arranque para garantir o esquema certo. **Não use em produção sem trocar essa lógica por migrações reais.**
- As credenciais do Postgres no `docker-compose.yml` são valores de desenvolvimento. Em produção, mova-as também para variáveis de ambiente.
- Soft-delete das DMs é por lado: ao apagar, só desaparecem do teu histórico — a outra pessoa continua a ver até também apagar.
