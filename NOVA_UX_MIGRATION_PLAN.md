# Nova UX Migration Plan

**Audit date:** 2026-09-14  
**Scope:** Mobile Expo Router UX/IA audit and migration plan.  
**Constraint:** Analysis and planning only. No application source code, routes, configuration, packages, or schema were modified.

## 1. Executive Summary

Nova has a substantial NestJS/Prisma backend and 35 real Expo Router screens. Authentication, payments, budgets, goals, reports, notifications, AI chat, investments, credit, loans, and loan payments all have at least some backend support.

The main UX problem is not lack of features. It is fragmented information architecture and incomplete exposure of existing capabilities:

- Current navigation is `Dashboard / AI / Lending`; the target is `HOME / MONEY / PAY / GROW / CREDIT / AI`.
- Backend capabilities for accounts, cards, transactions, transfers, beneficiaries, templates, scheduled payments, recurring transactions, banks, categories, and assets are not represented in mobile IA.
- Home is a generic dashboard, not a financial command center.
- Pay is reduced to payment history and one technical payment form.
- Grow is split across goals, budgets, analytics, and investments.
- Lending uses bank-oriented terminology instead of a borrower-centered Credit experience.
- AI is a chat destination but not a contextual intelligence layer.
- The visual system mixes glass, hard-coded colors, Tailwind classes, and one-off styles.
- RTL has a strong foundation but is not applied systemically.

### Recommended Direction

1. Canonical financial components and state patterns.
2. Six-tab IA: Home, Money, Pay, Grow, Credit, AI.
3. Home as a command center.
4. Expose existing Money and Pay backend capabilities.
5. Consolidate Grow.
6. Reframe Credit.
7. Contextual AI without direct AI mutation.
8. Complete global and accessibility states.

## 2. Current App Architecture

### Mobile

- Expo 57, React Native 0.86, React 19.
- Expo Router 57.
- NativeWind 4, Tailwind CSS 3, React Native `StyleSheet`, and custom Glass components.
- Zustand stores for auth and AI.
- Mostly local `useState` forms; `react-hook-form` is installed but not the dominant architecture.
- Vazirmatn typography.
- AsyncStorage access token and SecureStore refresh token.
- Fetch wrapper in `apps/mobile/services/api.ts`.

### Backend

- NestJS and Prisma.
- Verified models include User, Session, Bank, Account, Card, Category, Transaction, Transfer, RecurringTransaction, Budget, Goal, Notification, NotificationPreference, AI conversation/message/tool models, InvestmentAccount, Asset, Holding, InvestmentTransaction, Watchlist, Beneficiary, PaymentTemplate, Payment, ScheduledPayment, PaymentExecution, IdempotencyKey, PaymentAudit, CreditProfile, CreditScoreHistory, LoanProduct, LoanApplication, Loan, LoanInstallment, LoanPayment, and CreditAudit.

### Technical Observations Affecting Trust

- `API_BASE_URL` is hard-coded to `http://192.168.1.100:3000/api/v1`.
- Access token is stored in AsyncStorage.
- Repeated per-screen auth redirects.
- Mobile loan payment calls `/loans/{id}/payments`, while backend exposes `/loans/{id}/pay`.
- Mobile budget and goal delete wrappers use `POST /{id}` while backend expects `DELETE /{id}`.
- No global backend `ValidationPipe` verified in this snapshot.

## 3. Current Navigation

### Root

`apps/mobile/app/_layout.tsx` uses `Slot`, initializes auth, guards unauthenticated routes, and redirects authenticated users from the auth group to `/(tabs)/dashboard`.

### Bottom Tabs

1. `dashboard` — داشبورد
2. `ai` — دستیار
3. `lending` — وام‌دهی

### Stacks

`(auth)`, `(tabs)`, `/analytics`, `/budgets`, `/goals`, `/investments`, `/lending`, `/notifications`, `/payments`.

No explicit modal, bottom-sheet, or custom presentation routes were found. Confirmations mostly use `Alert.alert`.

### Deep Links

Expo Linking is installed, but no scheme/config or tests were found. Deep-link behavior is **UNKNOWN**.

## 4. Complete Screen Inventory

