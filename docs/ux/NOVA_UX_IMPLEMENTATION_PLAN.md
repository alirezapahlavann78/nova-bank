# Nova UX Implementation Plan

**Stage:** 2 — Specification only  
**Waves:** Fixed 0–9 from `NOVA_UX_MIGRATION_PLAN.md`  
**Constraint:** This document does not modify source code or invent backend capability.

## 1. Fixed Implementation Sequence

```text
Wave 0 — Contract / Trust Stabilization
  ↓
Wave 1 — Canonical Design System
  ↓
Wave 2 — Navigation / IA
  ↓
Wave 3 — Home
  ↓
Wave 4 — Money
  ↓
Wave 5 — Pay
  ↓
Wave 6 — Grow
  ↓
Wave 7 — Credit
  ↓
Wave 8 — AI
  ↓
Wave 9 — Global States / Accessibility / Polish
```

No additional waves, phases, or sprints are introduced.

## 2. Dependency Graph

```text
Wave 0
├── Loan payment contract
├── Budget/goal delete contracts
├── API environment configuration
├── Auth/root behavior verification
└── Payment idempotency verification

Wave 1
├── Tokens
├── Typography
├── Spacing
├── Surfaces
├── Canonical components
└── State primitives

Wave 2
├── Six-tab shell
├── Global header
├── Route aliases
└── Route smoke tests

Wave 3 — Home
├── Requires accounts/reports data
├── Requires transaction list data
└── Can proceed in parallel with Wave 4 foundations

Wave 4 — Money
├── Accounts
├── Cards
├── Transactions
├── Reports
└── Connected Banks

Wave 5 — Pay
├── Beneficiaries
├── Templates
├── Scheduled payments
├── Send/transfer split
└── Payment history/detail

Wave 6 — Grow
├── Grow overview
├── Goals/budgets
├── Portfolio hierarchy
└── Wealth analytics

Wave 7 — Credit
├── Credit overview/score/health
├── Eligibility/products/application
├── Loans/installments
└── Loan payment after Wave 0 fix

Wave 8 — AI
├── Ask Nova refactor
├── Conversation history
├── Contextual entry points
└── Tool confirmation UX

Wave 9 — Polish
├── Offline/partial states
├── Accessibility
├── Responsive QA
├── RTL audit
└── Journey verification
```

Parallelizable work after Wave 2:

- Money entity screens can be built while Pay contract work is completed.
- Grow UI refactors can proceed after canonical components are stable.
- AI conversation history can proceed independently of Credit screens.
- Accessibility fixes should accompany each wave, not wait exclusively for Wave 9.

## 3. Wave 0 — Contract / Trust Stabilization

### Prerequisites

- No UI migration begins until financial contracts are verified.
- QA environment is reachable.
- Existing route inventory is frozen.

### Work

1. Align mobile loan payment request with `POST /loans/{id}/pay`.
2. Align budget deletion with `DELETE /budgets/{id}`.
3. Align goal deletion with `DELETE /goals/{id}`.
4. Replace hard-coded API URL with environment configuration.
5. Verify authenticated root/welcome behavior.
6. Verify payment idempotency key behavior.
7. Verify loan payment state transitions.
8. Establish route smoke tests for all 35 existing routes.

### Screens Affected

- `/lending/loan/[loanId]/pay`
- `/budgets`
- `/budgets/[id]`
- `/goals`
- `/goals/[id]`
- `/payments/new`
- `/`

### Components Affected

- API client.
- Mutation confirmation states.
- Error and retry states.

### Backend Dependencies

| Dependency | Status |
|---|---|
| `POST /loans/{id}/pay` | VERIFIED backend, ENDPOINT MISMATCH mobile |
| `DELETE /budgets/{id}` | VERIFIED backend, MISMATCH mobile |
| `DELETE /goals/{id}` | VERIFIED backend, MISMATCH mobile |
| Payment idempotency | PARTIALLY VERIFIED |
| Root auth behavior | NEEDS VERIFICATION |
| API environment configuration | MISSING |

### Risks

- Fixing contracts without tests may break existing journeys.
- Payment duplicate submission.
- Destructive delete actions failing silently.

### Acceptance Criteria

