# Sprint 2.4 — Budgets, Goals & Advanced Analytics

## Scope
Implement budgets, financial goals, and advanced analytics with date-range reporting on top of the existing Sprint 2.3 foundation.

## Database Changes
- Added `Budget` model with optional category association
- Added `Goal` model with server-controlled progress
- Added `BudgetPeriod` enum (`WEEKLY`, `MONTHLY`, `YEARLY`)
- Updated `Device` model with `@@unique([deviceId])`
- All monetary values remain integer-based

## Budget Model
- Fields: id, userId, categoryId (optional), name, amount, currency, period, startDate, endDate, isActive, timestamps
- Owned by single user
- Optional category-specific budgeting
- Spending is calculated server-side from transactions

## Goal Model
- Fields: id, userId, name, description, targetAmount, currentAmount, currency, targetDate, isCompleted, isActive, timestamps
- Owned by single user
- `currentAmount` is server-controlled
- Progress updates are atomic via Prisma `$transaction`
- Automatically marks goal as completed when target is reached

## Budget Business Rules
- Spending calculated from EXPENSE transactions only
- INCOME and TRANSFER transactions do not count toward budget spending
- Category-specific budgets only count matching category transactions
- Only authenticated user's transactions count
- Zero budget and zero spending handled safely
- Database aggregation used for performance

## Goal Business Rules
- Progress must be positive
- Cross-user modification prevented
- Goal marked completed when `currentAmount >= targetAmount`
- `currentAmount` never accepted from client directly
- Atomic updates via Prisma `$transaction`

## Reports Module (Extended)
- `GET /reports/summary` — Total balance, income, expenses, net cash flow, active account count
- `GET /reports/income-expense` — Income/expense grouped by month
- `GET /reports/by-category` — Category-level totals with date filtering
- `GET /reports/overview` — Date-range overview with income, expenses, net cash flow, transaction count
- `GET /reports/trends` — Time-series data for charting
- `GET /reports/category-breakdown` — Category breakdown with percentage and transaction count
- `GET /reports/budget-performance` — Budget spending vs amount
- `GET /reports/goal-progress` — Goal completion status

## API Endpoints

### Budgets
- `GET /budgets` — List own budgets with calculated spending
- `GET /budgets/:id` — Get one budget
- `POST /budgets` — Create budget
- `PATCH /budgets/:id` — Update budget
- `DELETE /budgets/:id` — Deactivate budget

### Goals
- `GET /goals` — List own goals
- `GET /goals/:id` — Get one goal
- `POST /goals` — Create goal
- `PATCH /goals/:id` — Update goal metadata
- `DELETE /goals/:id` — Deactivate goal
- `POST /goals/:id/progress` — Add progress toward goal

### Reports (Extended)
- `GET /reports/summary`
- `GET /reports/income-expense`
- `GET /reports/by-category`
- `GET /reports/overview`
- `GET /reports/trends`
- `GET /reports/category-breakdown`
- `GET /reports/budget-performance`
- `GET /reports/goal-progress`

## Pagination & Filtering
- Date ranges supported on analytics endpoints
- Budgets support `period` and `categoryId` filters
- All filters scoped to authenticated user

## Validation
- Budget: positive amount, valid dates, valid enum values
- Goal: positive targetAmount, valid dates
- Progress: positive amount only
- Date ranges: startDate <= endDate
- All IDs must be valid UUIDs

## Mobile Integration
- Services: budgets.ts, goals.ts, reports.ts (extended)
- Screens: budgets/index, budgets/[id], budgets/new, budgets/[id]/edit, goals/index, goals/[id], goals/new, goals/[id]/edit, analytics/index
- Dashboard updated with tabs for accounts, cards, transactions, transfers, recurring, reports, budgets, goals, analytics
- Persian RTL UI throughout

## Seed Changes
- No seed changes required
- Existing seed data preserved
- Seed remains deterministic and idempotent

## Tests
- Budgets controller/service tests
- Goals controller/service tests
- Reports controller/service tests
- 26 total tests passing

## Migration Status
- Migration SQL created at `apps/api/prisma/migrations/0.2.4_add_budgets_goals/migration.sql`
- Prisma schema validation: PASS
- Prisma Client generation: PASS
- PostgreSQL unavailable — migration execution BLOCKED

## Security Decisions
- userId derived from JWT, never from client
- Every query scoped to authenticated user
- Cross-user access returns NotFoundException
- Calculated spending must be server-side
- Goal currentAmount must be server-controlled
- Financial mutations use Prisma `$transaction` where appropriate
- System categories protected from normal user modification

## Known Limitations
- No budget rollover/period carryover
- No goal contribution transactions
- No budget alerts/notifications
- Reports support monthly aggregation for income-expense
- No currency conversion

## Explicitly Deferred Features
- Budget alerts
- Goal contribution transactions
- Advanced forecasting
- AI financial advisor
- Notifications
- Banking integrations
- Open Banking
- Real payment processing