| # | Screen | Route | Domain | Type | Backend integration | Status | Priority | Recommendation |
|---:|---|---|---|---|---|---|---:|---|
| 1 | Welcome | `/` | Onboarding | DECISION | None | Static welcome | P3 | MOVE/REMOVE |
| 2 | Login | `/(auth)/login` | Auth | ACTION | `/auth/login`, `/auth/refresh`, `/users/me` | IMPLEMENTED | P0 | KEEP/REFACTOR |
| 3 | Register | `/(auth)/register` | Auth | ACTION | `/auth/register` | IMPLEMENTED | P0 | KEEP/REFACTOR |
| 4 | Dashboard | `/(tabs)/dashboard` | Home | COMMAND | User/auth; quick links only | PARTIAL/static activity | P0 | REBUILD |
| 5 | AI Assistant | `/(tabs)/ai` | AI | COMMAND | `/ai/chat`, `/ai/confirm` | PARTIAL | P1 | REFACTOR |
| 6 | Lending hub | `/(tabs)/lending` | Credit | COMMAND | Credit score/health | PARTIAL | P0 | MOVE/REFACTOR |
| 7 | Analytics | `/analytics` | Money/Grow | LIST | Reports endpoints | PARTIAL | P1 | MOVE/MERGE |
| 8 | Budget list | `/budgets` | Grow | LIST | `/budgets` | IMPLEMENTED | P1 | MOVE/REFACTOR |
| 9 | New budget | `/budgets/new` | Grow | ACTION | `POST /budgets` | IMPLEMENTED | P1 | REFACTOR |
| 10 | Budget detail | `/budgets/[id]` | Grow | DETAIL | `GET /budgets/{id}` | PARTIAL | P1 | REFACTOR |
| 11 | Edit budget | `/budgets/[id]/edit` | Grow | ACTION | `PATCH /budgets/{id}` | PARTIAL | P1 | REFACTOR |
| 12 | Goal list | `/goals` | Grow | LIST | `/goals` | IMPLEMENTED | P1 | MOVE/REFACTOR |
| 13 | New goal | `/goals/new` | Grow | ACTION | `POST /goals` | IMPLEMENTED | P1 | REFACTOR |
| 14 | Goal detail | `/goals/[id]` | Grow | DETAIL | `GET /goals/{id}` | PARTIAL | P1 | REFACTOR |
| 15 | Edit goal | `/goals/[id]/edit` | Grow | ACTION | `PATCH /goals/{id}` | PARTIAL | P1 | REFACTOR |
| 16 | Investments overview | `/investments` | Grow | COMMAND | Portfolio/accounts/allocation | IMPLEMENTED/PARTIAL | P1 | MOVE/REFACTOR |
| 17 | Investment accounts | `/investments/accounts` | Grow | LIST | `/investments/accounts` | IMPLEMENTED/PARTIAL | P2 | REFACTOR |
| 18 | Investment analytics | `/investments/analytics` | Grow | LIST | Allocation/performance | PARTIAL | P2 | MERGE |
| 19 | Asset detail | `/investments/asset/[id]` | Grow | DETAIL | None connected | MOCK | P1 | REBUILD |
| 20 | Holdings | `/investments/holdings` | Grow | LIST | Portfolio holdings | IMPLEMENTED/PARTIAL | P1 | REFACTOR |
| 21 | Investment transactions | `/investments/transactions` | Grow | LIST | `/investments/transactions` | IMPLEMENTED/PARTIAL | P2 | REFACTOR |
| 22 | Watchlists | `/investments/watchlists` | Grow | LIST/ACTION | `/investments/watchlists` | IMPLEMENTED/PARTIAL | P2 | REFACTOR |
| 23 | Loan products | `/lending/products` | Credit | LIST | `/loan-products` | IMPLEMENTED/PARTIAL | P0 | MOVE/REFACTOR |
| 24 | Eligibility | `/lending/eligibility` | Credit | ACTION | `/credit/eligibility` | IMPLEMENTED/PARTIAL | P0 | MOVE/REFACTOR |
| 25 | New loan application | `/lending/application/new` | Credit | ACTION | Product/application endpoints | IMPLEMENTED/PARTIAL | P0 | REFACTOR |
| 26 | Loan applications | `/lending/applications` | Credit | LIST | `/loan-applications` | IMPLEMENTED/PARTIAL | P0 | MOVE/REFACTOR |
| 27 | My loans | `/lending/my-loans` | Credit | LIST | `/loans` | IMPLEMENTED/PARTIAL | P0 | MOVE/REFACTOR |
| 28 | Loan detail | `/lending/loan/[loanId]` | Credit | DETAIL | `/loans/{id}` | IMPLEMENTED/PARTIAL | P0 | REFACTOR |
| 29 | Loan payment | `/lending/loan/[loanId]/pay` | Credit | ACTION | Intended `/loans/{id}/pay` | ENDPOINT MISMATCH | P0 | FIX/REFACTOR |
| 30 | Notifications | `/notifications` | Global | LIST | `/notifications` | IMPLEMENTED/PARTIAL | P1 | REFACTOR |
| 31 | Notification preferences | `/notifications/preferences` | Global | ACTION | `/notifications/preferences` | IMPLEMENTED/PARTIAL | P2 | MOVE |
| 32 | Notification detail | `/notifications/[id]` | Global | DETAIL | Notification endpoints | IMPLEMENTED/PARTIAL | P2 | REFACTOR |
| 33 | Payment history | `/payments` | Pay | LIST | `/payments` | IMPLEMENTED/PARTIAL | P0 | MOVE/REFACTOR |
| 34 | New payment | `/payments/new` | Pay | ACTION | `POST /payments` | IMPLEMENTED/PARTIAL | P0 | REBUILD |
| 35 | Payment detail | `/payments/[id]` | Pay | DETAIL | Payment detail/cancel | IMPLEMENTED/PARTIAL | P0 | REFACTOR |

