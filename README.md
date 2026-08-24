# nova-bank

Persian/Iranian financial super-app built with React Native, Expo, NestJS, Prisma, and PostgreSQL.

## Structure

```
nova-bank/
├── apps/
│   ├── api/          # NestJS backend
│   └── mobile/       # React Native + Expo
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── validation/   # Shared Zod schemas
│   ├── config/       # Shared configuration
│   └── localization/ # Persian/i18n utilities
├── infrastructure/
│   └── docker/       # Docker Compose for local dev
└── docs/             # Architecture and planning docs
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start PostgreSQL + Redis
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Run Prisma generation and migration
pnpm db:generate
pnpm db:push

# Seed foundation data
pnpm db:seed

# Start API
pnpm --filter @nova-bank/api dev

# Start mobile (Expo)
pnpm --filter @nova-bank/mobile dev
```

## Authentication

The API uses JWT access tokens and opaque refresh tokens.

- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login with phone/password
- `POST /api/v1/auth/refresh` — Refresh access token
- `POST /api/v1/auth/logout` — Revoke current session
- `GET /api/v1/users/me` — Get current user profile
- `PATCH /api/v1/users/me` — Update profile

## Environment Variables

Copy `.env.example` to `.env` and set required values. At minimum:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — At least 32 characters
- `REFRESH_TOKEN_SECRET` — At least 32 characters

## Tech Stack

- **Mobile:** React Native, Expo, TypeScript, NativeWind, Expo Router, TanStack Query, Zustand, React Hook Form, Zod
- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL
- **AI:** Provider-agnostic AI Gateway (future), Agent Orchestrator (future)
- **Tooling:** pnpm workspaces, ESLint, Prettier, Husky

## License

Proprietary
