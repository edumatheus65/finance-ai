# Finance AI

<img width="1365" height="616" alt="image" src="https://github.com/user-attachments/assets/33e591f2-01e5-424c-a68f-88e2af8c2582" />


Aplicação web de gestão financeira pessoal construída com **Next.js 14**, **Prisma**, **PostgreSQL** e integração com **Stripe** para planos premium. Autenticação via **NextAuth** com Google OAuth.

## Stack

| Camada        | Tecnologia                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 14 (App Router)             |
| Linguagem     | TypeScript                          |
| Banco de dados| PostgreSQL + Prisma ORM              |
| Autenticação  | NextAuth.js (Google OAuth)           |
| Pagamentos    | Stripe (Checkout, Webhooks, Portal)  |
| UI            | Tailwind CSS, Radix UI, Framer Motion|
| Testes        | Vitest + Happy DOM                   |
| CI            | GitHub Actions                       |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (gerenciador de pacotes padrão do projeto)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (para rodar via container)
- Conta Google Cloud (para credenciais OAuth)
- Conta Stripe (para funcionalidades de pagamento)

## Como Rodar

### Variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Veja `.env.example` para a lista completa de variáveis necessárias.

---

### Método 1 — Desenvolvimento local

```bash
# 1. Instale as dependências
pnpm install

# 2. Gere o Prisma Client
pnpm prisma generate

# 3. Rode as migrações (requer um PostgreSQL acessível via DATABASE_URL)
pnpm prisma migrate dev

# 4. Inicie o servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

### Comandos úteis

```bash
pnpm build        # Build de produção
pnpm start        # Servidor de produção (requer build prévio)
pnpm lint         # Linting com ESLint
pnpm test         # Testes com Vitest
```

---

### Método 2 — Docker

Sobe a aplicação e o banco PostgreSQL com um único comando:

```bash
# Build e inicialização
docker compose up --build

# Ou em background
docker compose up --build -d
```

O `docker-compose.yml` configura:

- **`db`** — PostgreSQL 16 Alpine com healthcheck e volume persistente
- **`app`** — Aplicação Next.js (multi-stage build, imagem otimizada)

O container da aplicação aguarda automaticamente o banco estar pronto e executa `prisma migrate deploy` antes de iniciar.

Para parar e remover:

```bash
docker compose down          # Mantém dados do banco
docker compose down -v       # Remove dados do banco também
```

## Estrutura do Projeto

```
├── app/                     # App Router (páginas, layouts, API routes)
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── migrations/          # Histórico de migrações
├── public/                  # Assets estáticos
├── .github/workflows/       # CI/CD (GitHub Actions)
├── Dockerfile               # Multi-stage build para produção
├── docker-compose.yml       # Orquestração (app + PostgreSQL)
├── docker-entrypoint.sh     # Entrypoint com wait-for-db + migrations
└── .env.example             # Template de variáveis de ambiente
```

## CI/CD

O workflow de CI (`.github/workflows/ci.yml`) é executado automaticamente em todo **push** e **pull request** para a branch `main`. Ele roda:

1. **Install** — `pnpm install --frozen-lockfile`
2. **Generate** — `pnpm prisma generate`
3. **Lint** — `pnpm lint`
4. **Test** — `pnpm test`
5. **Build** — `pnpm build`

## Licença

Projeto privado.