### Missing Mobile Screens With Verified Backend Capability

Accounts, cards, transactions, transfers, beneficiaries, payment templates, scheduled payments, recurring transactions, categories, connected banks, profile, credit score history, AI conversations/history, and global search UI.

Tags have no verified model or controller and are **MISSING backend capability**, not only missing UI.

## 5. Current IA

```text
Root
├── (auth)
│   ├── login
│   └── register
└── (tabs)
    ├── dashboard
    ├── ai
    └── lending
```

Secondary stacks: `/analytics`, `/budgets`, `/goals`, `/investments`, `/lending`, `/notifications`, `/payments`.

### Problems

- Navigation labels are not equal in abstraction level.
- Money management has no primary destination.
- Payment is not a primary destination.
- Grow has no parent.
- Credit is represented as bank-oriented "وام‌دهی".
- Notifications are hidden rather than global.
- Profile is not a coherent destination.

## 6. Target IA

```text
HOME
├── Financial command center
├── Money summary
├── Recent activity
├── Attention items
├── Upcoming payments
└── Nova recommendations

MONEY
├── Overview
├── Accounts
├── Cards
├── Transactions
├── Cash flow
├── Categories
├── Tags
├── Reports
└── Connected banks

PAY
├── Payment center
├── Send money
├── Transfer
├── Beneficiaries
├── Templates
├── Scheduled payments
├── Bills
├── Recharge
└── Payment history

GROW
├── Overview
├── Goals
├── Savings
├── Investments
└── Wealth analytics

CREDIT
├── Overview
├── Credit score
├── Financial health
├── Eligibility
├── Loan products
├── Applications
├── My loans
└── Loan payments

AI
├── Ask Nova
├── Conversations
├── Insights
├── Recommendations
└── History
```

## 7. Screen-by-Screen Audit

### Home

`/` is a static welcome. `/(tabs)/dashboard` is the actual home.

Verified gaps:

- No total available money.
- No total financial position.
- No real recent transactions.
- No upcoming payments.
- No financial health summary.
- No goal or budget alerts.
- No investment or credit position summary.
- Recent activity is a static empty state.

Target: rebuild as a command center using the P0–P3 hierarchy from the product brief.

### Money

There is no Money destination. `/analytics` is the closest existing screen.

Backend capabilities without UI: accounts, cards, transactions, transfers, categories, recurring transactions, banks, and reports.

Target: Money overview plus entity-first accounts, cards, transactions, cash flow, categories, and connected banks.

### Pay

Current screens: `/payments`, `/payments/new`, `/payments/[id]`.

Backend capabilities without UI: beneficiaries, payment templates, scheduled payments, transfers, and payment executions.

Critical UX issue: new payment exposes technical fields such as source account and destination type/value instead of a beneficiary/action-first flow.

Target: choose action → choose destination → review → confirm → success/failure.

### Grow

Budgets, goals, analytics, and investments are separate stacks.

Verified overlaps:

- `/analytics` and `/investments/analytics` both present analytical data.
- Reports include budget and goal performance, duplicating concepts in feature screens.
- Investment overview and investment analytics both show allocation/performance.

Target: one Grow parent with goals/savings, investments, and holistic wealth analytics.

### Credit

Current structure includes a lending tab plus products, eligibility, application, loans, and payment stacks.

Verified strengths:

- Credit score and financial health endpoints exist.
- Loan products, applications, loans, installments, and payments exist.

Verified issues:

- "وام‌دهی" is bank-oriented.
- Eligibility is separate from offers and application.
- Raw English statuses are shown in many places.
- Payment does not expose installment selection or a full schedule.
- Mobile payment endpoint mismatch must be fixed before relying on the journey.

Target: score → health → eligibility → offer → application → loan → installment → payment.

### AI

The AI tab is backed by `/ai/chat` and `/ai/confirm`.

Verified strengths:

