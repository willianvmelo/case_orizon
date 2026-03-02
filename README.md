# To-Do List --- Fullstack (React + Django REST)

Aplicação web de gerenciamento de tarefas com autenticação, categorias,
compartilhamento entre usuários, filtros, paginação e containerização
via Docker.

------------------------------------------------------------------------

## Tecnologias Utilizadas

### Backend

-   Python 3.12
-   Django + Django REST Framework
-   PostgreSQL 16
-   JWT Authentication (Djoser + SimpleJWT)
-   django-filter
-   pytest
-   Docker

### Frontend

-   React 18 + Vite
-   TypeScript
-   React Router
-   Axios
-   Docker

### DevOps

-   Docker & Docker Compose
-   GitHub Actions (CI)

------------------------------------------------------------------------

## Funcionalidades

### Autenticação

-   Registro de usuário
-   Login via JWT
-   Logout
-   Proteção de rotas

### Categorias

-   CRUD de categorias por usuário
-   Relacionamento com tarefas

### Tarefas

-   CRUD completo
-   Título, descrição, status, categoria
-   Marcar como concluída/pendente

### Compartilhamento

-   Compartilhar tarefas por e-mail
-   Usuários compartilhados podem visualizar
-   Apenas o dono pode compartilhar/remover

### Filtros e Busca

-   Por status
-   Por texto (título/descrição)
-   Ordenação por vários campos

### Paginação

-   Paginação via DRF

------------------------------------------------------------------------

## Arquitetura

    case_orizon/
    ├── backend/
    │   ├── core/
    │   ├── tasks/
    │   ├── categories/
    │   ├── .env.example
    │   └── ...
    │
    ├── frontend/
    │   ├── src/
    │   ├── .env.example
    │   └── ...
    │
    ├── docker-compose.yml
    ├── docker-compose.dev.yml
    └── README.md

------------------------------------------------------------------------

## Como executar

### Pré-requisitos

-   Docker
-   Docker Compose plugin (docker compose)
-   Git

------------------------------------------------------------------------

## Variáveis de Ambiente

O projeto utiliza arquivos `.env`. Exemplos prontos são fornecidos:

-   `backend/.env.example`
-   `frontend/.env.example`

Copie-os antes de executar:

``` bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

------------------------------------------------------------------------

### Backend --- `backend/.env`

    # Django
    DJANGO_SECRET_KEY=dev-secret-key
    DJANGO_DEBUG=1
    DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

    # PostgreSQL
    POSTGRES_DB=todo
    POSTGRES_USER=todo
    POSTGRES_PASSWORD=todo
    POSTGRES_HOST=db
    POSTGRES_PORT=5432

    # CORS
    CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

------------------------------------------------------------------------

### Frontend --- `frontend/.env`

    VITE_API_URL=http://localhost:8000

------------------------------------------------------------------------

## Ambiente de Desenvolvimento (recomendado)

Executa com hot reload:

    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

### Acessos

Frontend: http://localhost:5173\
Backend: http://localhost:8000

------------------------------------------------------------------------

## Ambiente padrão

    docker compose up --build

------------------------------------------------------------------------

## Criar usuário (via interface)

Abra:

http://localhost:5173/auth

------------------------------------------------------------------------

## Criar usuário (via API)

    curl -X POST http://localhost:8000/api/auth/users/   -H "Content-Type: application/json"   -d '{"username":"alice","email":"alice@example.com","password":"pass12345","re_password":"pass12345"}'

------------------------------------------------------------------------

## Obter token JWT

    curl -X POST http://localhost:8000/api/auth/jwt/create/   -H "Content-Type: application/json"   -d '{"username":"alice","password":"pass12345"}'

------------------------------------------------------------------------

## Testes do Backend

    docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend pytest

------------------------------------------------------------------------

## Principais Endpoints

### Autenticação

-   POST /api/auth/users/
-   POST /api/auth/jwt/create/
-   POST /api/auth/jwt/refresh/

### Categorias

-   GET /api/categories/
-   POST /api/categories/
-   PUT /api/categories/{id}/
-   DELETE /api/categories/{id}/

### Tarefas

-   GET /api/tasks/
-   POST /api/tasks/
-   PUT /api/tasks/{id}/
-   DELETE /api/tasks/{id}/

### Compartilhamento

-   POST /api/tasks/{id}/share/
-   POST /api/tasks/{id}/unshare/

------------------------------------------------------------------------

## Decisões de Design

### Backend

-   Django REST Framework pela robustez
-   JWT stateless para autenticação
-   Isolamento por usuário (owner)
-   Compartilhamento via Many-to-Many
-   Filtros e paginação nativos do DRF

### Frontend

-   Vite pela simplicidade e velocidade
-   TypeScript para segurança de tipos
-   Layout com sidebar para criação e painel principal para listagem

### Docker

-   Serviços separados (db, backend, frontend)
-   Compose específico para desenvolvimento

------------------------------------------------------------------------

## Boas práticas aplicadas

-   SOLID (separação por apps)
-   DRY (reuso de código)
-   KISS (arquitetura simples)
-   Tipagem no frontend
-   Testes automatizados no backend

------------------------------------------------------------------------

## CI

Integração contínua via GitHub Actions executa:

-   Instalação de dependências
-   Execução dos testes
-   Verificação do build

------------------------------------------------------------------------

## Deploy

Compatível com:

-   AWS (EC2, ECS, Lightsail)
-   Azure
-   Railway
-   Render
-   Fly.io

------------------------------------------------------------------------

Projeto desenvolvido como parte de um teste técnico.