- [ ] Loan payment reaches verified endpoint.
- [ ] Budget/goal delete use correct HTTP methods.
- [ ] API URL comes from environment.
- [ ] No duplicate payment on retry without user intent.
- [ ] Existing route smoke suite passes.

### Verification Gate

Do not enter Wave 2 until all P0 contract mismatches are resolved or explicitly blocked with a user-safe state.

## 4. Wave 1 — Canonical Design System

### Prerequisites

- Wave 0 complete or contract blockers isolated.
- Design tokens approved.
- Component inventory accepted.

### Work

1. Implement semantic color tokens for light/dark.
2. Implement typography, spacing, radius, elevation tokens.
3. Implement surface hierarchy.
4. Implement 50 canonical components.
5. Split `ScreenState` into loading/empty/error/offline primitives.
6. Establish `MoneyAmount` and `StatusBadge`.
7. Establish accessibility and RTL utilities.

### Components Affected

All 50 canonical components in `NOVA_DESIGN_SYSTEM_SPEC.md`.

### Backend Dependencies

None. This wave is primarily UI infrastructure.

### Route Dependencies

None required, but components should be introduced in isolated feature slices before mass migration.

### Risks

- Component migration becoming a visual-only rewrite.
- Breaking existing screens during replacement.
- Leaving duplicate components active.

### Acceptance Criteria

- [ ] Every canonical component has state and a11y coverage.
- [ ] No duplicate `GlassInput`, button, card, or state architecture remains.
- [ ] Critical financial values use `MoneyAmount`.
- [ ] Dense data does not use glass.
- [ ] Dark mode passes contrast checks.

### Verification Gate

Component tests or visual QA must cover default, loading, error, disabled, RTL, light, and dark states where applicable.

## 5. Wave 2 — Navigation / IA

### Prerequisites

- Wave 1 canonical page/header components ready.
- Target route map approved.
- Existing deep-link behavior inventoried.

### Work

1. Introduce `HOME / MONEY / PAY / GROW / CREDIT / AI` tabs.
2. Add global header with search entry, notifications, and profile avatar.
3. Keep Profile out of bottom navigation.
4. Move feature stacks under target parents.
5. Add redirects/aliases for all 35 existing routes.
6. Standardize back behavior.

### Screens Affected

All existing 35 routes and target route shell.

### Components Affected

- `NovaPage`
- `PageHeader`
- Bottom tab shell
- Global header
- Route alias logic

### Backend Dependencies

None for shell; target routes may render blocked/unavailable states until later waves.

### Risks

- Broken deep links.
- Users losing access to current screens.
- Temporary duplicate routes.

### Acceptance Criteria

- [ ] Six primary tabs exist.
- [ ] Profile is header-only.
- [ ] All current routes redirect or render target equivalent.
- [ ] Route smoke tests pass.
- [ ] Back behavior is consistent.

### Verification Gate

Route migration map must be fully covered by automated or scripted checks before feature migration.

## 6. Wave 3 — Home

### Prerequisites

- Navigation shell complete.
- Account/transaction/report services available or blocked states defined.

### Work

1. Build money summary.
2. Build financial position sections only from verified data.
3. Integrate recent transactions.
4. Add quick actions.
5. Add attention/upcoming sections.
6. Add financial health, Grow, and Credit summaries.
7. Add one contextual AI insight.

### Screens

- `HOME-001`

### Components

- `BalanceSummary`
- `QuickAction`
- `TransactionRow`
- `AIInsightCard`
- `PortfolioCard`
- `CreditScoreCard`

### Backend Dependencies

| Capability | Status |
|---|---|
| Accounts | VERIFIED backend, MISSING mobile UI |
| Transactions | VERIFIED backend, MISSING mobile UI |
| Reports | VERIFIED |
| Portfolio | VERIFIED |
| Credit | VERIFIED |
| Net-worth aggregate | NOT VERIFIED |

### Risks

- Home becoming a card dump.
- Showing zero instead of unavailable.
- Fake recommendations.

### Acceptance Criteria

- [ ] Available money appears above the fold.
- [ ] No fake net worth.
- [ ] Recent activity is real or correctly empty.
- [ ] Quick actions are limited to primary tasks.
- [ ] All sections have loading/empty/error states.