- Conversation state exists.
- Pending tool confirmations exist.
- Agent and conversation endpoints exist.

Gaps:

- No conversation history UI.
- No contextual AI entry points in transactions, budgets, goals, portfolio, credit, loans, or payments.
- AI currently behaves like a separate chatbot.

Security target: AI → Agent → Tool Manager → Domain Service → Prisma. AI must not directly mutate financial records.

## 8. Fake / Mock / Disconnected Experience Audit

| Item | Location | Status | Evidence | Production requirement |
|---|---|---|---|---|
| Asset prices | `/investments/asset/[id]` | MOCK | Hard-coded `$192.50` and `$190.30` | Connect to verified asset/portfolio data |
| Dashboard recent activity | `/(tabs)/dashboard` | STATIC | Always shows empty transaction card | Integrate real transactions/payments |
| Loan payment | `/lending/loan/[loanId]/pay` | DISCONNECTED | Mobile calls `/loans/{id}/payments`; backend is `/loans/{id}/pay` | Align contract and verify idempotency |
| Budget delete | `services/budgets.ts` | DISCONNECTED | `POST /budgets/{id}` vs backend `DELETE` | Align method |
| Goal delete | `services/goals.ts` | DISCONNECTED | `POST /goals/{id}` vs backend `DELETE` | Align method |
| API base URL | Mobile API/auth services | CONFIGURATION RISK | Hard-coded LAN IP | Environment configuration |
| Asset holdings/transactions | Asset detail | STATIC | Empty states without fetch | Load asset-filtered holdings and transactions |
| AI history | AI tab | PARTIAL | Hook can load conversations; UI does not show history | Add conversations/history UI |

### Backend Exists but No Mobile UI

Accounts, cards, transactions, transfers, beneficiaries, payment templates, scheduled payments, recurring transactions, categories, banks/connected banks, payment executions, credit score history, and AI conversations.

### Backend Capability Not Verified

Tags, bills, recharge, scan/deposit/withdraw domain services, global search aggregation, net-worth aggregation, push delivery, and external bank linking.

## 9. Backend ↔ Mobile Mapping

| Area | Mobile | API/model | Status |
|---|---|---|---|
| Auth | Login/register | Auth, User, Session | IMPLEMENTED |
| Profile | None | `GET /users/me`, User | MISSING UI |
| Accounts | None | Account | MISSING UI |
| Cards | None | Card | MISSING UI |
| Transactions | None | Transaction | MISSING UI |
| Transfers | None | Transfer | MISSING UI |
| Categories | None | Category | MISSING UI |
| Banks | None | Bank | MISSING UI |
| Recurring | None | RecurringTransaction | MISSING UI |
| Reports | `/analytics` | Report endpoints | PARTIAL |
| Payments | `/payments`, `/payments/new`, `/payments/[id]` | Payment, PaymentExecution, IdempotencyKey | PARTIAL |
| Beneficiaries | None | Beneficiary | MISSING UI |
| Templates | None | PaymentTemplate | MISSING UI |
| Scheduled | None | ScheduledPayment | MISSING UI |
| Budgets | `/budgets` | Budget | IMPLEMENTED/PARTIAL |
| Goals | `/goals` | Goal | IMPLEMENTED/PARTIAL |
| Portfolio | `/investments` | InvestmentAccount, Holding, Asset | PARTIAL |
| Investment accounts | `/investments/accounts` | InvestmentAccount | PARTIAL |
| Holdings | `/investments/holdings` | Holding, Asset | PARTIAL |
| Investment transactions | `/investments/transactions` | InvestmentTransaction | PARTIAL |
| Watchlists | `/investments/watchlists` | Watchlist, WatchlistItem | PARTIAL |
| Asset detail | `/investments/asset/[id]` | Asset exists; UI not connected | MOCK |
| Credit score/health | Lending tab | CreditProfile, CreditScoreHistory | PARTIAL |
| Eligibility | `/lending/eligibility` | Credit service | PARTIAL |
| Loan products | `/lending/products` | LoanProduct | PARTIAL |
| Applications | `/lending/applications` | LoanApplication | PARTIAL |
| Loans | `/lending/my-loans`, loan detail | Loan, LoanInstallment | PARTIAL |
| Loan payment | Loan pay screen | LoanPayment, IdempotencyKey | ENDPOINT MISMATCH |
| AI chat | AI tab | AIConversation, AIMessage, AIToolExecution | PARTIAL |
| AI history | None | AIConversation | MISSING UI |

## 10. Navigation Problems

