# Sprint 2.3 — Transfers, Recurring Transactions & Basic Financial Reports

## Scope
Implement account-to-account transfers, recurring transaction definitions with execution foundation, and basic financial reports/analytics on top of the existing Sprint 2.2 foundation.

## Database Changes
- Added `Transfer` model with source/destination account relations
- Added `RecurringTransaction` model with frequency enum
- Added `TransactionType` enum value `TRANSFER`
- Added `RecurringFrequency` enum (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`)
- Updated `Account` model with transfer relations
- Updated `User` model with transfer relations
- All monetary values remain integer-based

## Transfer Model
- Fields: id, userId, sourceAccountId, destinationAccountId, amount, currency, description, transactionDate, timestamps
- Both accounts must belong to authenticated user
- Both accounts must be active
- Source account must have sufficient balance
- Transfer creation is atomic via Prisma `$transaction`
- Balance mutations are server-side only

## RecurringTransaction Model
- Fields: id, userId, accountId, categoryId, type, amount, currency, description, frequency, startDate, endDate (nullable), nextRunAt, isActive, timestamps
- Supports DAILY, WEEKLY, MONTHLY, YEARLY frequencies
- Owned by single user
- Account and category ownership enforced

## Ownership Rules
- Server derives userId from JWT
- Every query scoped to authenticated user
- Cross-user access returns NotFoundException
- System categories protected from normal user modification
- Inactive accounts cannot participate in transfers or recurring execution

## Balance Behavior
- Account balance updated server-side inside database transactions
- Transfer: source balance decreases, destination balance increases atomically
- Recurring execution: balance updated per generated transaction
- Client never provides resulting balance

## Transaction Type Extension
- Added `TRANSFER` to `TransactionType` enum
- Transfers are excluded from income/expense analytics
- Reports distinguish transfers from ordinary income and expenses

## Recurring Execution
- Service method `processDueRecurringTransactions()` processes due active recurring transactions
- Validates account ownership, account status, and category compatibility
- Creates corresponding transaction and updates balance atomically
- Advances `nextRunAt` based on frequency
- Safe to call repeatedly; deactivates recurring transaction on validation failure

## API Endpoints

### Transfers
- `GET /transfers` — List own transfers
- `GET /transfers/:id` — Get one transfer
- `POST /transfers` — Create transfer

### Recurring Transactions
- `GET /recurring-transactions` — List own recurring transactions
- `GET /recurring-transactions/:id` — Get one recurring transaction
- `POST /recurring-transactions` — Create recurring transaction
- `PATCH /recurring-transactions/:id` — Update recurring transaction
- `DELETE /recurring-transactions/:id` — Deactivate recurring transaction

### Reports
- `GET /reports/summary` — Total balance, income, expenses, net cash flow, active account count
- `GET /reports/income-expense` — Income/expense grouped by month
- `GET /reports/by-category` — Category-level totals with date filtering

## Pagination
- Transactions list supports `page` and `limit` query params
- Defaults: page=1, limit=20, max=100
- Returns: data, page, limit, total, totalPages

## Filtering
- accountId, categoryId, type, fromDate, toDate supported on transactions
- Reports support from/to date ranges and type filter
- All filters scoped to authenticated user
- Invalid date ranges rejected

## Validation
- IDs must be valid UUIDs
- Amount must be positive integer
- Type must be INCOME, EXPENSE, or TRANSFER
- Description max 500 chars
- Date must be valid ISO datetime
- Transfer amount must not exceed source balance
- Source and destination accounts must differ

## Mobile Integration
- Services: transfers.ts, recurringTransactions.ts, reports.ts
- Screens: transfers/new, recurring-transactions/index/[id]/new, reports/index
- Dashboard updated with tabs for accounts, cards, transactions, transfers, recurring, reports
- Persian RTL UI throughout

## Seed Changes
- Preserved existing seed structure
- No new seed data required for Sprint 2.3
- Seed remains deterministic and idempotent

## Tests
- Transfers controller/service tests
- Recurring transactions controller/service tests
- Reports controller/service tests
- 23 total tests passing

## Migration Status
- Migration SQL created at `apps/api/prisma/migrations/0.1.0_init/migration.sql`
- Prisma schema validation: PASS
- Prisma Client generation: PASS
- PostgreSQL unavailable — migration execution BLOCKED

## Security Decisions
- userId derived from JWT, never from client
- Account ownership verified before transfers
- Category availability and type compatibility enforced
- System categories protected
- Cross-user access returns NotFoundException
- Sensitive auth data never returned in financial responses
- Transfer mutations are atomic via Prisma `$transaction`
- Recurring execution is idempotent via nextRunAt advancement

## Known Limitations
- No transfer fee support
- No scheduled transfer execution (manual only)
- No recurring transaction history/execution log
- Reports support monthly aggregation only
- No currency conversion
- No overdraft rules

## Explicitly Deferred Features
- Transfer fees
- Scheduled/auto transfers
- Recurring execution history
- Advanced analytics
- AI forecasting
- Budget integration
- Goal integration
- Notifications
- Banking integrations
- Open Banking
- Real payment processing