### Verification Gate

Home must pass a "first five seconds" test: money, attention, recent activity, next action.

## 7. Wave 4 — Money

### Prerequisites

- Accounts, cards, and transactions services implemented against verified endpoints.
- Money route hierarchy ready.

### Work

1. Money Overview.
2. Accounts list/detail.
3. Cards list/detail.
4. Transactions list/detail/search.
5. Cash Flow.
6. Categories.
7. Reports.
8. Connected Banks.

### Screens

`MONEY-001` through `MONEY-011`.

### Components

- `AccountCard`
- `BankCard`
- `TransactionRow`
- `TransactionDetail`
- `CategoryChip`
- `SearchField`
- `FilterChip`

### Backend Dependencies

| Capability | Endpoint | Status |
|---|---|---|
| Accounts | `/accounts` | VERIFIED backend |
| Account detail | `/accounts/{id}` | VERIFIED backend |
| Cards | `/cards` | VERIFIED backend |
| Card detail | `/cards/{id}` | VERIFIED backend |
| Transactions | `/transactions` | VERIFIED backend |
| Transaction detail | `/transactions/{id}` | VERIFIED backend |
| Categories | `/categories` | VERIFIED backend |
| Banks | `/banks` | VERIFIED backend |
| Reports | `/reports/*` | VERIFIED |
| Tags | N/A | MISSING |
| External linking | N/A | NOT VERIFIED |

### Risks

- Exposing raw account identifiers.
- Dense unreadable lists.
- Search/filter state loss.

### Acceptance Criteria

- [ ] All verified Money capabilities have mobile surfaces.
- [ ] Transaction search preserves filters and pagination.
- [ ] Cards never expose PAN/CVV.
- [ ] Tags and unsupported link actions remain hidden.

### Verification Gate

Money journey: find an account → find a transaction → understand spending.

## 8. Wave 5 — Pay

### Prerequisites

- Payment contract verified.
- Beneficiary, template, and scheduled services connected.
- Send and transfer flows separated.

### Work

1. Payment Center.
2. Send Money.
3. Transfer.
4. Beneficiaries.
5. Templates.
6. Scheduled Payments.
7. Payment History.
8. Payment Detail.

### Screens

`PAY-001` through `PAY-008`.

### Components

- `ReviewSummary`
- `ConfirmationSheet`
- `PaymentRow`
- `PaymentDetail`
- `PrimaryButton`
- `SuccessState`
- `ErrorState`

### Backend Dependencies

| Capability | Endpoint | Status |
|---|---|---|
| Payments | `/payments` | VERIFIED |
| Payment detail | `/payments/{id}` | VERIFIED |
| Cancel payment | `/payments/{id}/cancel` | VERIFIED |
| Payment audit | `/payments/{id}/audit` | VERIFIED |
| Beneficiaries | `/beneficiaries` | VERIFIED backend |
| Templates | `/payment-templates` | VERIFIED backend |
| Scheduled | `/scheduled-payments` | VERIFIED backend |
| Transfers | `/transfers` | VERIFIED backend |
| Bills | N/A | NOT VERIFIED |
| Recharge | N/A | NOT VERIFIED |

### Risks

- Duplicate payment.
- Hidden fees.
- Technical banking terminology dominating UX.
- Mutations without review.

### Acceptance Criteria

- [ ] Every payment has review and confirmation.
- [ ] Processing prevents double submission.
- [ ] Success/failure routes to verifiable state.
- [ ] Bills/recharge hidden until verified.

### Verification Gate

Send, transfer, scheduled, and history journeys must pass with idempotency and failure recovery.

## 9. Wave 6 — Grow

### Prerequisites

- Grow hierarchy established.
- Asset service connected.
- Goal/budget contracts stable.

### Work

1. Grow Overview.
2. Goals list/detail/editor.
3. Budgets list/detail/editor.
4. Portfolio.
5. Investment Accounts and detail.
6. Holdings.
7. Asset Detail rebuild.
8. Investment Transactions.
9. Watchlists and detail.
10. Wealth Analytics.

### Screens

`GROW-001` through `GROW-016`.

### Components

- `GoalCard`
- `BudgetCard`
- `PortfolioCard`
- `HoldingRow`
- `ProgressBar`
- `DataList`