1. Primary IA mismatch: no Money, Pay, Grow, or Credit tabs.
2. Feature stacks float at top level.
3. No global header.
4. No profile entry.
5. No global search.
6. Back behavior and headers are ad hoc.
7. No modal/sheet layer for review and confirmation.
8. Route depth risks in loan and asset flows.
9. Root welcome behavior with authenticated users needs verification.
10. Raw API statuses reduce clarity.

## 11. Design System Problems

### Duplicates

- `GlassView`, `GlassCard`, and `GlassListCard` overlap.
- Two `GlassInput` implementations exist.
- `GlassButton`, `PrimaryButton`, and `SecondaryButton` coexist.
- `SectionHeader`, `SectionTitle`, and local section titles coexist.
- `ScreenState` competes with one-off state blocks.

### Inconsistencies

- Hard-coded colors bypass theme tokens.
- `StatCard` uses fixed light-mode colors.
- Mixed NativeWind and StyleSheet spacing.
- Fragile Tailwind grid usage in React Native screens.
- Financial numbers use mixed `Text`, `MoneyText`, and local formatting.
- Status presentation varies between raw text, Tailwind classes, and `StatusPill`.
- Button and form spacing are inconsistent.

### Canonical Components Required

`NovaPage`, `PageHeader`, `MoneyAmount`, `BalanceSummary`, `AccountCard`, `BankCard`, `TransactionRow`, `TransactionDetail`, `CategoryChip`, `GoalProgressCard`, `BudgetProgressCard`, `CreditScoreCard`, `LoanSummaryCard`, `InstallmentRow`, `PortfolioSummaryCard`, `HoldingRow`, `AssetRow`, `PerformanceChart`, `AIInsightCard`, `AIRecommendationCard`, `ActionTile`, `StatusBadge`, `DataList`, `DataRow`, `ProgressBar`, `FormSection`, `ReviewSummary`, `ConfirmationSheet`, `SuccessState`, `ErrorState`, `EmptyState`, and `SkeletonState`.

## 12. Glass / iOS Visual Audit

Appropriate use:

- Floating bottom tab bar.
- Premium dashboard hero.
- AI surface.
- Ambient background.

Inappropriate or risky use:

- Long transaction lists.
- Dense financial data.
- Forms.
- Payment/security confirmation.
- Loan details and installment schedules.
- Error and offline states.

Recommendation: use solid or near-solid surfaces for dense data and critical information; reserve glass for navigation, floating actions, overlays, AI, and premium moments.

## 13. RTL / Persian Audit

### Implemented

- Vazirmatn font family.
- `I18nManager.allowRTL(true)` and `forceRTL(true)`.
- Default RTL writing direction and right alignment.
- Persian locale dates.
- Persian number formatting for IRT.
- `MoneyText` uses LTR writing direction and tabular numbers.

### Problems

- Back arrows are not consistently directional.
- Raw English statuses appear across lending, payments, investments, and notifications.
- Mixed Persian and English labels are not governed by a display dictionary.
- Chart and progress direction are not centrally RTL-aware.
- Some code uses logical spacing; other code uses left/right spacing.
- Currency formatter explicitly supports IRT, EUR, and USD.
- Dates mix `fa-IR` and `fa-IR-u-nu-latn` without one policy.
- Some Persian copy is hard-coded in components.

### Recommendation

Create shared direction and status utilities, use logical spacing only, define a number policy, standardize Jalali dates, and localize every API status before rendering.

## 14. State Management Audit

### Auth

- Zustand auth store.
- Refresh-token flow.
- Startup profile fetch with fallback.

Issues:

- AsyncStorage access token.
- Hard-coded API base URL.
- Repeated auth redirects.

### Data

- Most screens use local `useState` hooks with one-time fetch effects.
- No global query cache, retry, invalidation, or optimistic update strategy was found.
- Some hooks expose `refetch`; many do not.

### Missing State Coverage

Refreshing, offline, partial data, stale data, background refresh, pagination, search/filter state, form dirty/unsaved state, and a confirmation state machine.

## 15. User Journey Audit

