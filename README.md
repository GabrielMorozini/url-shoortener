# URL Shortener

Encurtador de URL com **Laravel** (API), **React + TypeScript** (interface) e **MySQL**, tudo rodando em **Docker Compose**.

Você cola uma URL longa, a API gera um código de 6 caracteres e devolve um link curto. Ao acessar o link curto, a API conta o clique e redireciona para a URL original.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| API | Laravel (PHP 8.3) |
| Banco de dados | MySQL 8 |
| Frontend | React + TypeScript + Vite |
| Infraestrutura | Docker e Docker Compose |
| Documentação da API | OpenAPI 3 + Swagger UI |

Também estão no Compose o **phpMyAdmin** (para olhar o banco) e o **Redis** (disponível para cache, ainda não usado pela aplicação).

## Estrutura

```
url-shortener/
├── compose.yaml
├── README.md
├── backend/                      # API Laravel
│   ├── Dockerfile
│   ├── app/
│   │   ├── Http/Controllers/LinkController.php
│   │   └── Models/Link.php
│   ├── database/migrations/      # tabela links
│   ├── routes/
│   │   ├── api.php               # POST/GET /api/links
│   │   └── web.php               # GET /{code} (redirecionamento)
│   └── public/
│       ├── openapi.yaml          # especificação da API
│       └── swagger.html          # Swagger UI
└── frontend/                     # React + TypeScript
    ├── Dockerfile
    └── src/App.tsx
```

## Como rodar

### Requisitos

- Docker
- Docker Compose

### Passo a passo

1. Configure o `.env` do backend:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Abra `backend/.env` e ajuste estas variáveis (os valores abaixo batem com o `compose.yaml`):

   ```env
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=shortener
   DB_USERNAME=shortener
   DB_PASSWORD=secret

   REDIS_CLIENT=phpredis
   REDIS_HOST=redis
   REDIS_PORT=6379
   ```

   `DB_HOST` e `REDIS_HOST` são os **nomes dos serviços** do Compose, nunca `localhost`.

2. Suba os containers:

   ```bash
   docker compose up -d --build
   ```

   Na primeira vez o backend roda o `composer install` ao iniciar, então demora um pouco. Acompanhe com:

   ```bash
   docker compose logs -f backend
   ```

   Quando o log mostrar que o servidor iniciou, siga para o próximo passo.

3. Gere a chave da aplicação e crie as tabelas:

   ```bash
   docker compose exec backend php artisan key:generate
   docker compose exec backend php artisan migrate
   ```

4. Pronto. Acesse:

   | Serviço | Endereço |
   | --- | --- |
   | Interface (React) | http://localhost:5173 |
   | API (Laravel) | http://localhost:8000 |
   | Documentação (Swagger) | http://localhost:8000/swagger.html |
   | phpMyAdmin | http://localhost:8080 |

### Comandos úteis

```bash
docker compose ps                    # estado dos containers
docker compose logs -f backend       # logs da API
docker compose down                  # para tudo
docker compose down -v               # para tudo e apaga o banco
docker compose exec backend php artisan migrate:fresh   # recria as tabelas (apaga os dados)
docker compose exec backend php artisan route:list      # lista as rotas
```

## Endpoints da API

A documentação interativa completa está em **http://localhost:8000/swagger.html**.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/` | Status da API |
| `GET` | `/api/links` | Lista os 20 links mais recentes |
| `POST` | `/api/links` | Cria um link curto |
| `GET` | `/{code}` | Redireciona para a URL original e conta o clique |

### Criar um link curto

```bash
curl -X POST http://localhost:8000/api/links \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"url": "https://www.google.com"}'
```

Resposta (`201`):

```json
{
  "code": "aB3xK9",
  "original_url": "https://www.google.com",
  "short_url": "http://localhost:8000/aB3xK9"
}
```

Se a URL for inválida, a API responde `422` com a mensagem de validação. Apenas URLs `http` e `https` são aceitas.

### Listar links

```bash
curl http://localhost:8000/api/links -H "Accept: application/json"
```

### Usar o link curto

Abra `http://localhost:8000/aB3xK9` no navegador, ou veja o redirecionamento pelo terminal:

```bash
curl -i http://localhost:8000/aB3xK9
```

A resposta é um `302` com o cabeçalho `Location` apontando para a URL original.

## Como funciona

1. O React envia `POST /api/links` com a URL.
2. O Laravel valida, gera um código aleatório que ainda não existe no banco (coluna `code` com índice único) e salva na tabela `links`.
3. Quando alguém acessa `/{code}`, o Laravel busca o código, soma 1 em `clicks` e redireciona.

Tabela `links`:

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `id` | bigint | Chave primária |
| `code` | varchar(10), único | Código curto |
| `original_url` | text | URL original |
| `clicks` | bigint | Quantidade de acessos |
| `created_at`, `updated_at` | timestamp | Datas |

## Próximos passos

- Alias personalizado para o link curto
- Reaproveitar o link quando a mesma URL já foi encurtada
- Data de expiração dos links
- Limite de requisições (rate limit) na criação
- Testes automatizados da API