### Backend Dependencies

| Capability | Endpoint | Status |
|---|---|---|
| Goals | `/goals` | VERIFIED |
| Goal progress | `/goals/{id}/progress` | VERIFIED |
| Budgets | `/budgets` | VERIFIED |
| Portfolio | `/investments/portfolio` | VERIFIED |
| Investment accounts | `/investments/accounts` | VERIFIED |
| Holdings | `/investments/portfolio/holdings` | VERIFIED |
| Assets | `/investments/assets/{id}` | VERIFIED backend |
| Investment transactions | `/investments/transactions` | VERIFIED |
| Watchlists | `/investments/watchlists` | VERIFIED |
| Performance | `/investments/portfolio/performance` | VERIFIED |
| Allocation | `/investments/portfolio/allocation` | VERIFIED |
| Savings | N/A | MISSING |

### Risks

- Hard-coded asset prices.
- Duplicate analytics.
- Fake growth projections.

### Acceptance Criteria

- [ ] Asset Detail uses real API data or unavailable states.
- [ ] Wealth Analytics replaces duplicate analytics concepts.
- [ ] Goal/budget progress is mathematically clear.
- [ ] No savings UI until capability exists.

### Verification Gate

Portfolio → holding → asset → transaction journey must use only verified data.

## 10. Wave 7 — Credit

### Prerequisites

- Wave 0 loan payment contract fixed.
- Credit/lending services verified.
- Status dictionary complete.

### Work

1. Credit Overview.
2. Credit Score.
3. Score History.
4. Financial Health.
5. Eligibility.
6. Loan Products.
7. Loan Application.
8. Applications and detail.
9. My Loans.
10. Loan Detail.
11. Installments.
12. Loan Payment.

### Screens

`CREDIT-001` through `CREDIT-013`.

### Components

- `CreditScoreCard`
- `FinancialHealthCard`
- `LoanCard`
- `InstallmentRow`
- `ReviewSummary`
- `StatusBadge`

### Backend Dependencies

| Capability | Endpoint | Status |
|---|---|---|
| Credit score | `/credit/score` | VERIFIED |
| Score history | `/credit/score-history` | VERIFIED backend, MISSING UI |
| Financial health | `/credit/financial-health` | VERIFIED |
| Eligibility | `/credit/eligibility` | VERIFIED |
| Loan products | `/loan-products` | VERIFIED |
| Applications | `/loan-applications` | VERIFIED |
| Application detail | `/loan-applications/{id}` | VERIFIED backend, MISSING UI |
| Loans | `/loans` | VERIFIED |
| Loan detail | `/loans/{id}` | VERIFIED |
| Installments | `/loans/{id}/installments` | VERIFIED |
| Loan payment | `/loans/{id}/pay` | VERIFIED backend, MISMATCH mobile |

### Risks

- Misleading approval language.
- Raw status enums.
- Overpayment or duplicate payment.
- Hiding fees/terms.

### Acceptance Criteria

- [ ] Credit Score, Health, Eligibility, Product, Application, Loan, and Payment remain distinct.
- [ ] All statuses are Persian and semantically colored.
- [ ] Payment uses correct endpoint and idempotency.
- [ ] Loan schedule is complete.

### Verification Gate

Eligibility → product → application → loan → installment → payment journey must pass.

## 11. Wave 8 — AI

### Prerequisites

- AI chat/confirm endpoints stable.
- AI security boundary confirmed.
- Contextual AI data available without fabrication.

### Work

1. Refactor Ask Nova.
2. Add Conversations.
3. Add Conversation Detail.
4. Add contextual AI entry points.
5. Add Insights and Recommendations only when capability is verified.
6. Standardize tool confirmation UX.

### Screens

`AI-001` through `AI-005`.

### Components

- `AIMessage`
- `AIInsightCard`
- `AIActionCard`
- `ConfirmationSheet`

### Backend Dependencies

| Capability | Endpoint | Status |
|---|---|---|
| Chat | `POST /ai/chat` | VERIFIED |
| Confirm tool | `POST /ai/confirm` | VERIFIED |
| Conversations | `GET /ai/conversations` | VERIFIED |
| Conversation detail | `GET /ai/conversations/{id}` | VERIFIED |
| Agents | `GET /ai/agents` | VERIFIED |
| Insights endpoint | N/A | NOT VERIFIED |
| Recommendations endpoint | N/A | NOT VERIFIED |