| Journey | Current entry | Friction | Integration | Target flow |
|---|---|---|---|---|
| Open Nova | App root/login | Root welcome ambiguity | IMPLEMENTED | Auth-aware Home |
| Understand total position | Dashboard | Missing core answer | MISSING | Home money/net position |
| View account | None | Missing UI | Backend exists | Money → Accounts → Detail |
| View card | None | Missing UI | Backend exists | Money → Cards → Detail |
| Find transaction | None | No search | Backend list exists | Global search and transactions |
| Understand spending | `/analytics` | Separate context | PARTIAL | Money → Cash flow/reports |
| Transfer money | `/payments/new` | Technical form | PARTIAL | Pay → Transfer → Review → Confirm |
| Make payment | `/payments/new` | No beneficiaries/templates | PARTIAL | Pay center action flow |
| Manage beneficiary | None | Missing UI | Backend exists | Pay → Beneficiaries |
| Create goal | `/goals/new` | Separate Grow context | IMPLEMENTED | Grow → Goals → New |
| Track goal | `/goals/[id]` | Limited guidance | PARTIAL | Goal timeline/contribution plan |
| View investments | Dashboard → `/investments` | IA split | PARTIAL | Grow → Investments |
| Understand portfolio | Investments/analytics | Duplicated analytics | PARTIAL | Portfolio summary + drilldown |
| Check credit score | Lending tab | Bank-oriented label | PARTIAL | Credit overview |
| Check eligibility | `/lending/eligibility` | Separate from products | PARTIAL | Credit → Eligibility → Offers |
| Apply for loan | Products → application | Limited review | PARTIAL | Guided application |
| View loan | My loans → detail | Raw status, dense layout | PARTIAL | Loan summary/schedule |
| Pay installment | Loan detail → pay | Endpoint mismatch, no installment choice | DISCONNECTED | Select installment → review → confirm |
| Ask Nova | AI tab | Separate chatbot | PARTIAL | Ask Nova with history |
| Receive recommendation | AI tab | No contextual placement | PARTIAL | Contextual AI cards |

## 16. UX Quality Scores

| Area | Score | Rationale |
|---|---:|---|
| Information Architecture | 3.5/10 | Feature-tree rather than product/task centered |
| Navigation | 4/10 | Important destinations are missing or hidden |
| Visual Hierarchy | 5/10 | Hero, actions, and dense data compete |
| Financial Trust | 4/10 | Mock data and contract mismatches undermine trust |
| Consistency | 4/10 | Duplicate components and mixed styling |
| RTL Quality | 6/10 | Strong foundation, incomplete systemic application |
| Accessibility | 3.5/10 | No labels/focus/contrast strategy found |
| Responsiveness | 5/10 | Basic scrolling exists; device density needs QA |
| Backend Integration | 6/10 | Many capabilities exist, several UI surfaces missing |
| Loading/Error/Empty States | 5/10 | Basic states exist; refreshing/offline/partial missing |
| AI Integration | 5/10 | Real chat and confirmation; no context/history |
| Glass/iOS Visual | 5/10 | Ambitious but over-applied |
| Overall UX | 4.5/10 | Promising core, fragmented experience |

## 17. KEEP / MERGE / MOVE / REFACTOR / REBUILD / REMOVE / MISSING Matrix

| Screen/Area | Action | Reason |
|---|---|---|
| Login | KEEP/REFACTOR | Working auth |
| Register | KEEP/REFACTOR | Working auth |
| Dashboard | REBUILD | Must become command center |
| AI tab | REFACTOR | Preserve chat, add history/context |
| Lending tab | MOVE/REFACTOR | Becomes Credit overview |
| Analytics | MOVE/MERGE | Belongs in Money/Grow reporting |
| Budget screens | MOVE/REFACTOR | Belongs in Grow |
| Goal screens | MOVE/REFACTOR | Belongs in Grow |
| Investment overview/accounts/holdings/transactions/watchlists | MOVE/REFACTOR | Preserve integration, move under Grow |
| Investment analytics | MERGE | Merge into wealth analytics |
| Asset detail | REBUILD | Current prices are mock |
| Loan products/eligibility/applications/loans | MOVE/REFACTOR | Belongs in Credit |
| Loan application | REFACTOR | Needs guided review/confirm |
| Loan detail | REFACTOR | Readable schedule/localized status |
| Loan payment | FIX/REFACTOR | Endpoint mismatch |
| Notifications | REFACTOR | Global header destination |
| Notification preferences | MOVE | Profile/settings |
| Payment history/detail | MOVE/REFACTOR | Pay history |
| New payment | REBUILD | Action-first Pay center |
| Root welcome | REMOVE/REDIRECT | Ambiguous after auth |
| Accounts | MISSING | Backend exists |
| Cards | MISSING | Backend exists |
| Transactions | MISSING | Backend exists |
| Transfers | MISSING | Backend exists |
| Beneficiaries | MISSING | Backend exists |
| Templates | MISSING | Backend exists |
| Scheduled payments | MISSING | Backend exists |
| Categories | MISSING | Backend exists |
| Connected banks | MISSING | Backend bank list exists |
| Profile | MISSING | User endpoint exists |
| Global search | MISSING | No verified aggregate endpoint |
| Tags | MISSING | Backend capability not verified |
| Bills | MISSING | Backend capability not verified |
| Recharge | MISSING | Backend capability not verified |

## 18. Target Navigation Tree

