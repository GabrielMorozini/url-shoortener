# 🔗 URL Shortener

Encurtador de URLs com API em **Laravel**, interface em **React + TypeScript** e ambiente containerizado com **Docker Compose**. Os dados ficam em **PostgreSQL**, hospedado no **Supabase**.

> Cole um link longo, receba um link curto e acompanhe quantas pessoas o acessaram.

**🌐 Demo:** [url-shoortener.vercel.app](https://url-shoortener.vercel.app/)

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Regras de negócio](#-regras-de-negócio)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Como executar](#-como-executar)
- [Endpoints da API](#-endpoints-da-api)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Roadmap](#-roadmap)
- [Autor](#-autor)

---

## 📖 Sobre o projeto

O objetivo é transformar URLs longas em links curtos e fáceis de compartilhar, com controle de expiração e contagem de acessos. O projeto foi desenvolvido para praticar uma arquitetura moderna **API + SPA**, com foco em boas práticas de backend, gerenciamento de sessão e infraestrutura com containers.

## ✨ Funcionalidades

- Encurtamento de URLs longas em links curtos
- Redirecionamento automático do link curto para o destino original
- Contagem de acessos por link
- Expiração automática dos links
- Perfil de administrador com visão geral de todos os links
- Interface web responsiva (desktop e mobile)

## 📌 Regras de negócio

| Regra | Descrição |
|-------|-----------|
| Expiração | Cada link expira **1 semana** após a criação |
| Sem contas de usuário | Usuários comuns são identificados apenas por **sessão**; ao sair e voltar, o histórico anterior não é mantido |
| Privacidade | Ninguém visualiza links de outras pessoas |
| Edição e exclusão | Cada pessoa só edita e exclui os **próprios** links |
| Estatísticas | O dono do link vê quantas pessoas o acessaram enquanto ele estiver ativo |
| Administrador | Vê **todos** os links e suas estatísticas |

## 🛠 Tecnologias

**Backend**
- PHP / Laravel (API REST)
- PostgreSQL (Supabase)

**Frontend**
- React
- TypeScript
- Vite

**Infraestrutura**
- Docker e Docker Compose
- Supabase (banco de dados gerenciado)
- Vercel (deploy do frontend)

## 🏗 Arquitetura

```
┌──────────────┐     HTTP/JSON     ┌──────────────┐      ┌─────────────────────┐
│   Frontend   │ ────────────────► │   Backend    │ ───► │ PostgreSQL          │
│ React + Vite │                   │ Laravel API  │      │ (Supabase)          │
└──────────────┘                   └──────────────┘      └─────────────────────┘
```

## 🚀 Como executar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/GabrielMorozini/url-shoortener.git
cd url-shoortener

# 2. Suba os containers
docker compose up -d --build

# 3. Rode as migrations
docker compose exec backend php artisan migrate
```

### Comandos úteis

```bash
docker compose logs -f backend     # acompanhar logs
docker compose down                # parar os containers
```

## 📡 Endpoints da API

> `[TODO: ajuste conforme as rotas reais em routes/api.php]`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/links` | Cria um link curto |
| `GET` | `/api/links` | Lista os links da sessão atual |
| `PUT` | `/api/links/{id}` | Edita um link próprio |
| `DELETE` | `/api/links/{id}` | Remove um link próprio |
| `GET` | `/{codigo}` | Redireciona para a URL original e registra o acesso |

**Exemplo de requisição**

```bash
curl -X POST http://localhost:[porta]/api/links \
  -H "Content-Type: application/json" \
  -d '{"url": "https://exemplo.com/uma/url/muito/longa"}'
```

**Exemplo de resposta**

```json
{
  "id": 1,
  "original_url": "https://exemplo.com/uma/url/muito/longa",
  "short_url": "http://localhost:[porta]/aB3xYz",
  "expires_at": "2026-11-30T12:00:00Z"
}
```

## 📂 Estrutura de pastas

```
url-shoortener/
├── backend/             # API Laravel
├── frontend/            # SPA React + TypeScript (Vite)
├── compose.yaml         # Orquestração dos containers
├── .gitignore
└── README.md
```

## 🗺 Roadmap

- [ ] Testes automatizados (backend e frontend)
- [ ] CI com GitHub Actions
- [ ] Documentação da API com Swagger/OpenAPI
- [ ] Métricas de acesso mais detalhadas

## 👤 Autor

**Gabriel Morozini**

- GitHub: [@GabrielMorozini](https://github.com/GabrielMorozini)

---

⭐ Se este projeto te ajudou, deixe uma estrela no repositório!