### Risks

- AI appearing to own financial mutations.
- Fake predictions.
- Unclear tool consequences.

### Acceptance Criteria

- [ ] AI never directly accesses Prisma/database.
- [ ] Every mutation proposal uses domain-service confirmation.
- [ ] AI attribution is visible.
- [ ] Insights/recommendations remain blocked until verified.

### Verification Gate

AI action proposal must show rationale, consequence, and explicit confirmation before any mutation.

## 12. Wave 9 — Global States / Accessibility / Polish

### Prerequisites

All feature waves implemented or explicitly blocked.

### Work

1. Offline and partial/stale states.
2. Accessibility audit.
3. RTL audit.
4. Responsive layout QA.
5. Contrast audit.
6. Persian status dictionary.
7. Journey verification.
8. Route and component duplication cleanup.

### Screens

All 60 target screens.

### Components

All canonical components.

### Risks

- Late accessibility fixes becoming redesigns.
- State inconsistencies.
- Undetected broken deep links.

### Acceptance Criteria

- [ ] Every page has required states.
- [ ] Every mutation has review/confirmation.
- [ ] Every status is localized.
- [ ] Every critical number is readable.
- [ ] Accessibility criteria pass.
- [ ] No duplicate component architecture remains.

### Verification Gate

Full journey suite and accessibility audit must pass before release.

## 13. Backend / API Dependency Matrix

The matrix records what the UX can rely on today. It does not invent an endpoint or promote a missing capability to a shipped state. `MOBILE UI MISSING` means that a backend contract exists but the target screen has not been implemented; it does not mean the backend is missing.

Backend/API dependencies documented: **28**.

| UI area | Mobile integration point | Backend endpoint/module | Database domain | Status |
|---|---|---|---|---|
| Authentication | Login, register, session/auth storage | `auth` module | `User`, `Session` | VERIFIED |
| Profile | Target Profile hub | `GET /users/me` | `User` | VERIFIED backend / MOBILE UI MISSING |
| Accounts | Money accounts and detail | `accounts` module | `Account` | VERIFIED backend / MOBILE UI MISSING |
| Cards | Money cards and detail | `cards` module | `Card` | VERIFIED backend / MOBILE UI MISSING |
| Transactions | Transactions and detail | `transactions` module | `Transaction` | VERIFIED backend / MOBILE UI MISSING |
| Transfers | Transfer flow | `transfers` module | `Transfer` | VERIFIED backend / MOBILE UI MISSING |
| Categories | Category management | `categories` module | `Category` | VERIFIED backend / MOBILE UI MISSING |
| Banks | Bank directory and connection state | `banks` module | `Bank` | VERIFIED backend / MOBILE UI MISSING |
| Recurring | Recurring transaction rules | `recurring` module | `RecurringTransaction` | VERIFIED backend / MOBILE UI MISSING |
| Reports | Money reports and wealth analytics | `reports` module | Transaction, account, investment domains | PARTIALLY VERIFIED |
| Payments | Send, transfer, history, detail | `payments` module | `Payment`, `PaymentExecution`, `IdempotencyKey` | PARTIALLY VERIFIED |
| Beneficiaries | Beneficiary picker and manager | `beneficiaries` module | `Beneficiary` | VERIFIED backend / MOBILE UI MISSING |
| Templates | Saved payment templates | `payment-templates` module | `PaymentTemplate` | VERIFIED backend / MOBILE UI MISSING |
| Scheduled | Scheduled payment manager | `scheduled-payments` module | `ScheduledPayment` | VERIFIED backend / MOBILE UI MISSING |
| Budgets | Budget list/detail/editor | `budgets` module | `Budget` | PARTIALLY VERIFIED / DELETE ENDPOINT MISMATCH |
| Goals | Goal list/detail/editor | `goals` module | `Goal` | PARTIALLY VERIFIED / DELETE ENDPOINT MISMATCH |
| Investments | Portfolio, holdings, assets, transactions | `investments` module | `InvestmentAccount`, `Holding`, `Asset`, `InvestmentTransaction` | PARTIALLY VERIFIED / ASSET PRICES MOCK |
| Credit | Score, history, health, eligibility | `credit` module | `CreditProfile`, `CreditScoreHistory` | PARTIALLY VERIFIED |
| Lending | Products, applications, loans, installments, payment | `lending` module | `LoanProduct`, `LoanApplication`, `Loan`, `LoanInstallment`, `LoanPayment` | PARTIALLY VERIFIED / PAYMENT ENDPOINT MISMATCH |
| AI | Ask Nova, conversations, tool confirmation | `ai` module | `AIConversation`, `AIMessage`, `AIToolExecution` | PARTIALLY VERIFIED |
| Notifications | Notification center and detail | `notifications` module | `Notification` | PARTIALLY VERIFIED / DELIVERY NOT VERIFIED |
| Global search | Global search page | Aggregate endpoint not found | No dedicated aggregate model verified | NOT VERIFIED |
| Savings | Savings target page | No model/endpoint verified | No dedicated model verified | MISSING |
| Tags | Transaction tagging | No model/endpoint verified | No dedicated model verified | MISSING |
| Bills | Bill pay candidate | No provider/endpoint verified | No dedicated model verified | NOT VERIFIED |
| Recharge | Mobile recharge candidate | No provider/endpoint verified | No dedicated model verified | NOT VERIFIED |
| Net worth | Home and wealth aggregates | Aggregate endpoint not found | Derived across account/investment/credit domains | NOT VERIFIED |
| External bank linking | Connected-bank management | OAuth/linking provider not verified | Bank connection state not verified | NOT VERIFIED |

