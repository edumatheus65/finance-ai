# Finance AI

> Aplicação SaaS de gestão financeira pessoal com inteligência de dados, controle de assinaturas e infraestrutura escalável.

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

---

## 🔗 Demonstração

**Clique na imagem abaixo** para acessar o projeto em produção e testar as funcionalidades:

[![Finance AI Preview](https://github.com/user-attachments/assets/33e591f2-01e5-424c-a68f-88e2af8c2582)](https://finance-ai-omega-tawny.vercel.app/login)

🎯 **Link Direto:** [https://finance-ai-omega-tawny.vercel.app/login](https://finance-ai-omega-tawny.vercel.app/login)

---

### Principais Features:

- **Dashboard de Gastos:** Visualização analítica de receitas e despesas por categorias.
- **Gestão de Assinaturas:** Integração completa com o ecossistema **Stripe** (Checkout, Webhooks e Portal de Gestão).
- **Autenticação Social:** Login seguro via Google OAuth integrado ao NextAuth.js.
- **Interface Premium:** Design responsivo e interativo utilizando Tailwind CSS e Radix UI.

---

## 🛠️ Stack Técnica

| Camada             | Tecnologia                                  |
| :----------------- | :------------------------------------------ |
| **Framework**      | Next.js 14 (App Router)                     |
| **Linguagem**      | TypeScript                                  |
| **Banco de Dados** | PostgreSQL + Prisma ORM                     |
| **Autenticação**   | NextAuth.js (Google OAuth)                  |
| **Pagamentos**     | Stripe (Checkout, Webhooks, Portal)         |
| **UI/UX**          | Tailwind CSS, Radix UI, Framer Motion       |
| **Testes**         | Vitest + Happy DOM                          |
| **Infra/DevOps**   | Docker, Docker Compose, GitHub Actions (CI) |

---

## 🚀 Diferenciais para Tech Leads

Este repositório foi estruturado seguindo as melhores práticas de engenharia de software:

- **Server Components & Actions:** Uso intensivo dos recursos do Next.js 14 para otimização de performance e SEO.
- **Integração com Webhooks:** Processamento assíncrono e seguro de eventos do Stripe para persistência de dados.
- **Ambiente Isolado:** Configuração de Docker para garantir que o ambiente de desenvolvimento seja idêntico ao de produção.
- **Qualidade de Código:** Pipeline de CI automatizada que executa lint, testes e build de produção (o build do Next.js inclui verificação de tipos) em cada push/PR para `main`.

---

### Pré-requisitos

- Node.js 20+ e [pnpm](https://pnpm.io/) (o repositório fixa a versão em `package.json` via `packageManager`; use `corepack enable` se quiser alinhar ao CI).
- Docker e Docker Compose (opcional para banco local ou stack completa).
- Contas/chaves para Google OAuth, Stripe e (opcional) OpenAI ou Groq — conforme `.env.example`.

### Configuração Inicial

1.  Clone o repositório.
2.  Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

### Método 1: Local (pnpm)

1. Suba um PostgreSQL acessível (por exemplo, só o banco: `docker compose up -d db`).
2. Preencha `DATABASE_URL` e `DIRECT_URL` no `.env` (ambos são exigidos pelo Prisma neste projeto; veja `.env.example`).

```bash
pnpm install --frozen-lockfile
```

```bash
pnpm prisma generate
```

```bash
pnpm prisma migrate dev
```

```bash
pnpm dev
```

> O mesmo fluxo usado no CI é: `pnpm install --frozen-lockfile` → `pnpm prisma generate` → `pnpm lint` → `pnpm test` → `pnpm build`.

### Método 2: Docker

Preencha o `.env` (mínimo: `NEXTAUTH_SECRET` e demais variáveis do `.env.example` que o app usa em runtime). O `docker-compose` injeta `DATABASE_URL` para o serviço `app`; a imagem aplica migrações na subida (`migrate deploy`).

```bash
docker compose up --build
```

## 🧪 Comandos úteis

```bash
pnpm build        # prisma generate + build de produção (inclui checagem de tipos do Next.js).
pnpm lint         # ESLint (next lint).
pnpm typecheck    # tsc --noEmit (rápido; o CI valida tipos via pnpm build).
pnpm test         # Vitest.
```

## 📁 Estrutura de pastas

```
├── app/                     # Rotas, Layouts e Server Actions (Next.js 14)
├── prisma/                  # Modelagem de dados e migrações
├── public/                  # Assets estáticos
├── .github/workflows/       # Automação de CI/CD
├── Dockerfile               # Configuração multi-stage build
├── docker-compose.yml       # Orquestração de containers (App + DB)
└── .env.example             # Template de configuração de ambiente


**Gostou do projeto?** Sinta-se à vontade para entrar em contato ou dar um feedback!
```