```text
Bottom Tabs
├── HOME
├── MONEY
├── PAY
├── GROW
├── CREDIT
└── AI

Global Header
├── Search
├── Notifications
└── Profile/Avatar

HOME
├── Money summary
├── Financial position
├── Recent activity
├── Quick actions
├── Upcoming payments
├── Financial health
├── Goals
├── Investments
├── Credit
└── Nova recommendations

MONEY
├── Overview
├── Accounts/[accountId]
├── Cards/[cardId]
├── Transactions/[transactionId]
├── Cash flow
├── Categories
├── Reports
└── Connected banks

PAY
├── Payment center
├── Send money
├── Transfer
├── Beneficiaries
├── Templates
├── Scheduled payments
├── Payment history/[paymentId]
└── Bills/Recharge when verified

GROW
├── Overview
├── Goals/[goalId]
├── Savings
├── Investments
│   ├── Portfolio
│   ├── Accounts
│   ├── Holdings
│   ├── Assets/[assetId]
│   ├── Transactions
│   ├── Watchlists
│   └── Performance
└── Wealth analytics

CREDIT
├── Overview
├── Score
├── Financial health
├── Eligibility
├── Offers/Products
├── Applications/[applicationId]
├── Loans/[loanId]
└── Payments

AI
├── Ask Nova
├── Conversations
├── Insights
└── Recommendations
```

## 19. Target Screen Hierarchy

### P0 — Core Daily Experience

Home, money overview, accounts, cards, transactions/search, Pay center, send/transfer, beneficiaries, payment history/detail, Credit overview, loan list/detail/payment, and auth.

### P1 — Important

Cash flow, budgets, goals, reports, portfolio, holdings, eligibility, applications, notifications, and AI assistant/history.

### P2 — Supporting

Investment accounts/transactions, watchlists, scheduled payments, templates, categories, credit score history, and notification preferences.

### P3 — Secondary/Future

Tags, bills, recharge, promotional cards, advanced AI forecasting, and external connected-bank management beyond verified capabilities.

## 20. Migration Waves

### Wave 0 — Contract and Trust Stabilization

1. Verify and align loan payment endpoint.
2. Align budget and goal delete contracts.
3. Confirm payment idempotency.
4. Confirm authenticated root behavior and deep links.
5. Establish route smoke checks and QA data.

### Wave 1 — Design System Foundation

1. Canonical page shell, header, spacing, and typography.
2. Surface hierarchy and restricted glass usage.
3. Financial number and status components.
4. Loading, empty, error, refreshing, and offline primitives.
5. RTL and accessibility rules.

### Wave 2 — Navigation / IA

1. Six bottom tabs.
2. Global header with search, notifications, and profile.
3. Move existing stacks under Money, Pay, Grow, and Credit.
4. Temporary route redirects to avoid broken entries.
5. Standardize back behavior.

### Wave 3 — Home

1. Money summary.
2. Financial position.
3. Recent transactions.
4. Essential quick actions.
5. Upcoming payments and attention items.
6. P1/P2 summaries and AI recommendations.

### Wave 4 — Money

1. Accounts list/detail.
2. Cards list/detail.
3. Transactions list/detail/search.
4. Cash flow and reports.
5. Categories and connected banks.

### Wave 5 — Pay

1. Pay center.
2. Beneficiaries.
3. Transfer/send flow.
4. Templates.
5. Scheduled payments.
6. Payment history and detail.

### Wave 6 — Grow

1. Grow overview.
2. Goal and budget consolidation.
3. Investment portfolio hierarchy.
4. Asset detail using verified API.
5. Wealth analytics.

### Wave 7 — Credit

1. Credit overview.
2. Score and financial health.
3. Eligibility-to-offer journey.
4. Applications.
5. Loans, installments, and payments.

### Wave 8 — AI

1. Ask Nova.
2. Conversation history.
3. Insights and recommendations.
4. Contextual AI entry points.
5. Confirmation UX with backend domain-service boundaries.

### Wave 9 — Global States, Accessibility, Polish

1. Offline and partial states.
2. Accessibility labels and focus.
3. Responsive QA.
4. Persian status dictionary.
5. Contrast and visual-density audit.
6. Route and journey verification.

## 21. Risk Register