## 14. Route Migration Summary

- Existing routes audited: **35**.
- Route migrations specified: **35**.
- Migration redirect/alias records: **31**.
- Target primary tabs: **6** — `HOME`, `MONEY`, `PAY`, `GROW`, `CREDIT`, `AI`.
- New target pages not represented by the current 35 routes: **25**.

Migration rules:

1. Preserve every old route as a redirect or alias until journey tests and external deep links are verified.
2. Do not delete old routes during the Wave 2 migration.
3. Resolve `/` from authentication state: authenticated users go to `/home`; unauthenticated users go to login/welcome.
4. Keep Profile in the header and Profile destination, never as a seventh bottom tab.
5. Move notification preferences into Profile as a settings section.
6. Split `/payments/new` into `/pay/send` for people and `/pay/transfer` for own accounts, preserving the old route as an intent-aware redirect.
7. Merge `/investments/analytics` into `/grow/wealth-analytics`.
8. Rename the Lending domain to Credit while keeping all old lending paths as aliases.
9. Verify every notification, email, and saved deep link before removing aliases.

## 15. Component Migration Summary

- Canonical components specified: **50**.
- Duplicate/current component families resolved: **12**.
- Explicit component migration mappings: **13**.

| Current concept | Canonical resolution |
|---|---|
| `GlassView` | `CardSurface` |
| `GlassCard` | `CardSurface` |
| `GlassListCard` | `BaseSurface` list group |
| Duplicate `Glass.tsx` input | Single `GlassInput` component |
| `GlassButton` | `PrimaryButton`, `SecondaryButton`, or `TertiaryButton` |
| Current `PrimaryButton` | Canonical `PrimaryButton` |
| Current `SecondaryButton` | Canonical `SecondaryButton` |
| Current `SectionHeader` | Canonical `SectionHeader` |
| `SectionTitle` | Canonical `SectionHeader` |
| `ScreenState` | `LoadingState`, `EmptyState`, `ErrorState`, `OfflineState` |
| Local status styles | `StatusBadge` |
| Local progress visuals | `ProgressBar` |
| Local amount text | `MoneyAmount` |

Glass remains a selective material. Forms, dense financial tables, critical values, validation errors, and destructive confirmations use solid or near-solid readable surfaces.

## 16. Global Acceptance Criteria

