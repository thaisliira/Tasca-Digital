<div align="center">

# 💬 Tasca Digital

**_Aqui manda-se a posta e bate-se o copo._**

Uma rede social interna em formato de tasca portuguesa.

[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## Ementa

- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Início Rápido (Docker)](#início-rápido-docker)
- [Desenvolvimento Local](#desenvolvimento-local)
- [API](#api)
- [Eventos em Tempo Real (WebSocket)](#eventos-em-tempo-real-websocket)
- [Notas](#notas)
- [Licença](#licença)

---

## Stack

| Camada | Tecnologias |
|---|---|
| **Backend** | Go 1.26 · [Gin](https://github.com/gin-gonic/gin) · [gorilla/websocket](https://github.com/gorilla/websocket) · JWT (cookie HttpOnly) · bcrypt |
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · date-fns |
| **Banco** | PostgreSQL 15 |
| **Infra** | Docker · docker-compose |

---

## Funcionalidades

- **Postas (Feed)** — criar, apagar (só o autor), reagir e comentar.
- **Quadro de Avisos (Eventos)** — onde a malta se organiza com RSVP (vou / bazei) e pode comentar.
- **O Reservado (DM)** — mensagens privadas em tempo real, com _soft-delete_ por lado (a conversa é apagada apenas pro user que decidiu apagar).
- **Alertas de Balcão (Toasts)** — avisos instantâneos via WebSocket quando há reações ou comentários novos, sem acumular histórico.
- **Ficha do Freguês (Perfil)** — nome, ofício, cor do avatar e troca de senha.
- **Vitrine Pública** — pré-visualização desfocada dos posts mais recentes para quem ainda não entrou.

---

## Estrutura do Projeto

```text
.
├── backend/                 # API em Go
│   ├── cmd/api/             # Ponto de entrada (main.go)
│   └── internal/
│       ├── auth/            # Login, signup, JWT, middleware
│       ├── chat/            # Mensagens diretas (DM)
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

## Início Rápido (Docker)

> **Pré-requisitos:** Docker e Docker Compose.

```bash
# 1. Clonar o repositório
git clone https://github.com/thaisliira/Tasca-Digital.git
cd Tasca-Digital

# 2. Copiar o exemplo de ambiente e ajustar o JWT_SECRET
cp .env.example .env

# 3. Subir os três serviços (db, backend, frontend)
docker-compose up --build
```

Acesse:

| Serviço   | URL                          |
|-----------|------------------------------|
| Frontend  | <http://localhost:3000>      |
| Backend   | <http://localhost:8080>      |
| Postgres  | `localhost:5433` (host) → `5432` (container) |

Para parar:

```bash
docker-compose down       # mantém os dados no volume
docker-compose down -v    # apaga também o volume do Postgres
```

---

## Desenvolvimento Local

### Backend

```bash
cd backend

# Sobe apenas o Postgres do compose, ou usa um Postgres local:
# docker-compose up db

export DB_USER=user DB_PASSWORD=password DB_NAME=notification_db
export DB_HOST=localhost DB_PORT=5433
export JWT_SECRET=qualquer_coisa_grande
export APP_ENV=development

go mod download
go run ./cmd/api
```

API em <http://localhost:8080>.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App em <http://localhost:3000>. O cliente aponta para `http://localhost:8080` quando corre no browser.

---

## API

Todas as rotas autenticadas exigem o cookie `auth_token` (JWT em HttpOnly).

### Públicas

| Método | Rota              | Descrição                       |
|--------|-------------------|---------------------------------|
| `POST` | `/signup`         | Criar conta (devolve cookie)    |
| `POST` | `/login`          | Entrar (devolve cookie)         |
| `POST` | `/logout`         | Sair (limpa cookie)             |
| `GET`  | `/posts/public`   | Vitrine: 2 postas mais recentes |

<details>
<summary><strong>Autenticadas</strong> (clica para expandir)</summary>

#### Utilizador

| Método | Rota     | Descrição                              |
|--------|----------|----------------------------------------|
| `GET`  | `/me`    | Dados do utilizador logado             |
| `PUT`  | `/me`    | Atualizar nome / ofício / cor / senha  |
| `GET`  | `/users` | Listar fregueses (excepto o próprio)   |

#### Postas e palpites

| Método   | Rota                                         | Descrição                          |
|----------|----------------------------------------------|------------------------------------|
| `GET`    | `/posts`                                     | Listar postas                      |
| `POST`   | `/posts`                                     | Criar posta                        |
| `DELETE` | `/posts/:id`                                 | Apagar posta (só o autor)          |
| `POST`   | `/posts/:id/reactions`                       | Brindar / desbrindar               |
| `GET`    | `/posts/:id/comments`                        | Listar palpites                    |
| `POST`   | `/posts/:id/comments`                        | Criar palpite                      |
| `DELETE` | `/posts/:id/comments/:commentId`             | Apagar palpite (até 15 min depois) |

#### Eventos

| Método   | Rota                       | Descrição                       |
|----------|----------------------------|---------------------------------|
| `GET`    | `/events`                  | Listar eventos                  |
| `POST`   | `/events`                  | Criar evento                    |
| `PUT`    | `/events/:id`              | Atualizar evento (só criador)   |
| `DELETE` | `/events/:id`              | Apagar evento (só criador)      |
| `POST`   | `/events/:id/responses`    | Responder vou / não vou         |
| `GET`    | `/events/:id/comments`     | Listar comentários              |
| `POST`   | `/events/:id/comments`     | Criar comentário                |

#### Mensagens diretas

| Método   | Rota                       | Descrição                                  |
|----------|----------------------------|--------------------------------------------|
| `GET`    | `/messages/:friendID`      | Buscar conversa                            |
| `POST`   | `/messages`                | Enviar DM                                  |
| `DELETE` | `/messages/:friendID`      | Esquecer conversa (só do teu lado)         |

#### WebSocket

| Método | Rota   | Descrição                |
|--------|--------|--------------------------|
| `GET`  | `/ws`  | Upgrade para WebSocket   |

</details>

---

## Eventos em Tempo Real (WebSocket)

O servidor emite mensagens com o formato `{ type, payload }`:

| Evento              | Quando dispara                                        | Alcance                              |
|---------------------|-------------------------------------------------------|--------------------------------------|
| `post.created`      | Posta nova é publicada                                | Todos os fregueses ligados           |
| `post.deleted`      | Posta é removida pelo autor                           | Todos os fregueses ligados           |
| `reaction.updated`  | Brinde é adicionado / removido                        | Todos os fregueses ligados           |
| `comment.created`   | Palpite novo numa posta                               | Todos os fregueses ligados           |
| `dm.created`        | Mensagem direta enviada                               | Apenas remetente e destinatário      |

---

## Notas

- O backend executa `DROP TABLE` em algumas tabelas no arranque para garantir o esquema certo. **Não use em produção sem trocar essa lógica por migrações reais** (Goose, Atlas, golang-migrate, etc.).
- As credenciais do Postgres no `docker-compose.yml` são valores de desenvolvimento. Em produção, mova-as para variáveis de ambiente / secrets.
- _Soft-delete_ das DMs é por lado: ao apagar, só desaparecem do teu histórico — a outra pessoa continua a ver até também apagar.
- O cookie JWT é `HttpOnly` e usa `Secure` apenas quando `APP_ENV=production`.

---

## Licença

[MIT](LICENSE) — sinta-se à vontade para forçar de garfada.
