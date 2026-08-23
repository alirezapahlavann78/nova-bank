# Sprint 0.1 — Architecture Blueprint

The full architecture blueprint is maintained in the sprint planning documentation.

## Key Decisions
- Modular monolith (NestJS)
- React Native + Expo + NativeWind
- Prisma + PostgreSQL
- Provider-agnostic AI Gateway
- Persian-first localization (RTL, Jalali, Toman)
- Separation of feature entitlement and AI usage limits

## Core Principle
Backend is the authoritative source of truth for all financial data. AI may explain, summarize, classify, analyze, recommend, and forecast, but must never mutate or authoritatively calculate financial records.

## AI Security Principle
AI agents must not directly access PostgreSQL. All AI requests flow through the NestJS API and approved domain tools.

## Monorepo
```
nova-bank/
├── apps/
│   ├── api/
│   └── mobile/
├── packages/
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── localization/
├── infrastructure/
│   └── docker/
└── docs/
```

## Technology Stack
- Mobile: React Native, Expo, TypeScript, NativeWind, Expo Router, TanStack Query, Zustand, React Hook Form, Zod
- Backend: NestJS, TypeScript, Prisma, PostgreSQL
- AI: AI Gateway, Agent Registry, Orchestrator, Tool Registry, Provider Adapters