1. **IA correctness**: Primary navigation is exactly `HOME / MONEY / PAY / GROW / CREDIT / AI`; Profile is header-accessible only.
2. **Real integration**: Every shipped feature uses the verified service contract; no screen presents mock data as live data.
3. **Complete states**: Every page defines loading, empty, error, offline, unavailable, success, and mutation-pending behavior where applicable.
4. **RTL and Persian**: Layout mirrors correctly; financial amounts remain LTR with tabular figures; status copy uses the approved Persian dictionary.
5. **Accessibility**: Touch targets, headings, focus order, labels, contrast, and screen-reader announcements meet the design-system criteria.
6. **Financial trust**: Amount, currency, precision, sign, pending/cleared state, and unavailable state are unambiguous.
7. **Canonical components**: No duplicate page-shell, button, input, section-header, status, progress, or amount architecture remains.
8. **Mutation safety**: Every financial mutation shows consequences and requires explicit confirmation; idempotent operations expose their final state.
9. **Security boundaries**: AI can propose an action but never directly accesses Prisma or mutates financial records; execution goes through the owning domain service.
10. **Route integrity**: All old routes remain redirectable until external-link verification passes.

## 17. Wave Verification Gates

| Wave | Gate |
|---|---|
| 0 | Security, environment, payment method contracts, loan-payment contract, and destructive method contracts pass automated checks. |
| 1 | All 50 canonical components pass visual, RTL, state, accessibility, and token-compliance tests. |
| 2 | Six-tab IA, all 35 route migrations, 31 aliases, root auth behavior, and Profile access pass journey tests. |
| 3 | Home renders verified balances and actions with complete states; no aggregate is shown without a verified source. |
| 4 | Accounts, cards, transactions, categories, banks, cash flow, reports, and account/card detail use live verified data. |
| 5 | Send/transfer split, beneficiaries, templates, scheduled payments, history, and detail complete safely with idempotent behavior. |
| 6 | Goals, budgets, portfolio, holdings, assets, investment transactions, watchlists, and wealth analytics use verified data; mock prices are removed. |
| 7 | Credit eligibility, products, application, loans, installments, and payment use the corrected lending contract and explicit confirmation. |
| 8 | AI conversations and tool confirmation work without direct database access; unverified insight and recommendation pages remain blocked. |
| 9 | Full journey, offline/stale-state, RTL, accessibility, contrast, responsive, localization, and route-cleanup audits pass. |

## 18. Unresolved Blockers

Unresolved blockers: **17**.

| # | Blocker | Status |
|---|---|---|
| 1 | Loan payment endpoint mismatch | ENDPOINT MISMATCH |
| 2 | Budget delete method mismatch | ENDPOINT MISMATCH |
| 3 | Goal delete method mismatch | ENDPOINT MISMATCH |
| 4 | Hard-coded mobile API base URL | NEEDS PRODUCT/INFRA DECISION |
| 5 | Access token stored in AsyncStorage | SECURITY REVIEW REQUIRED |
| 6 | Asset Detail hard-coded prices | MOCK |
| 7 | Global search aggregation | NOT VERIFIED |
| 8 | Net-worth aggregation | NOT VERIFIED |
| 9 | Savings model/endpoint | MISSING |
| 10 | Tag model/endpoint | MISSING |
| 11 | Bill products/providers/payments | NOT VERIFIED |
| 12 | Recharge providers/payments | NOT VERIFIED |
| 13 | AI Insights endpoint and data contract | NOT VERIFIED |
| 14 | AI Recommendations endpoint and data contract | NOT VERIFIED |
| 15 | External bank OAuth/linking provider and security review | NOT VERIFIED |
| 16 | Push delivery and notification deep links | NOT VERIFIED |
| 17 | Scan/deposit/withdraw capability contracts | NOT VERIFIED |

## 19. Final Specification Verification

- [x] Existing screens audited: 35.
- [x] Existing route migrations specified: 35.
- [x] Target pages specified: 60.
- [x] Target pages missing from current app: 25.
- [x] Canonical components specified: 50.
- [x] Primary tabs fixed to exactly six.
- [x] Profile specified as header-accessible, not a primary tab.
- [x] AI direct Prisma/database access explicitly prohibited.
- [x] Verified capabilities preserved in page contracts.
- [x] Mock, missing, mismatched, and unverified capabilities explicitly labeled.
- [x] Backend/API dependencies documented: 28.
- [x] Migration waves fixed to `0–9`.
- [x] Documentation-only constraint respected.