| Risk | Severity | Impact | Mitigation |
|---|---|---|---|
| Loan payment endpoint mismatch | CRITICAL | Payment failure | Fix before IA migration |
| Budget/goal delete method mismatch | HIGH | Destructive action failure | Fix before exposing delete |
| Hard-coded API URL | HIGH | Broken environments | Environment configuration |
| Access token in AsyncStorage | HIGH | Security/trust | SecureStore or memory-only |
| Mock asset prices | HIGH | False financial information | Remove or connect |
| Navigation migration breaks links | HIGH | Entry loss | Route aliases and tests |
| Visual rewrite hides regressions | HIGH | Feature loss | Preserve services and smoke tests |
| Glass overuse | MEDIUM | Readability loss | Surface hierarchy |
| No query cache | MEDIUM | Stale data | Data-fetching pattern |
| Raw status codes | MEDIUM | Confusion | Persian status dictionary |
| Missing accessibility | MEDIUM | Exclusion | Accessibility checklist |
| AI mutation risk | HIGH | Unsafe operations | Tool/domain-service confirmation boundary |

## 22. Dependencies

### UX Depends On

- Verified API contracts.
- Environment configuration.
- Route aliases during migration.
- Canonical component library.
- Persian status and currency policies.
- Backend availability for QA.

### Verified Backend Dependencies

Accounts, cards, transactions, transfers, beneficiaries, templates, scheduled payments, categories, banks, reports, investments, credit, loans, and AI have controllers/models.

### Not Verified

Tags, bills, recharge, global search aggregation, net-worth aggregation, external bank connection, push delivery, and scan/deposit/withdraw services.

### Cross-Team

- Product naming for Credit, Grow, and Pay.
- Backend confirmation for payment/loan contracts.
- Security review for token storage.
- Accessibility criteria.
- QA route and journey scripts.

## 23. Verification Checklist

### Navigation

- [ ] All 35 existing routes accounted for.
- [ ] Six target tabs reachable.
- [ ] No dead screens after redirects.
- [ ] Global header on primary tabs.
- [ ] Notifications reachable everywhere.
- [ ] Profile reachable from Home/header.
- [ ] Back behavior correct.
- [ ] Deep links verified.

### Data Integrity

- [ ] No hard-coded financial prices.
- [ ] Loan payment endpoint verified.
- [ ] Delete endpoints verified.
- [ ] Payment idempotency verified.
- [ ] Refresh and invalidation verified.

### UX States

- [ ] Loading.
- [ ] Empty.
- [ ] Error.
- [ ] Refreshing.
- [ ] Offline.
- [ ] Partial.
- [ ] Idle.
- [ ] Review.
- [ ] Processing.
- [ ] Success.
- [ ] Failure.

### Persian/RTL

- [ ] Statuses localized.
- [ ] Logical layout direction.
- [ ] Correct back icons.
- [ ] Jalali dates.
- [ ] Consistent currency.
- [ ] Mixed Persian/English policy.

### Accessibility

- [ ] Accessible labels.
- [ ] Roles.
- [ ] Focus order.
- [ ] Touch targets.
- [ ] Contrast.
- [ ] Screen-reader flow for financial actions.

### Trust

- [ ] Critical numbers readable.
- [ ] Confirmation before mutation.
- [ ] No destructive action without review.
- [ ] Errors explain recovery.
- [ ] AI does not directly mutate financial records.

## 24. Final Recommended Implementation Order

1. Stabilize contracts: loan payment, budget delete, goal delete, API environment.
2. Design-system foundation.
3. Navigation/IA.
4. Home command center.
5. Money: accounts, cards, transactions.
6. Pay: payment center, beneficiaries, transfer, history.
7. Grow: goals, budgets, investments, analytics.
8. Credit: overview, score, eligibility, loans, payments.
9. AI: history, insights, contextual recommendations.
10. Global polish: accessibility, offline, RTL, responsive, journey QA.

## 25. Final Status

```text
CURRENT_UX_STATUS:
  A fragmented feature-tree experience with 35 mobile screens, substantial verified backend capability, incomplete IA, missing Money/Pay management UI, mock/disconnected financial details, inconsistent design system, and partial RTL/state coverage.

TARGET_UX_STATUS:
  A Persian-first Financial Operating System with HOME / MONEY / PAY / GROW / CREDIT / AI navigation, entity-centric screens, trustworthy summaries, readable dense data, contextual AI, and consistent global states.

CRITICAL_BLOCKERS:
  1. Loan payment mobile/backend endpoint mismatch.
  2. Budget and goal delete HTTP method mismatch.
  3. Hard-coded API base URL.
  4. Mock asset prices on Asset Detail.
  5. Missing core Money/Pay screens despite existing backend capability.
  6. No canonical navigation and page-shell system.

IMPLEMENTATION_ORDER:
  Contracts → Design system → Navigation/IA → Home → Money → Pay → Grow → Credit → AI → Global polish.

NEXT_STEP:
  Implement Wave 0 contract verification and stabilization, then Wave 1 canonical design-system primitives. Before changing navigation, create route inventory smoke tests for the existing 35 routes and target redirects.
```
