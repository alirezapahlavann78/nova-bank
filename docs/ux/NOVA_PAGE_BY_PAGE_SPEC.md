# Nova Page-by-Page UX/IA Specification

**Stage:** 2 — Specification only  
**Existing screens audited:** 35  
**Target screens specified:** 60  
**Blocked capability candidates:** Savings, Tags, Bills, Recharge, global search aggregation, net-worth aggregation, and external bank connection.

## 1. Global Specification Contract

These defaults apply to every page unless a page record overrides them.

| Field | Default |
|---|---|
| Loading | Skeleton matching final layout; no fake financial data |
| Empty | `EmptyState` with one primary recovery action |
| Error | `ErrorState` with human-readable message and retry |
| Offline | `OfflineState`; cached data may remain visibly stale |
| Partial/Stale | Render available sections, mark missing sections unavailable |
| Refresh | Pull-to-refresh where endpoint is verified |
| Security | Authenticated route; token handled by API client |
| AI context | Optional `AIInsightCard`; never replaces primary data |
| AI actions allowed | Informational and analytical only |
| AI mutation | Always requires backend tool confirmation |
| RTL | Persian RTL page, LTR financial/technical values |
| Accessibility | 44px targets, semantic headings, status text, contrast |
| Responsive | 20px horizontal padding; 720px max content width |
| Analytics | `screen_view`; domain event defined per page |
| Glass | Not used for dense data, forms, or critical values |

## 2. Target Primary IA

```text
HOME
MONEY
PAY
GROW
CREDIT
AI
```

Profile is accessible from the global header/avatar and is **not** a primary tab.

## 3. Target Navigation Tree

```text
HOME
└── Financial Command Center

MONEY
├── Overview
├── Accounts
├── Cards
├── Transactions
├── Cash Flow
├── Categories
├── Reports
└── Connected Banks

PAY
├── Payment Center
├── Send Money
├── Transfer
├── Beneficiaries
├── Templates
├── Scheduled Payments
├── History
└── Payment Detail

GROW
├── Overview
├── Goals
├── Budgets
├── Portfolio
├── Investment Accounts
├── Holdings
├── Assets
├── Investment Transactions
├── Watchlists
└── Wealth Analytics

CREDIT
├── Overview
├── Credit Score
├── Score History
├── Financial Health
├── Eligibility
├── Loan Products
├── Application
├── Applications
├── My Loans
├── Loan Detail
├── Installments
└── Loan Payment

AI
├── Ask Nova
├── Conversations
├── Insights
└── Recommendations

GLOBAL
├── Notifications
├── Notification Detail
└── Search
```

## 4. Existing Route Migration Map

All 35 current routes are accounted for. No route source is changed in this stage.

| Current route | Current screen | Target route | Migration action | Redirect/alias | Risk | Dependency |
|---|---|---|---|---|---|---|
| `/` | Welcome | `/home` or auth-aware route | REMOVE/REDIRECT | Yes | Auth ambiguity | Root guard decision |
| `/(auth)/login` | Login | `/(auth)/login` | REFACTOR | No | Low | Auth contract |
| `/(auth)/register` | Register | `/(auth)/register` | REFACTOR | No | Low | Auth contract |
| `/(tabs)/dashboard` | Dashboard | `/home` | REBUILD | Yes | Broken deep links | Accounts/reports data |
| `/(tabs)/ai` | AI Assistant | `/ai` | MOVE/REFACTOR | Yes | Conversation state | AI endpoints |
| `/(tabs)/lending` | Lending hub | `/credit` | MOVE/REFACTOR | Yes | Label change | Credit endpoints |
| `/analytics` | Analytics | `/money/reports` | MOVE | Yes | Report duplication | Reports endpoints |
| `/budgets` | Budget list | `/grow/budgets` | MOVE/REFACTOR | Yes | Deep links | Budgets |
| `/budgets/new` | New budget | `/grow/budgets/new` | MOVE/REFACTOR | Yes | Form state | Budget create |
| `/budgets/[id]` | Budget detail | `/grow/budgets/[id]` | MOVE/REFACTOR | Yes | Deep links | Budget detail |
| `/budgets/[id]/edit` | Edit budget | `/grow/budgets/[id]/edit` | MOVE/REFACTOR | Yes | Form state | Budget update |
| `/goals` | Goal list | `/grow/goals` | MOVE/REFACTOR | Yes | Deep links | Goals |
| `/goals/new` | New goal | `/grow/goals/new` | MOVE/REFACTOR | Yes | Form state | Goal create |
| `/goals/[id]` | Goal detail | `/grow/goals/[id]` | MOVE/REFACTOR | Yes | Deep links | Goal detail |
| `/goals/[id]/edit` | Edit goal | `/grow/goals/[id]/edit` | MOVE/REFACTOR | Yes | Form state | Goal update |
| `/investments` | Investments overview | `/grow/portfolio` | MOVE/REFACTOR | Yes | IA change | Portfolio endpoints |
| `/investments/accounts` | Investment accounts | `/grow/investments/accounts` | MOVE/REFACTOR | Yes | Deep links | Investment accounts |
| `/investments/analytics` | Investment analytics | `/grow/wealth-analytics` | MOVE/MERGE | Yes | Duplicate analytics | Performance/allocation |
| `/investments/asset/[id]` | Asset detail | `/grow/assets/[id]` | REBUILD | Yes | Mock prices | Asset endpoint |
| `/investments/holdings` | Holdings | `/grow/investments/holdings` | MOVE/REFACTOR | Yes | Deep links | Holdings |
| `/investments/transactions` | Investment transactions | `/grow/investments/transactions` | MOVE/REFACTOR | Yes | Deep links | Investment transactions |
| `/investments/watchlists` | Watchlists | `/grow/investments/watchlists` | MOVE/REFACTOR | Yes | Deep links | Watchlists |
| `/lending/products` | Loan products | `/credit/products` | MOVE/REFACTOR | Yes | Deep links | Loan products |
| `/lending/eligibility` | Eligibility | `/credit/eligibility` | MOVE/REFACTOR | Yes | Deep links | Credit eligibility |
| `/lending/application/new` | New application | `/credit/application` | MOVE/REFACTOR | Yes | Product context | Product/application |
| `/lending/applications` | Applications | `/credit/applications` | MOVE/REFACTOR | Yes | Deep links | Applications |
| `/lending/my-loans` | My loans | `/credit/loans` | MOVE/REFACTOR | Yes | Deep links | Loans |
| `/lending/loan/[loanId]` | Loan detail | `/credit/loans/[loanId]` | MOVE/REFACTOR | Yes | Deep links | Loan detail |
| `/lending/loan/[loanId]/pay` | Loan payment | `/credit/loans/[loanId]/pay` | FIX/MOVE | Yes | Endpoint mismatch | Contract fix |
| `/notifications` | Notifications | `/notifications` | REFACTOR | No | Low | Notifications |
| `/notifications/preferences` | Preferences | `/profile` section | MOVE | Yes | Settings discoverability | Preferences |
| `/notifications/[id]` | Notification detail | `/notifications/[id]` | REFACTOR | No | Low | Notification detail |
| `/payments` | Payment history | `/pay/history` | MOVE/REFACTOR | Yes | Deep links | Payments |
| `/payments/new` | New payment | `/pay/send` or `/pay/transfer` | REBUILD/SPLIT | Yes | Flow split | Payment/transfer |
| `/payments/[id]` | Payment detail | `/pay/history/[paymentId]` | MOVE/REFACTOR | Yes | Deep links | Payment detail |

## 5. Page Specification Format

Each page below provides the required 40 fields. Repeated global fields reference the Global Specification Contract to avoid contradictory implementation details.

### HOME-001 — Financial Command Center

1. ID: `HOME-001`  
2. Name: Home  
3. Persian: خانه  
4. Type: COMMAND  
5. Priority: P0  
6. IA: HOME  
7. Current route: `/(tabs)/dashboard`  
8. Target route: `/home`  
9. Action: REBUILD  
10. Problem: User needs immediate financial orientation  
11. Goal: Understand money, attention items, recent activity, next action  
12. Entry: App launch, bottom tab  
13. Exit: Money, Pay, Grow, Credit, AI, details  
14. Primary action: Transfer/Pay  
15. Secondary actions: View transactions, goals, investments, credit  
16. Hierarchy: available money → total position → attention → recent activity → next best actions  
17. Layout: header/avatar/search/notifications → balance summary → quick actions → attention → recent activity → upcoming → health → Grow/Credit summaries → AI insight  
18. Required: `NovaPage`, `PageHeader`, `BalanceSummary`, `QuickAction`, `TransactionRow`, `AIInsightCard`  
19. Optional: `PortfolioCard`, `CreditScoreCard`, `ProgressCard`  
20. Data: accounts total, recent transactions, upcoming payments, reports, portfolio, credit  
21. API: accounts, transactions, reports, portfolio, credit; net-worth aggregate NOT VERIFIED  
22. Source: mobile services to be added for accounts/transactions; existing reports/investments/credit services  
23–27. States: Global defaults; empty means no accounts/transactions  
28. Refresh: pull-to-refresh all summaries  
29. Form: N/A  
30. Confirmation: N/A  
31. Security: authenticated; no sensitive token display  
32. AI context: one insight max, clearly attributed  
33. AI allowed: summarize and recommend  
34. AI confirmation: any proposed mutation  
35. RTL: global RTL; amounts LTR  
36. A11y: balance announced as amount + currency + state  
37. Responsive: two-column quick actions ≥360px, one column below  
38. Analytics: `home_viewed`, `home_quick_action_selected`  
39. Design: no dashboard card overload; P3 content below fold  
40. Acceptance: top answers available money without scroll; no fake data; every section has state  

### AUTH-001 — Login

1. ID: `AUTH-001`  
2. Name: Login  
3. Persian: ورود  
4. Type: ACTION  
5. Priority: P0  
6. IA: Auth  
7. Current: `/(auth)/login`  
8. Target: `/(auth)/login`  
9. Action: REFACTOR  
10. Problem: Securely access Nova  
11. Goal: Authenticate  
12. Entry: Unauthenticated app, deep link  
13. Exit: Home, register  
14. Primary action: Login  
15. Secondary: Register, recover account if verified  
16. Hierarchy: brand → phone → password → submit → register  
17. Layout: compact centered form on `CriticalSurface`  
18. Required: `NovaPage`, `FormField`, `GlassInput`, `PrimaryButton`  
19. Optional: `ErrorBanner`  
20. Data: phone, password  
21. API: `POST /auth/login` VERIFIED  
22. Source: `services/auth.ts`  
23–27. States: Global defaults; empty N/A  
28. Refresh: N/A  
29. Validation: normalized Iranian phone, required password, field-level errors  
30. Confirmation: N/A  
31. Security: no password logging, secure keyboard, auth errors generic  
32–34. AI: N/A  
35. RTL: phone remains LTR  
36. A11y: fields labeled, errors associated  
37. Responsive: 420 max form width  
38. Analytics: `login_submitted`, `login_succeeded`, `login_failed`  
39. Design: no glass over form  
40. Acceptance: successful auth lands on Home; failures are actionable  

### AUTH-002 — Register

1. ID: `AUTH-002`  
2. Name: Register  
3. Persian: ثبت‌نام  
4. Type: ACTION  
5. Priority: P0  
6. IA: Auth  
7. Current: `/(auth)/register`  
8. Target: `/(auth)/register`  
9. Action: REFACTOR  
10. Problem: Create a Nova identity  
11. Goal: Register and enter Home  
12. Entry: Login  
13. Exit: Home, Login  
14. Primary action: Create account  
15. Secondary: Return to login  
16. Hierarchy: identity fields → credentials → submit  
17. Layout: grouped form with logical focus order  
18. Required: `NovaPage`, `FormField`, `GlassInput`, `PrimaryButton`  
19. Optional: password strength indicator  
20. Data: phone, password, first/last name, optional email  
21. API: `POST /auth/register` VERIFIED  
22. Source: `services/auth.ts`  
23–27. States: Global defaults  
28. Refresh: N/A  
29. Validation: required names, valid phone, password policy, optional email  
30. Confirmation: explicit account creation  
31. Security: password hidden; no sensitive logging  
32–34. AI: N/A  
35. RTL: phone/email LTR  
36. A11y: field labels and error association  
37. Responsive: 420 max form width  
38. Analytics: `register_submitted/succeeded/failed`  
39. Design: clear error recovery  
40. Acceptance: valid input creates account and routes Home

### PROFILE-001 — Profile & Settings Hub

| Fields 1–8 | Fields 9–16 | Fields 17–24 | Fields 25–32 | Fields 33–40 |
|---|---|---|---|---|
| 1 ID: PROFILE-001 | 9 Action: NEW | 17 Layout: header/avatar → security → identity → notifications → privacy → devices → connected banks → subscription → AI prefs → support → invite → about | 25 Error: Global | 33 AI allowed: preferences only |
| 2 Name: Profile | 10 Problem: manage account safely | 18 Required: NovaPage, PageHeader, DataRow | 26 Offline: Global | 34 AI confirmation: N/A |
| 3 Persian: پروفایل | 11 Goal: reach settings without tab clutter | 19 Optional: StatusBadge | 27 Partial: mark unverified sections | 35 RTL: global |
| 4 Type: COMMAND | 12 Entry: global header avatar | 20 Data: user profile, preference flags, device/bank capabilities | 28 Refresh: profile refresh | 36 A11y: grouped list semantics |
| 5 Priority: P1 | 13 Exit: security, identity, notifications, devices, connected banks, support | 21 API: /users/me VERIFIED; many sub-capabilities NOT VERIFIED | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: Profile | 14 Primary: open Security | 22 Source: services/auth.ts, users endpoint to be added | 30 Confirmation: N/A | 38 Analytics: profile_section_opened |
| 7 Current: none | 15 Secondary: edit personal info, notifications, support | 23 Loading: Global | 31 Security: authenticated; security entry prominent | 39 Design: no social-like profile feed |
| 8 Target: /profile | 16 Hierarchy: security first, identity second, preferences after | 24 Empty: hide unsupported sections | 32 AI context: AI preferences link only | 40 Acceptance: Profile is not a bottom tab; unsupported sections hidden |

## 6. MONEY Pages

### MONEY-001 — Money Overview
| 1 ID: MONEY-001 | 9 Action: NEW | 17 Layout: header → money summary → accounts strip → cards strip → recent transactions → cash flow link | 25 Error: Global | 33 AI allowed: spending summary |
| 2 Name: Money Overview | 10 Problem: understand all money | 18 Required: BalanceSummary, AccountCard, BankCard, TransactionRow | 26 Offline: Global | 34 AI confirmation: mutations only |
| 3 Persian: پول من | 11 Goal: orient and enter entity lists | 19 Optional: AIInsightCard | 27 Partial: section-level unavailable | 35 RTL: global |
| 4 Type: COMMAND | 12 Entry: MONEY tab | 20 Data: account totals, cards, recent transactions, cash flow | 28 Refresh: pull-to-refresh | 36 A11y: summary announced as total + currency |
| 5 Priority: P0 | 13 Exit: accounts, cards, transactions, reports | 21 API: /accounts, /cards, /transactions, /reports VERIFIED backend, MISSING mobile UI | 29 Form: N/A | 37 Responsive: strips scroll horizontally |
| 6 IA: MONEY | 14 Primary: view accounts | 22 Source: new account/card/transaction services required | 30 Confirmation: N/A | 38 Analytics: money_overview_viewed |
| 7 Current: none | 15 Secondary: cards, transactions, cash flow | 23 Loading: Global | 31 Security: authenticated | 39 Design: no net worth unless aggregate verified |
| 8 Target: /money | 16 Hierarchy: total → accounts → cards → activity | 24 Empty: actionable setup/empty states | 32 AI context: one insight max | 40 Acceptance: no fake totals; all sections stateful |

### MONEY-002 — Accounts
| 1 ID: MONEY-002 | 9 Action: NEW | 17 Layout: search/filter → account cards | 25 Error: Global | 33 AI allowed: account explanation |
| 2 Name: Accounts | 10 Problem: find and compare accounts | 18 Required: AccountCard, SearchField, FilterChip | 26 Offline: Global | 34 AI confirmation: N/A |
| 3 Persian: حساب‌ها | 11 Goal: choose an account | 19 Optional: StatusBadge | 27 Partial: list with unavailable balances | 35 RTL: global |
| 4 Type: LIST | 12 Entry: Money Overview | 20 Data: account name, type, balance, currency, status | 28 Refresh: pull-to-refresh | 36 A11y: account name + balance + status |
| 5 Priority: P0 | 13 Exit: Account Detail | 21 API: GET /accounts VERIFIED backend | 29 Form: N/A | 37 Responsive: one column |
| 6 IA: MONEY | 14 Primary: open account | 22 Source: service to be added | 30 Confirmation: N/A | 38 Analytics: accounts_viewed |
| 7 Current: none | 15 Secondary: filter by type/status | 23 Loading: skeleton cards | 31 Security: authenticated | 39 Design: dense list uses BaseSurface |
| 8 Target: /money/accounts | 16 Hierarchy: balance, name, type, status | 24 Empty: no accounts message | 32 AI context: N/A | 40 Acceptance: balances never fake or zero-filled |

### MONEY-003 — Account Detail
| 1 ID: MONEY-003 | 9 Action: NEW | 17 Layout: account header → balance → recent transactions → cards/actions | 25 Error: Global | 33 AI allowed: summarize account activity |
| 2 Name: Account Detail | 10 Problem: understand one account | 18 Required: AccountCard, TransactionRow, DataList | 26 Offline: Global | 34 AI confirmation: mutations only |
| 3 Persian: جزئیات حساب | 11 Goal: inspect account and act | 19 Optional: AIInsightCard | 27 Partial: hide unavailable sections | 35 RTL: global |
| 4 Type: DETAIL | 12 Entry: Accounts | 20 Data: account, related transactions, cards | 28 Refresh: pull-to-refresh | 36 A11y: account identity and balance heading |
| 5 Priority: P0 | 13 Exit: transaction detail, transfer | 21 API: GET /accounts/{id}, transactions VERIFIED backend | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: MONEY | 14 Primary: view transactions | 22 Source: service to be added | 30 Confirmation: N/A | 38 Analytics: account_detail_viewed |
| 7 Current: none | 15 Secondary: transfer, pay from account | 23 Loading: Global | 31 Security: authenticated | 39 Design: account number masked/copyable |
| 8 Target: /money/accounts/[accountId] | 16 Hierarchy: identity → balance → activity | 24 Empty: no transactions message | 32 AI context: optional | 40 Acceptance: account context preserved in child routes |

### MONEY-004 — Cards
| 1 ID: MONEY-004 | 9 Action: NEW | 17 Layout: card carousel/list → status → linked account | 25 Error: Global | 33 AI allowed: card usage explanation |
| 2 Name: Cards | 10 Problem: manage payment cards | 18 Required: BankCard, StatusBadge | 26 Offline: Global | 34 AI confirmation: N/A |
| 3 Persian: کارت‌ها | 11 Goal: choose a card | 19 Optional: FilterChip | 27 Partial: unavailable card metadata | 35 RTL: card number LTR |
| 4 Type: LIST | 12 Entry: Money Overview | 20 Data: masked card, status, account link | 28 Refresh: pull-to-refresh | 36 A11y: masked number, never full PAN |
| 5 Priority: P0 | 13 Exit: Card Detail | 21 API: GET /cards VERIFIED backend | 29 Form: N/A | 37 Responsive: carousel on small, grid on wide |
| 6 IA: MONEY | 14 Primary: open card | 22 Source: service to be added | 30 Confirmation: N/A | 38 Analytics: cards_viewed |
| 7 Current: none | 15 Secondary: filter active/blocked | 23 Loading: card skeletons | 31 Security: never expose CVV/full PAN | 39 Design: card visual does not reduce readability |
| 8 Target: /money/cards | 16 Hierarchy: card, status, account | 24 Empty: no cards | 32 AI context: N/A | 40 Acceptance: sensitive data masked |

### MONEY-005 — Card Detail
| 1 ID: MONEY-005 | 9 Action: NEW | 17 Layout: card visual → status → facts → recent transactions | 25 Error: Global | 33 AI allowed: transaction explanation |
| 2 Name: Card Detail | 10 Problem: understand one card | 18 Required: BankCard, DataList, TransactionRow | 26 Offline: Global | 34 AI confirmation: card actions require confirmation |
| 3 Persian: جزئیات کارت | 11 Goal: inspect and manage card | 19 Optional: ActionTile | 27 Partial: transactions unavailable separately marked | 35 RTL: card/technical values LTR |
| 4 Type: DETAIL | 12 Entry: Cards | 20 Data: card, account, transactions | 28 Refresh: pull-to-refresh | 36 A11y: masked card identity |
| 5 Priority: P0 | 13 Exit: transaction detail, account | 21 API: GET /cards/{id}, transactions VERIFIED backend | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: MONEY | 14 Primary: view card transactions | 22 Source: service to be added | 30 Confirmation: any card mutation | 38 Analytics: card_detail_viewed |
| 7 Current: none | 15 Secondary: copy masked identifier if product-approved | 23 Loading: Global | 31 Security: no CVV/PAN display | 39 Design: actions only for verified backend capability |
| 8 Target: /money/cards/[cardId] | 16 Hierarchy: identity → status → facts → activity | 24 Empty: no transactions | 32 AI context: optional | 40 Acceptance: no unverified card controls |

### MONEY-006 — Transactions
| 1 ID: MONEY-006 | 9 Action: NEW | 17 Layout: search/filter → transaction rows → pagination/load more | 25 Error: Global | 33 AI allowed: classify/explain |
| 2 Name: Transactions | 10 Problem: find financial activity | 18 Required: SearchField, FilterChip, TransactionRow | 26 Offline: cached list marked stale | 34 AI confirmation: reclassification mutation |
| 3 Persian: تراکنش‌ها | 11 Goal: discover a transaction | 19 Optional: CategoryChip | 27 Partial: filters can return partial data | 35 RTL: global, amount LTR |
| 4 Type: LIST | 12 Entry: Money, Home, Account Detail | 20 Data: title, amount, date, category, status, account | 28 Refresh: pull-to-refresh | 36 A11y: row includes amount, direction, date |
| 5 Priority: P0 | 13 Exit: Transaction Detail | 21 API: GET /transactions VERIFIED backend | 29 Form: filter/sort only | 37 Responsive: dense rows on small screens |
| 6 IA: MONEY | 14 Primary: open transaction | 22 Source: service to be added | 30 Confirmation: N/A | 38 Analytics: transaction_search/filter/detail |
| 7 Current: none | 15 Secondary: filter account/date/category/direction | 23 Loading: row skeletons | 31 Security: authenticated | 39 Design: BaseSurface, no glass rows |
| 8 Target: /money/transactions | 16 Hierarchy: date/title, amount, status | 24 Empty: no matching transactions | 32 AI context: classify suggestion | 40 Acceptance: search/filter preserve pagination and state |

### MONEY-007 — Transaction Detail
| 1 ID: MONEY-007 | 9 Action: NEW | 17 Layout: transaction header → amount/status → facts → related entities → AI explanation | 25 Error: Global | 33 AI allowed: explain, categorize |
| 2 Name: Transaction Detail | 10 Problem: verify a transaction | 18 Required: TransactionDetail, StatusBadge, DataList | 26 Offline: Global | 34 AI confirmation: category update |
| 3 Persian: جزئیات تراکنش | 11 Goal: understand and resolve activity | 19 Optional: CategoryChip, AIInsightCard | 27 Partial: hide unavailable relations | 35 RTL: references LTR |
| 4 Type: DETAIL | 12 Entry: Transactions, Account/Card Detail | 20 Data: transaction, category, account, references | 28 Refresh: pull-to-refresh | 36 A11y: amount + status announced |
| 5 Priority: P0 | 13 Exit: account/card/category, support | 21 API: GET /transactions/{id} VERIFIED backend | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: MONEY | 14 Primary: verify facts | 22 Source: service to be added | 30 Confirmation: any edit | 38 Analytics: transaction_detail_viewed |
| 7 Current: none | 15 Secondary: copy reference, dispute if verified | 23 Loading: Global | 31 Security: reference copy allowed, no token data | 39 Design: no endpoint dump |
| 8 Target: /money/transactions/[transactionId] | 16 Hierarchy: amount/status → parties → date/category → reference | 24 Empty: N/A | 32 AI context: explicit AI attribution | 40 Acceptance: all values sourced from API |

### MONEY-008 — Cash Flow
| 1 ID: MONEY-008 | 9 Action: NEW | 17 Layout: period selector → income/expense/net cards → trend chart → category breakdown | 25 Error: Global | 33 AI allowed: analyze trends |
| 2 Name: Cash Flow | 10 Problem: understand money movement | 18 Required: MoneyAmount, ProgressBar, DataList | 26 Offline: Global | 34 AI confirmation: N/A |
| 3 Persian: جریان نقدی | 11 Goal: compare income and expense | 19 Optional: chart component | 27 Partial: chart unavailable if data incomplete | 35 RTL: time axis follows chart semantics |
| 4 Type: LIST | 12 Entry: Money Overview, Reports | 20 Data: income, expense, net, trends, categories | 28 Refresh: pull-to-refresh | 36 A11y: chart text alternative |
| 5 Priority: P1 | 13 Exit: Reports, Transactions | 21 API: /reports/income-expense, /reports/trends VERIFIED backend | 29 Form: period filter | 37 Responsive: chart max width 720 |
| 6 IA: MONEY | 14 Primary: select period | 22 Source: services/reports.ts | 30 Confirmation: N/A | 38 Analytics: cashflow_period_changed |
| 7 Current: /analytics (partial) | 15 Secondary: view transactions | 23 Loading: Global | 31 Security: authenticated | 39 Design: no fake chart data |
| 8 Target: /money/cash-flow | 16 Hierarchy: net → income → expense → categories | 24 Empty: no data in period | 32 AI context: optional insight | 40 Acceptance: totals and chart use same period |

### MONEY-009 — Categories
| 1 ID: MONEY-009 | 9 Action: NEW | 17 Layout: search → category rows with totals | 25 Error: Global | 33 AI allowed: suggest category |
| 2 Name: Categories | 10 Problem: understand spending classification | 18 Required: CategoryChip, DataRow | 26 Offline: Global | 34 AI confirmation: transaction reclassification |
| 3 Persian: دسته‌بندی‌ها | 11 Goal: inspect spending groups | 19 Optional: ProgressBar | 27 Partial: totals unavailable | 35 RTL: global |
| 4 Type: LIST | 12 Entry: Money, Reports | 20 Data: category name, type, amount, percentage | 28 Refresh: pull-to-refresh | 36 A11y: category + amount |
| 5 Priority: P1 | 13 Exit: filtered transactions | 21 API: GET /categories, category breakdown VERIFIED backend | 29 Form: N/A | 37 Responsive: one column |
| 6 IA: MONEY | 14 Primary: view category transactions | 22 Source: category service to be added; reports.ts existing | 30 Confirmation: N/A | 38 Analytics: category_selected |
| 7 Current: none | 15 Secondary: filter income/expense | 23 Loading: Global | 31 Security: authenticated | 39 Design: tags not shown until backend verified |
| 8 Target: /money/categories | 16 Hierarchy: name, amount, percentage | 24 Empty: no categories | 32 AI context: optional | 40 Acceptance: no TagChip without verified tag backend |

### MONEY-010 — Reports
| 1 ID: MONEY-010 | 9 Action: MOVE/REFACTOR | 17 Layout: period selector → overview → trends → category breakdown → budget/goal performance | 25 Error: Global | 33 AI allowed: summarize report |
| 2 Name: Reports | 10 Problem: understand financial performance | 18 Required: MoneyAmount, DataList, ProgressBar | 26 Offline: Global | 34 AI confirmation: N/A |
| 3 Persian: گزارش‌ها | 11 Goal: analyze finances | 19 Optional: chart component | 27 Partial: report sections independent | 35 RTL: global |
| 4 Type: LIST | 12 Entry: Money, Home | 20 Data: overview, trends, category breakdown, budget performance, goal progress | 28 Refresh: pull-to-refresh | 36 A11y: report sections have headings |
| 5 Priority: P1 | 13 Exit: Cash Flow, Budgets, Goals | 21 API: /reports/* VERIFIED backend | 29 Form: date range | 37 Responsive: stacked cards |
| 6 IA: MONEY | 14 Primary: select date range | 22 Source: services/reports.ts | 30 Confirmation: N/A | 38 Analytics: report_period_changed |
| 7 Current: /analytics | 15 Secondary: export if verified (NOT VERIFIED) | 23 Loading: Global | 31 Security: authenticated | 39 Design: avoid duplicate investment analytics |
| 8 Target: /money/reports | 16 Hierarchy: overview → trends → breakdowns | 24 Empty: no report data | 32 AI context: optional summary | 40 Acceptance: no export control until capability verified |

### MONEY-011 — Connected Banks
| 1 ID: MONEY-011 | 9 Action: NEW | 17 Layout: bank list → connection status → account links | 25 Error: Global | 33 AI allowed: explain connection |
| 2 Name: Connected Banks | 10 Problem: understand external bank context | 18 Required: BankCard, StatusBadge, DataRow | 26 Offline: Global | 34 AI confirmation: any connection action |
| 3 Persian: بانک‌های متصل | 11 Goal: manage bank connections | 19 Optional: ActionTile | 27 Partial: bank list without account links | 35 RTL: global |
| 4 Type: LIST | 12 Entry: Money, Profile | 20 Data: banks, linked accounts, connection status | 28 Refresh: pull-to-refresh | 36 A11y: bank name + status |
| 5 Priority: P2 | 13 Exit: Account Detail, Profile | 21 API: GET /banks VERIFIED; external linking NOT VERIFIED | 29 Form: N/A | 37 Responsive: one column |
| 6 IA: MONEY | 14 Primary: view linked accounts | 22 Source: bank service to be added | 30 Confirmation: connect/disconnect | 38 Analytics: connected_banks_viewed |
| 7 Current: none | 15 Secondary: refresh connection if verified | 23 Loading: Global | 31 Security: external bank security review required | 39 Design: no fake bank logos/claims |
| 8 Target: /money/connected-banks | 16 Hierarchy: bank, status, accounts | 24 Empty: no connected banks | 32 AI context: N/A | 40 Acceptance: no external linking action without verified backend |

## 7. PAY Pages

### PAY-001 — Payment Center
| 1 ID: PAY-001 | 9 Action: NEW | 17 Layout: primary actions → recent beneficiaries → templates → scheduled → history | 25 Error: Global | 33 AI allowed: suggest action |
| 2 Name: Payment Center | 10 Problem: choose a payment action quickly | 18 Required: ActionTile, QuickAction, PaymentRow | 26 Offline: Global | 34 AI confirmation: proposed payment |
| 3 Persian: پرداخت | 11 Goal: start the correct payment flow | 19 Optional: FilterChip | 27 Partial: hide unavailable services | 35 RTL: global |
| 4 Type: COMMAND | 12 Entry: PAY tab | 20 Data: beneficiaries, templates, scheduled, recent payments | 28 Refresh: pull-to-refresh | 36 A11y: action tiles labeled |
| 5 Priority: P0 | 13 Exit: Send, Transfer, Beneficiaries, Templates, Scheduled | 21 API: payment-related endpoints VERIFIED backend | 29 Form: N/A | 37 Responsive: 2×2 action grid |
| 6 IA: PAY | 14 Primary: Send money | 22 Source: services/payments.ts | 30 Confirmation: N/A | 38 Analytics: pay_center_action_selected |
| 7 Current: none | 15 Secondary: Transfer, history | 23 Loading: Global | 31 Security: authenticated | 39 Design: no technical banking terminology first |
| 8 Target: /pay | 16 Hierarchy: actions → destinations → history | 24 Empty: action-first empty state | 32 AI context: optional recommendation | 40 Acceptance: no bills/recharge tiles until verified |

### PAY-002 — Send Money
| 1 ID: PAY-002 | 9 Action: REBUILD/SPLIT | 17 Layout: recipient → amount → source account → review → confirm | 25 Error: inline field + global | 33 AI allowed: validate/annotate |
| 2 Name: Send Money | 10 Problem: send money to a person/beneficiary | 18 Required: FormField, GlassInput, ReviewSummary, PrimaryButton | 26 Offline: block submission | 34 AI confirmation: payment execution |
| 3 Persian: ارسال پول | 11 Goal: complete a safe payment | 19 Optional: Beneficiary selector sheet | 27 Partial: N/A | 35 RTL: amount/account LTR |
| 4 Type: ACTION | 12 Entry: Payment Center, Home quick action | 20 Data: beneficiaries, accounts, amount, currency, fees | 28 Refresh: N/A | 36 A11y: review summary announces amount + recipient |
| 5 Priority: P0 | 13 Exit: success, payment detail, history | 21 API: POST /payments VERIFIED; beneficiaries/accounts VERIFIED backend | 29 Validation: recipient, amount > 0, source account, sufficient balance if available | 37 Responsive: sticky review/confirm |
| 6 IA: PAY | 14 Primary: review and confirm payment | 22 Source: services/payments.ts | 30 Confirmation: explicit review + confirm + processing state | 38 Analytics: send_money_reviewed/confirmed |
| 7 Current: /payments/new | 15 Secondary: save beneficiary/template if verified | 23 Loading: submit processing | 31 Security: idempotency key, no double submit | 39 Design: technical destination details in review |
| 8 Target: /pay/send | 16 Hierarchy: who → how much → from → review | 24 Empty: N/A | 32 AI context: warning for unusual amount only | 40 Acceptance: success routes to verifiable payment state |

### PAY-003 — Transfer
| 1 ID: PAY-003 | 9 Action: NEW/SPLIT | 17 Layout: source → destination account → amount → review → confirm | 25 Error: Global | 33 AI allowed: explain transfer |
| 2 Name: Transfer | 10 Problem: move money between own accounts | 18 Required: FormField, ReviewSummary, PrimaryButton | 26 Offline: block submission | 34 AI confirmation: transfer execution |
| 3 Persian: انتقال | 11 Goal: complete internal transfer | 19 Optional: account selection sheets | 27 Partial: N/A | 35 RTL: account numbers LTR |
| 4 Type: ACTION | 12 Entry: Payment Center, Account Detail | 20 Data: source/destination accounts, amount, fees | 28 Refresh: N/A | 36 A11y: source and destination explicit |
| 5 Priority: P0 | 13 Exit: success, account detail | 21 API: POST /transfers VERIFIED backend | 29 Validation: distinct accounts, amount > 0, sufficient balance | 37 Responsive: sticky action |
| 6 IA: PAY | 14 Primary: review and confirm transfer | 22 Source: transfer service to be added | 30 Confirmation: review + explicit confirm | 38 Analytics: transfer_reviewed/confirmed |
| 7 Current: /payments/new (overloaded) | 15 Secondary: view fees | 23 Loading: processing state | 31 Security: no double submission | 39 Design: separate from send-money mental model |
| 8 Target: /pay/transfer | 16 Hierarchy: from → to → amount → review | 24 Empty: N/A | 32 AI context: N/A | 40 Acceptance: transfer and payment are distinct flows |

### PAY-004 — Beneficiaries
| 1 ID: PAY-004 | 9 Action: NEW | 17 Layout: search → beneficiary rows → favorite filter | 25 Error: Global | 33 AI allowed: suggest recipient |
| 2 Name: Beneficiaries | 10 Problem: manage frequent recipients | 18 Required: SearchField, DataRow, FilterChip | 26 Offline: Global | 34 AI confirmation: beneficiary changes |
| 3 Persian: دریافت‌کنندگان | 11 Goal: choose or maintain a recipient | 19 Optional: IconButton | 27 Partial: N/A | 35 RTL: destination identifiers LTR |
| 4 Type: LIST | 12 Entry: Payment Center, Send Money | 20 Data: name, destination type/value, bank, favorite | 28 Refresh: pull-to-refresh | 36 A11y: favorite state exposed |
| 5 Priority: P0 | 13 Exit: Send Money, beneficiary editor | 21 API: GET/POST /beneficiaries VERIFIED backend | 29 Form: search/filter | 37 Responsive: one column |
| 6 IA: PAY | 14 Primary: select beneficiary | 22 Source: services/payments.ts | 30 Confirmation: create/update/delete | 38 Analytics: beneficiary_selected |
| 7 Current: none | 15 Secondary: add/edit/remove | 23 Loading: Global | 31 Security: destination verification required | 39 Design: mask sensitive destination in list |
| 8 Target: /pay/beneficiaries | 16 Hierarchy: name, bank/destination, favorite | 24 Empty: add first beneficiary | 32 AI context: N/A | 40 Acceptance: no unsupported contact import |

### PAY-005 — Payment Templates
| 1 ID: PAY-005 | 9 Action: NEW | 17 Layout: template rows → type → destination → amount | 25 Error: Global | 33 AI allowed: suggest template |
| 2 Name: Payment Templates | 10 Problem: repeat common payments safely | 18 Required: PaymentRow, DataRow, ActionTile | 26 Offline: Global | 34 AI confirmation: template execution |
| 3 Persian: قالب‌های پرداخت | 11 Goal: choose a reusable payment | 19 Optional: FilterChip | 27 Partial: amount optional in data | 35 RTL: identifiers LTR |
| 4 Type: LIST | 12 Entry: Payment Center | 20 Data: name, type, destination, amount, active | 28 Refresh: pull-to-refresh | 36 A11y: template name and action |
| 5 Priority: P1 | 13 Exit: Send/Transfer with prefilled data | 21 API: GET /payment-templates VERIFIED backend | 29 Form: N/A | 37 Responsive: one column |
| 6 IA: PAY | 14 Primary: use template | 22 Source: services/payments.ts | 30 Confirmation: resulting payment | 38 Analytics: template_used |
| 7 Current: none | 15 Secondary: create/edit/delete if verified | 23 Loading: Global | 31 Security: template changes require confirmation | 39 Design: no hidden destination |
| 8 Target: /pay/templates | 16 Hierarchy: name, destination, amount | 24 Empty: create template | 32 AI context: N/A | 40 Acceptance: template prefill still reaches review |

### PAY-006 — Scheduled Payments
| 1 ID: PAY-006 | 9 Action: NEW | 17 Layout: upcoming → frequency → status → next run | 25 Error: Global | 33 AI allowed: explain schedule |
| 2 Name: Scheduled Payments | 10 Problem: control future payments | 18 Required: PaymentRow, StatusBadge, DataRow | 26 Offline: Global | 34 AI confirmation: schedule changes |
| 3 Persian: پرداخت‌های زمان‌بندی‌شده | 11 Goal: review scheduled obligations | 19 Optional: FilterChip | 27 Partial: N/A | 35 RTL: dates localized |
| 4 Type: LIST | 12 Entry: Payment Center | 20 Data: type, amount, frequency, next run, status | 28 Refresh: pull-to-refresh | 36 A11y: next run and status |
| 5 Priority: P1 | 13 Exit: Send flow, payment history | 21 API: GET /scheduled-payments VERIFIED backend | 29 Form: filter only | 37 Responsive: one column |
| 6 IA: PAY | 14 Primary: view schedule | 22 Source: services/payments.ts | 30 Confirmation: pause/resume/delete | 38 Analytics: scheduled_payment_changed |
| 7 Current: none | 15 Secondary: pause/resume if verified | 23 Loading: Global | 31 Security: destructive change confirmation | 39 Design: next run visually prominent |
| 8 Target: /pay/scheduled | 16 Hierarchy: next run, amount, status | 24 Empty: no scheduled payments | 32 AI context: optional | 40 Acceptance: schedule actions map only to verified endpoints |

### PAY-007 — Payment History
| 1 ID: PAY-007 | 9 Action: MOVE/REFACTOR | 17 Layout: search/filter → payment rows | 25 Error: Global | 33 AI allowed: summarize payments |
| 2 Name: Payment History | 10 Problem: find past payments | 18 Required: SearchField, FilterChip, PaymentRow | 26 Offline: cached list marked stale | 34 AI confirmation: N/A |
| 3 Persian: تاریخچه پرداخت | 11 Goal: inspect a payment | 19 Optional: StatusBadge | 27 Partial: N/A | 35 RTL: references LTR |
| 4 Type: LIST | 12 Entry: PAY tab, Home | 20 Data: title, amount, date, status, destination | 28 Refresh: pull-to-refresh | 36 A11y: amount + status + date |
| 5 Priority: P0 | 13 Exit: Payment Detail | 21 API: GET /payments VERIFIED | 29 Form: filters | 37 Responsive: dense list |
| 6 IA: PAY | 14 Primary: open payment | 22 Source: services/payments.ts | 30 Confirmation: N/A | 38 Analytics: payment_history_filtered |
| 7 Current: /payments | 15 Secondary: filter status/date | 23 Loading: Global | 31 Security: authenticated | 39 Design: BaseSurface list |
| 8 Target: /pay/history | 16 Hierarchy: date/title, amount, status | 24 Empty: no payments | 32 AI context: optional | 40 Acceptance: localized statuses and pagination |

### PAY-008 — Payment Detail
| 1 ID: PAY-008 | 9 Action: MOVE/REFACTOR | 17 Layout: amount/status → parties → fees → dates → references → actions | 25 Error: Global | 33 AI allowed: explain payment |
| 2 Name: Payment Detail | 10 Problem: verify payment outcome | 18 Required: PaymentDetail, DataList, StatusBadge | 26 Offline: Global | 34 AI confirmation: cancel/retry |
| 3 Persian: جزئیات پرداخت | 11 Goal: understand and act if allowed | 19 Optional: ErrorBanner | 27 Partial: audit may be unavailable | 35 RTL: references LTR |
| 4 Type: DETAIL | 12 Entry: Payment History | 20 Data: payment, fees, references, execution state | 28 Refresh: pull-to-refresh | 36 A11y: amount, status, recipient |
| 5 Priority: P0 | 13 Exit: history, support, account | 21 API: GET /payments/{id}, cancel, audit VERIFIED | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: PAY | 14 Primary: verify payment facts | 22 Source: services/payments.ts | 30 Confirmation: cancel/retry | 38 Analytics: payment_detail_viewed |
| 7 Current: /payments/[id] | 15 Secondary: copy reference, cancel if allowed | 23 Loading: Global | 31 Security: destructive action confirmation | 39 Design: no raw technical state dump |
| 8 Target: /pay/history/[paymentId] | 16 Hierarchy: amount/status → parties → fees → reference | 24 Empty: N/A | 32 AI context: optional | 40 Acceptance: cancel only when backend state allows |

## 8. GROW Pages

### GROW-001 — Grow Overview
| 1 ID: GROW-001 | 9 Action: NEW | 17 Layout: grow summary → goals → budgets → portfolio → analytics links | 25 Error: Global | 33 AI allowed: recommend focus |
| 2 Name: Grow Overview | 10 Problem: understand growth progress | 18 Required: ProgressCard, PortfolioCard, ActionTile | 26 Offline: Global | 34 AI confirmation: contribution/payment |
| 3 Persian: رشد | 11 Goal: choose growth focus | 19 Optional: AIInsightCard | 27 Partial: section-level states | 35 RTL: global |
| 4 Type: COMMAND | 12 Entry: GROW tab | 20 Data: goals, budgets, portfolio totals | 28 Refresh: pull-to-refresh | 36 A11y: each summary has heading |
| 5 Priority: P0 | 13 Exit: Goals, Budgets, Portfolio, Analytics | 21 API: goals, budgets, portfolio VERIFIED | 29 Form: N/A | 37 Responsive: summary cards stack |
| 6 IA: GROW | 14 Primary: create goal | 22 Source: services/goals.ts, budgets.ts, investments.ts | 30 Confirmation: N/A | 38 Analytics: grow_overview_viewed |
| 7 Current: none | 15 Secondary: create budget, view portfolio | 23 Loading: Global | 31 Security: authenticated | 39 Design: not a second dashboard |
| 8 Target: /grow | 16 Hierarchy: goals → budgets → investments | 24 Empty: growth setup actions | 32 AI context: one recommendation max | 40 Acceptance: no duplicated analytics sections |

### GROW-002 — Goals
| 1 ID: GROW-002 | 9 Action: MOVE/REFACTOR | 17 Layout: summary → goal cards → create action | 25 Error: Global | 33 AI allowed: suggest plan |
| 2 Name: Goals | 10 Problem: track financial intentions | 18 Required: GoalCard, ProgressCard | 26 Offline: Global | 34 AI confirmation: progress contribution |
| 3 Persian: اهداف | 11 Goal: manage goals | 19 Optional: FilterChip | 27 Partial: N/A | 35 RTL: progress right-to-left |
| 4 Type: LIST | 12 Entry: Grow Overview, Home | 20 Data: name, current, target, date, status | 28 Refresh: pull-to-refresh | 36 A11y: progress announced with percentage |
| 5 Priority: P1 | 13 Exit: Goal Detail, Goal Editor | 21 API: GET /goals VERIFIED | 29 Form: filter | 37 Responsive: one column |
| 6 IA: GROW | 14 Primary: open goal | 22 Source: services/goals.ts | 30 Confirmation: N/A | 38 Analytics: goals_viewed |
| 7 Current: /goals | 15 Secondary: create goal | 23 Loading: Global | 31 Security: authenticated | 39 Design: no fake projected growth |
| 8 Target: /grow/goals | 16 Hierarchy: progress, remaining, target date | 24 Empty: create first goal | 32 AI context: optional plan | 40 Acceptance: progress math is unambiguous |

### GROW-003 — Goal Detail
| 1 ID: GROW-003 | 9 Action: MOVE/REFACTOR | 17 Layout: goal header → progress → facts → timeline/actions | 25 Error: Global | 33 AI allowed: recommend contribution |
| 2 Name: Goal Detail | 10 Problem: understand one goal | 18 Required: ProgressCard, DataList, DataRow | 26 Offline: Global | 34 AI confirmation: add progress |
| 3 Persian: جزئیات هدف | 11 Goal: track and update goal | 19 Optional: AIInsightCard | 27 Partial: N/A | 35 RTL: global |
| 4 Type: DETAIL | 12 Entry: Goals | 20 Data: goal, current, target, remaining, date | 28 Refresh: pull-to-refresh | 36 A11y: goal progress and remaining |
| 5 Priority: P1 | 13 Exit: Goal Editor, Home | 21 API: GET /goals/{id}, progress VERIFIED | 29 Form: amount input for progress | 37 Responsive: single column |
| 6 IA: GROW | 14 Primary: add progress | 22 Source: services/goals.ts | 30 Confirmation: contribution review | 38 Analytics: goal_progress_added |
| 7 Current: /goals/[id] | 15 Secondary: edit/delete | 23 Loading: Global | 31 Security: delete is destructive confirmation | 39 Design: unavailable values never become zero |
| 8 Target: /grow/goals/[goalId] | 16 Hierarchy: progress → remaining → target date | 24 Empty: N/A | 32 AI context: optional | 40 Acceptance: update uses verified endpoint and refreshes |

### GROW-004 — Goal Editor
| 1 ID: GROW-004 | 9 Action: MOVE/REFACTOR | 17 Layout: name → target amount → target date → review/save | 25 Error: field and global | 33 AI allowed: suggest target |
| 2 Name: Goal Editor | 10 Problem: create or change a goal | 18 Required: FormField, GlassInput, ReviewSummary | 26 Offline: block submit | 34 AI confirmation: goal mutation |
| 3 Persian: ویرایش هدف | 11 Goal: save a valid goal | 19 Optional: date picker | 27 Partial: N/A | 35 RTL: amount LTR |
| 4 Type: ACTION | 12 Entry: Goals, Goal Detail | 20 Data: name, description, amount, currency, target date | 28 Refresh: N/A | 36 A11y: errors associated to fields |
| 5 Priority: P1 | 13 Exit: Goal Detail, Goals | 21 API: POST/PATCH /goals VERIFIED | 29 Validation: required name, positive amount, future date | 37 Responsive: 420 form width |
| 6 IA: GROW | 14 Primary: save goal | 22 Source: services/goals.ts | 30 Confirmation: edit review; delete separate | 38 Analytics: goal_saved |
| 7 Current: /goals/new, /goals/[id]/edit | 15 Secondary: cancel | 23 Loading: submit processing | 31 Security: authenticated | 39 Design: one editor handles create/edit |
| 8 Target: /grow/goals/new, /grow/goals/[goalId]/edit | 16 Hierarchy: identity → target → date | 24 Empty: N/A | 32 AI context: N/A | 40 Acceptance: invalid dates cannot submit |

### GROW-005 — Budgets
| 1 ID: GROW-005 | 9 Action: MOVE/REFACTOR | 17 Layout: summary → budget cards → create action | 25 Error: Global | 33 AI allowed: recommend budget adjustment |
| 2 Name: Budgets | 10 Problem: control spending limits | 18 Required: BudgetCard, ProgressBar | 26 Offline: Global | 34 AI confirmation: budget mutation |
| 3 Persian: بودجه‌ها | 11 Goal: monitor budgets | 19 Optional: FilterChip | 27 Partial: N/A | 35 RTL: progress right-to-left |
| 4 Type: LIST | 12 Entry: Grow Overview, Home | 20 Data: name, spent, limit, remaining, period, status | 28 Refresh: pull-to-refresh | 36 A11y: percentage and exceeded state |
| 5 Priority: P1 | 13 Exit: Budget Detail, Budget Editor | 21 API: GET /budgets VERIFIED | 29 Form: filter | 37 Responsive: one column |
| 6 IA: GROW | 14 Primary: open budget | 22 Source: services/budgets.ts | 30 Confirmation: N/A | 38 Analytics: budgets_viewed |
| 7 Current: /budgets | 15 Secondary: create budget | 23 Loading: Global | 31 Security: authenticated | 39 Design: exceeded state explicit |
| 8 Target: /grow/budgets | 16 Hierarchy: spent/limit → remaining → period | 24 Empty: create first budget | 32 AI context: optional | 40 Acceptance: progress never exceeds ambiguity |

### GROW-006 — Budget Detail
| 1 ID: GROW-006 | 9 Action: MOVE/REFACTOR | 17 Layout: budget header → progress → facts → related transactions | 25 Error: Global | 33 AI allowed: spending insight |
| 2 Name: Budget Detail | 10 Problem: inspect one budget | 18 Required: BudgetCard, DataList, TransactionRow | 26 Offline: Global | 34 AI confirmation: budget mutation |
| 3 Persian: جزئیات بودجه | 11 Goal: understand consumption | 19 Optional: CategoryChip | 27 Partial: transactions unavailable separately | 35 RTL: global |
| 4 Type: DETAIL | 12 Entry: Budgets | 20 Data: budget, category, period, spent, remaining | 28 Refresh: pull-to-refresh | 36 A11y: budget status announced |
| 5 Priority: P1 | 13 Exit: Budget Editor, Transactions | 21 API: GET /budgets/{id} VERIFIED; transaction filter PARTIALLY VERIFIED | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: GROW | 14 Primary: view related spending | 22 Source: services/budgets.ts | 30 Confirmation: edit/delete | 38 Analytics: budget_detail_viewed |
| 7 Current: /budgets/[id] | 15 Secondary: edit/delete | 23 Loading: Global | 31 Security: delete confirmation; endpoint mismatch must be fixed | 39 Design: no fake category totals |
| 8 Target: /grow/budgets/[id] | 16 Hierarchy: status → limit/spent → category/period | 24 Empty: no transactions | 32 AI context: optional | 40 Acceptance: delete blocked until contract fixed |

### GROW-007 — Budget Editor
| 1 ID: GROW-007 | 9 Action: MOVE/REFACTOR | 17 Layout: name → amount → period → category → dates → review/save | 25 Error: field and global | 33 AI allowed: suggest amount |
| 2 Name: Budget Editor | 10 Problem: create or change a budget | 18 Required: FormField, GlassInput, ReviewSummary | 26 Offline: block submit | 34 AI confirmation: budget mutation |
| 3 Persian: ویرایش بودجه | 11 Goal: save valid budget | 19 Optional: category sheet | 27 Partial: N/A | 35 RTL: amount LTR |
| 4 Type: ACTION | 12 Entry: Budgets, Budget Detail | 20 Data: name, amount, period, category, dates | 28 Refresh: N/A | 36 A11y: field errors associated |
| 5 Priority: P1 | 13 Exit: Budget Detail, Budgets | 21 API: POST/PATCH /budgets VERIFIED; delete MISMATCH | 29 Validation: required name, positive amount, valid period/date range | 37 Responsive: 420 form width |
| 6 IA: GROW | 14 Primary: save budget | 22 Source: services/budgets.ts | 30 Confirmation: review before save; delete separate | 38 Analytics: budget_saved |
| 7 Current: /budgets/new, /budgets/[id]/edit | 15 Secondary: cancel | 23 Loading: submit processing | 31 Security: authenticated | 39 Design: period options use Persian labels |
| 8 Target: /grow/budgets/new, /grow/budgets/[id]/edit | 16 Hierarchy: identity → amount → period → category | 24 Empty: N/A | 32 AI context: optional | 40 Acceptance: no invalid date range submitted |

### GROW-008 — Portfolio
| 1 ID: GROW-008 | 9 Action: MOVE/REFACTOR | 17 Layout: total value → return → allocation → accounts/holdings links | 25 Error: Global | 33 AI allowed: portfolio explanation |
| 2 Name: Portfolio | 10 Problem: understand investment position | 18 Required: PortfolioCard, ProgressBar, DataList | 26 Offline: Global | 34 AI confirmation: investment transaction |
| 3 Persian: پرتفوی | 11 Goal: inspect portfolio | 19 Optional: AIInsightCard | 27 Partial: allocation/performance independent | 35 RTL: returns LTR |
| 4 Type: COMMAND | 12 Entry: Grow Overview | 20 Data: total, invested, cash, P/L, allocation | 28 Refresh: pull-to-refresh | 36 A11y: total and return announced |
| 5 Priority: P1 | 13 Exit: Holdings, Accounts, Transactions, Analytics | 21 API: /investments/portfolio VERIFIED | 29 Form: N/A | 37 Responsive: stacked summary |
| 6 IA: GROW | 14 Primary: view holdings | 22 Source: services/investments.ts | 30 Confirmation: N/A | 38 Analytics: portfolio_viewed |
| 7 Current: /investments | 15 Secondary: view watchlists/transactions | 23 Loading: Global | 31 Security: authenticated | 39 Design: no fake market values |
| 8 Target: /grow/portfolio | 16 Hierarchy: total → return → allocation | 24 Empty: no portfolio data | 32 AI context: optional | 40 Acceptance: all financial values from API |

### GROW-009 — Investment Accounts
| 1 ID: GROW-009 | 9 Action: MOVE/REFACTOR | 17 Layout: account cards → broker/type/value | 25 Error: Global | 33 AI allowed: account explanation |
| 2 Name: Investment Accounts | 10 Problem: manage investment accounts | 18 Required: AccountCard, DataRow | 26 Offline: Global | 34 AI confirmation: account mutation |
| 3 Persian: حساب‌های سرمایه‌گذاری | 11 Goal: inspect accounts | 19 Optional: StatusBadge | 27 Partial: N/A | 35 RTL: account numbers LTR |
| 4 Type: LIST | 12 Entry: Portfolio | 20 Data: broker, type, currency, value, status | 28 Refresh: pull-to-refresh | 36 A11y: account + value |
| 5 Priority: P1 | 13 Exit: Investment Account Detail | 21 API: GET /investments/accounts VERIFIED | 29 Form: N/A | 37 Responsive: one column |
| 6 IA: GROW | 14 Primary: open account | 22 Source: services/investments.ts | 30 Confirmation: create/update/delete | 38 Analytics: investment_accounts_viewed |
| 7 Current: /investments/accounts | 15 Secondary: filter by type | 23 Loading: Global | 31 Security: authenticated | 39 Design: no broker branding assumptions |
| 8 Target: /grow/investments/accounts | 16 Hierarchy: broker → type → value | 24 Empty: no accounts | 32 AI context: N/A | 40 Acceptance: status localized |

### GROW-010 — Investment Account Detail
| 1 ID: GROW-010 | 9 Action: NEW | 17 Layout: account header → balances → holdings → transactions | 25 Error: Global | 33 AI allowed: account analysis |
| 2 Name: Investment Account Detail | 10 Problem: inspect one investment account | 18 Required: AccountCard, HoldingRow, TransactionRow | 26 Offline: Global | 34 AI confirmation: transaction mutation |
| 3 Persian: جزئیات حساب سرمایه‌گذاری | 11 Goal: understand account position | 19 Optional: FilterChip | 27 Partial: holdings/transactions independently stateful | 35 RTL: identifiers LTR |
| 4 Type: DETAIL | 12 Entry: Investment Accounts | 20 Data: account, holdings, transactions | 28 Refresh: pull-to-refresh | 36 A11y: account identity and value |
| 5 Priority: P1 | 13 Exit: Holding/Asset/Transaction Detail | 21 API: account, holdings, transactions VERIFIED backend | 29 Form: filters | 37 Responsive: single column |
| 6 IA: GROW | 14 Primary: view holdings | 22 Source: services/investments.ts | 30 Confirmation: account mutation | 38 Analytics: investment_account_detail_viewed |
| 7 Current: none | 15 Secondary: view transactions | 23 Loading: Global | 31 Security: authenticated | 39 Design: related lists use BaseSurface |
| 8 Target: /grow/investments/accounts/[accountId] | 16 Hierarchy: value → holdings → activity | 24 Empty: no holdings | 32 AI context: optional | 40 Acceptance: account filters preserved |

### GROW-011 — Holdings
| 1 ID: GROW-011 | 9 Action: MOVE/REFACTOR | 17 Layout: search/filter → holding rows → P/L | 25 Error: Global | 33 AI allowed: holding explanation |
| 2 Name: Holdings | 10 Problem: inspect owned assets | 18 Required: HoldingRow, MoneyAmount | 26 Offline: Global | 34 AI confirmation: trade/rebalance |
| 3 Persian: دارایی‌ها | 11 Goal: understand positions | 19 Optional: FilterChip | 27 Partial: missing price shown unavailable | 35 RTL: symbols and amounts LTR |
| 4 Type: LIST | 12 Entry: Portfolio, Investment Account | 20 Data: symbol, name, quantity, value, cost, P/L | 28 Refresh: pull-to-refresh | 36 A11y: signed P/L |
| 5 Priority: P1 | 13 Exit: Asset Detail | 21 API: /investments/portfolio/holdings VERIFIED | 29 Form: filters | 37 Responsive: dense rows |
| 6 IA: GROW | 14 Primary: open asset | 22 Source: services/investments.ts | 30 Confirmation: N/A | 38 Analytics: holdings_filtered |
| 7 Current: /investments/holdings | 15 Secondary: filter account/asset type | 23 Loading: Global | 31 Security: authenticated | 39 Design: no fake price fallback |
| 8 Target: /grow/investments/holdings | 16 Hierarchy: symbol → value → P/L | 24 Empty: no holdings | 32 AI context: optional | 40 Acceptance: unavailable price explicit |

### GROW-012 — Asset Detail
| 1 ID: GROW-012 | 9 Action: REBUILD | 17 Layout: asset header → price → holding → related transactions | 25 Error: Global | 33 AI allowed: asset analysis |
| 2 Name: Asset Detail | 10 Problem: understand one investment asset | 18 Required: DataList, HoldingRow, TransactionRow | 26 Offline: Global | 34 AI confirmation: trade |
| 3 Persian: جزئیات دارایی | 11 Goal: inspect real asset data | 19 Optional: chart if data verified | 27 Partial: price/holdings/transactions independently stateful | 35 RTL: symbol LTR |
| 4 Type: DETAIL | 12 Entry: Holdings, Watchlist | 20 Data: asset, price, holding, transactions | 28 Refresh: pull-to-refresh | 36 A11y: unavailable price announced |
| 5 Priority: P1 | 13 Exit: Holdings, Investment Transaction Detail | 21 API: GET /investments/assets/{id} VERIFIED backend; current UI MOCK | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: GROW | 14 Primary: view asset facts | 22 Source: service to be added | 30 Confirmation: N/A | 38 Analytics: asset_detail_viewed |
| 7 Current: /investments/asset/[id] | 15 Secondary: add/remove watchlist if verified | 23 Loading: Global | 31 Security: authenticated | 39 Design: hard-coded prices prohibited |
| 8 Target: /grow/assets/[assetId] | 16 Hierarchy: identity → price → holding → transactions | 24 Empty: no holding/transactions | 32 AI context: optional analysis | 40 Acceptance: no hard-coded financial values |

### GROW-013 — Investment Transactions
| 1 ID: GROW-013 | 9 Action: MOVE/REFACTOR | 17 Layout: filters → transaction rows → quantity/price/amount | 25 Error: Global | 33 AI allowed: transaction explanation |
| 2 Name: Investment Transactions | 10 Problem: audit investment activity | 18 Required: TransactionRow, StatusBadge | 26 Offline: Global | 34 AI confirmation: transaction mutation |
| 3 Persian: تراکنش‌های سرمایه‌گذاری | 11 Goal: find investment activity | 19 Optional: FilterChip | 27 Partial: optional asset data | 35 RTL: symbols LTR |
| 4 Type: LIST | 12 Entry: Portfolio, Investment Account | 20 Data: asset, type, quantity, price, amount, date | 28 Refresh: pull-to-refresh | 36 A11y: type + amount + date |
| 5 Priority: P1 | 13 Exit: Asset Detail | 21 API: GET /investments/transactions VERIFIED | 29 Form: filters | 37 Responsive: dense list |
| 6 IA: GROW | 14 Primary: open asset/transaction facts | 22 Source: services/investments.ts | 30 Confirmation: create/update if UI added | 38 Analytics: investment_transactions_filtered |
| 7 Current: /investments/transactions | 15 Secondary: filter account/type/date | 23 Loading: Global | 31 Security: authenticated | 39 Design: localized transaction types |
| 8 Target: /grow/investments/transactions | 16 Hierarchy: asset/type, amount, date | 24 Empty: no transactions | 32 AI context: optional | 40 Acceptance: transaction type not raw enum |

### GROW-014 — Watchlists
| 1 ID: GROW-014 | 9 Action: MOVE/REFACTOR | 17 Layout: watchlist cards → items → create form | 25 Error: Global | 33 AI allowed: watchlist insight |
| 2 Name: Watchlists | 10 Problem: monitor selected assets | 18 Required: DataRow, HoldingRow, SearchField | 26 Offline: Global | 34 AI confirmation: watchlist mutation |
| 3 Persian: دیده‌بان بازار | 11 Goal: manage watchlists | 19 Optional: FilterChip | 27 Partial: item prices may be unavailable | 35 RTL: symbols LTR |
| 4 Type: LIST | 12 Entry: Portfolio | 20 Data: watchlist name, description, items, prices | 28 Refresh: pull-to-refresh | 36 A11y: item count and names |
| 5 Priority: P2 | 13 Exit: Watchlist Detail, Asset Detail | 21 API: /investments/watchlists VERIFIED | 29 Form: create watchlist | 37 Responsive: one column |
| 6 IA: GROW | 14 Primary: open watchlist | 22 Source: services/investments.ts | 30 Confirmation: create/update/delete/add asset | 38 Analytics: watchlist_created/selected |
| 7 Current: /investments/watchlists | 15 Secondary: create watchlist | 23 Loading: Global | 31 Security: authenticated | 39 Design: no fake daily changes |
| 8 Target: /grow/investments/watchlists | 16 Hierarchy: name → item count → top items | 24 Empty: create first watchlist | 32 AI context: optional | 40 Acceptance: unavailable prices explicit |

### GROW-015 — Watchlist Detail
| 1 ID: GROW-015 | 9 Action: NEW | 17 Layout: watchlist header → items → add/remove actions | 25 Error: Global | 33 AI allowed: asset comparison |
| 2 Name: Watchlist Detail | 10 Problem: manage one watchlist | 18 Required: DataRow, HoldingRow, IconButton | 26 Offline: Global | 34 AI confirmation: add/remove asset |
| 3 Persian: جزئیات دیده‌بان | 11 Goal: inspect tracked assets | 19 Optional: FilterChip | 27 Partial: prices independently unavailable | 35 RTL: symbols LTR |
| 4 Type: DETAIL | 12 Entry: Watchlists | 20 Data: watchlist, items, assets, prices | 28 Refresh: pull-to-refresh | 36 A11y: add/remove labels |
| 5 Priority: P2 | 13 Exit: Asset Detail, Watchlists | 21 API: GET/PATCH/DELETE watchlist and assets VERIFIED | 29 Form: asset selection | 37 Responsive: one column |
| 6 IA: GROW | 14 Primary: view tracked assets | 22 Source: services/investments.ts | 30 Confirmation: remove/delete | 38 Analytics: watchlist_item_changed |
| 7 Current: none | 15 Secondary: rename, delete, add/remove asset | 23 Loading: Global | 31 Security: destructive confirmation | 39 Design: list not a trading terminal |
| 8 Target: /grow/investments/watchlists/[watchlistId] | 16 Hierarchy: identity → items → price/change | 24 Empty: no items | 32 AI context: optional | 40 Acceptance: item actions map to verified endpoints |

### GROW-016 — Wealth Analytics
| 1 ID: GROW-016 | 9 Action: MOVE/MERGE | 17 Layout: performance period → allocation → account allocation → performance points | 25 Error: Global | 33 AI allowed: performance summary |
| 2 Name: Wealth Analytics | 10 Problem: understand growth performance | 18 Required: PortfolioCard, ProgressBar, DataList | 26 Offline: Global | 34 AI confirmation: N/A |
| 3 Persian: تحلیل ثروت | 11 Goal: analyze allocation and returns | 19 Optional: chart component | 27 Partial: allocation/performance independent | 35 RTL: time axis follows chart semantics |
| 4 Type: LIST | 12 Entry: Grow Overview, Portfolio | 20 Data: allocation, account allocation, performance points | 28 Refresh: pull-to-refresh | 36 A11y: chart summaries |
| 5 Priority: P1 | 13 Exit: Portfolio, Holdings, Reports | 21 API: performance/allocation VERIFIED | 29 Form: period filter | 37 Responsive: max 720 |
| 6 IA: GROW | 14 Primary: select performance period | 22 Source: services/investments.ts | 30 Confirmation: N/A | 38 Analytics: wealth_analytics_period_changed |
| 7 Current: /investments/analytics | 15 Secondary: view holdings | 23 Loading: Global | 31 Security: authenticated | 39 Design: merge duplicate analytics concepts |
| 8 Target: /grow/wealth-analytics | 16 Hierarchy: return → allocation → account allocation → points | 24 Empty: no performance data | 32 AI context: optional insight | 40 Acceptance: no fabricated chart data |

## 9. CREDIT Pages

### CREDIT-001 — Credit Overview
| 1 ID: CREDIT-001 | 9 Action: MOVE/REFACTOR | 17 Layout: score summary → financial health → active debt → loans → actions | 25 Error: Global | 33 AI allowed: credit explanation |
| 2 Name: Credit Overview | 10 Problem: understand credit position | 18 Required: CreditScoreCard, FinancialHealthCard, LoanCard | 26 Offline: Global | 34 AI confirmation: loan application/payment |
| 3 Persian: اعتبار | 11 Goal: decide next credit action | 19 Optional: AIInsightCard | 27 Partial: score/loans independently stateful | 35 RTL: score LTR |
| 4 Type: COMMAND | 12 Entry: CREDIT tab | 20 Data: score, health, debt, active loans, eligibility | 28 Refresh: pull-to-refresh | 36 A11y: score range and debt announced |
| 5 Priority: P0 | 13 Exit: Score, Health, Eligibility, Loans | 21 API: /credit/score, /credit/financial-health VERIFIED | 29 Form: N/A | 37 Responsive: stacked summaries |
| 6 IA: CREDIT | 14 Primary: check eligibility | 22 Source: services/lending.ts | 30 Confirmation: N/A | 38 Analytics: credit_overview_viewed |
| 7 Current: /(tabs)/lending | 15 Secondary: view loans/products | 23 Loading: Global | 31 Security: authenticated | 39 Design: borrower-centered, not "وام‌دهی" |
| 8 Target: /credit | 16 Hierarchy: score → health → debt → loans | 24 Empty: no credit data | 32 AI context: one insight max | 40 Acceptance: credit concepts not merged incorrectly |

### CREDIT-002 — Credit Score
| 1 ID: CREDIT-002 | 9 Action: NEW | 17 Layout: score gauge → band → reasons → change | 25 Error: Global | 33 AI allowed: explain reasons |
| 2 Name: Credit Score | 10 Problem: understand current score | 18 Required: CreditScoreCard, DataList | 26 Offline: Global | 34 AI confirmation: N/A |
| 3 Persian: امتیاز اعتباری | 11 Goal: interpret score | 19 Optional: ProgressBar | 27 Partial: history may be unavailable | 35 RTL: score/numbers LTR |
| 4 Type: DETAIL | 12 Entry: Credit Overview | 20 Data: score, band, reasons, calculated date | 28 Refresh: pull-to-refresh | 36 A11y: score value + range + band |
| 5 Priority: P0 | 13 Exit: Score History, Financial Health | 21 API: GET /credit/score VERIFIED | 29 Form: N/A | 37 Responsive: centered card |
| 6 IA: CREDIT | 14 Primary: view reasons | 22 Source: services/lending.ts | 30 Confirmation: N/A | 38 Analytics: credit_score_viewed |
| 7 Current: part of lending tab | 15 Secondary: view history | 23 Loading: Global | 31 Security: authenticated | 39 Design: gauge never obscures numeric score |
| 8 Target: /credit/score | 16 Hierarchy: score → band → reasons → date | 24 Empty: no score | 32 AI context: explanation only | 40 Acceptance: score range explicit |

### CREDIT-003 — Score History
| 1 ID: CREDIT-003 | 9 Action: NEW | 17 Layout: period → history list/chart → changes | 25 Error: Global | 33 AI allowed: trend explanation |
| 2 Name: Score History | 10 Problem: understand score changes | 18 Required: DataRow, MoneyAmount | 26 Offline: Global | 34 AI confirmation: N/A |
| 3 Persian: تاریخچه امتیاز | 11 Goal: analyze trend | 19 Optional: chart | 27 Partial: partial history marked | 35 RTL: time axis chart-specific |
| 4 Type: LIST | 12 Entry: Credit Score | 20 Data: historical score, band, date, change | 28 Refresh: pull-to-refresh | 36 A11y: chart text summary |
| 5 Priority: P1 | 13 Exit: Credit Score, Health | 21 API: GET /credit/score-history VERIFIED backend, MISSING UI | 29 Form: period filter | 37 Responsive: max 720 |
| 6 IA: CREDIT | 14 Primary: view trend | 22 Source: service to be added | 30 Confirmation: N/A | 38 Analytics: score_history_period_changed |
| 7 Current: none | 15 Secondary: view reasons | 23 Loading: Global | 31 Security: authenticated | 39 Design: no fake score trajectory |
| 8 Target: /credit/score/history | 16 Hierarchy: latest → change → history | 24 Empty: no history | 32 AI context: optional | 40 Acceptance: history values API-sourced |

### CREDIT-004 — Financial Health
| 1 ID: CREDIT-004 | 9 Action: NEW | 17 Layout: health score → debt → utilization → active loans → reasons | 25 Error: Global | 33 AI allowed: health advice |
| 2 Name: Financial Health | 10 Problem: understand credit health drivers | 18 Required: FinancialHealthCard, DataList, LoanCard | 26 Offline: Global | 34 AI confirmation: payment/application |
| 3 Persian: سلامت مالی | 11 Goal: identify improvement actions | 19 Optional: ProgressBar | 27 Partial: loans may be unavailable | 35 RTL: ratios LTR |
| 4 Type: DETAIL | 12 Entry: Credit Overview, Score | 20 Data: profile, total debt, active loans, utilization, repayment history | 28 Refresh: pull-to-refresh | 36 A11y: grouped health factors |
| 5 Priority: P0 | 13 Exit: Loans, Eligibility | 21 API: GET /credit/financial-health VERIFIED | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: CREDIT | 14 Primary: view debt/utilization | 22 Source: services/lending.ts | 30 Confirmation: N/A | 38 Analytics: financial_health_viewed |
| 7 Current: part of lending tab | 15 Secondary: view loans | 23 Loading: Global | 31 Security: authenticated | 39 Design: distinct from eligibility |
| 8 Target: /credit/health | 16 Hierarchy: score → debt → utilization → loans | 24 Empty: no profile | 32 AI context: optional advice | 40 Acceptance: each factor has label/value |

### CREDIT-005 — Eligibility
| 1 ID: CREDIT-005 | 9 Action: MOVE/REFACTOR | 17 Layout: amount/duration inputs → result → reasons → product CTA | 25 Error: Global | 33 AI allowed: explain eligibility |
| 2 Name: Eligibility | 10 Problem: know borrowing capacity | 18 Required: FormField, GlassInput, StatusBadge, PrimaryButton | 26 Offline: block check | 34 AI confirmation: application |
| 3 Persian: احراز شرایط | 11 Goal: receive reliable eligibility result | 19 Optional: ReviewSummary | 27 Partial: N/A | 35 RTL: amount LTR |
| 4 Type: ACTION | 12 Entry: Credit Overview | 20 Data: amount, duration, currency, result, reasons, max amount | 28 Refresh: N/A | 36 A11y: result and reasons announced |
| 5 Priority: P0 | 13 Exit: Loan Products, Application | 21 API: GET /credit/eligibility VERIFIED | 29 Validation: positive amount, valid duration | 37 Responsive: 420 form |
| 6 IA: CREDIT | 14 Primary: check eligibility | 22 Source: services/lending.ts | 30 Confirmation: application, not check | 38 Analytics: eligibility_checked |
| 7 Current: /lending/eligibility | 15 Secondary: view products | 23 Loading: processing result | 31 Security: no credit decision guarantee language | 39 Design: result not a loan approval |
| 8 Target: /credit/eligibility | 16 Hierarchy: inputs → result → reasons → next | 24 Empty: N/A | 32 AI context: reason explanation | 40 Acceptance: eligible amount and reasons explicit |

### CREDIT-006 — Loan Products
| 1 ID: CREDIT-006 | 9 Action: MOVE/REFACTOR | 17 Layout: product cards → rate/amount/duration/score → apply | 25 Error: Global | 33 AI allowed: compare products |
| 2 Name: Loan Products | 10 Problem: choose a loan offer | 18 Required: LoanCard, DataList, StatusBadge | 26 Offline: Global | 34 AI confirmation: application |
| 3 Persian: محصولات وام | 11 Goal: compare verified products | 19 Optional: FilterChip | 27 Partial: N/A | 35 RTL: amounts/rates LTR |
| 4 Type: LIST | 12 Entry: Credit Overview, Eligibility | 20 Data: product, rate, min/max amount, duration, score band, status | 28 Refresh: pull-to-refresh | 36 A11y: product terms summarized |
| 5 Priority: P0 | 13 Exit: Loan Application | 21 API: GET /loan-products VERIFIED | 29 Form: filters | 37 Responsive: one column |
| 6 IA: CREDIT | 14 Primary: start application | 22 Source: services/lending.ts | 30 Confirmation: application | 38 Analytics: loan_product_selected |
| 7 Current: /lending/products | 15 Secondary: filter active products | 23 Loading: Global | 31 Security: active products only by default | 39 Design: terms not buried |
| 8 Target: /credit/products | 16 Hierarchy: product → rate → amount range → duration | 24 Empty: no products | 32 AI context: comparison only | 40 Acceptance: inactive products clearly labeled |

### CREDIT-007 — Loan Application
| 1 ID: CREDIT-007 | 9 Action: MOVE/REFACTOR | 17 Layout: selected product summary → amount/duration/purpose → review → submit | 25 Error: field and global | 33 AI allowed: explain terms |
| 2 Name: Loan Application | 10 Problem: apply for a loan safely | 18 Required: ReviewSummary, FormField, GlassInput, PrimaryButton | 26 Offline: block submit | 34 AI confirmation: submit application |
| 3 Persian: درخواست وام | 11 Goal: submit valid application | 19 Optional: eligibility context | 27 Partial: N/A | 35 RTL: amounts LTR |
| 4 Type: ACTION | 12 Entry: Loan Products, Eligibility | 20 Data: product, amount, duration, purpose, terms | 28 Refresh: N/A | 36 A11y: review includes all financial terms |
| 5 Priority: P0 | 13 Exit: Applications, Credit Overview | 21 API: GET product, POST /loan-applications VERIFIED | 29 Validation: product, amount within range, positive duration | 37 Responsive: sticky submit |
| 6 IA: CREDIT | 14 Primary: review and submit | 22 Source: services/lending.ts | 30 Confirmation: explicit application review | 38 Analytics: loan_application_submitted |
| 7 Current: /lending/application/new | 15 Secondary: cancel | 23 Loading: submit processing | 31 Security: no misleading approval guarantee | 39 Design: product terms visible in review |
| 8 Target: /credit/application | 16 Hierarchy: product → inputs → terms → review | 24 Empty: product required | 32 AI context: term explanation | 40 Acceptance: invalid amount cannot submit |

### CREDIT-008 — Applications
| 1 ID: CREDIT-008 | 9 Action: MOVE/REFACTOR | 17 Layout: status filter → application cards → dates | 25 Error: Global | 33 AI allowed: status explanation |
| 2 Name: Applications | 10 Problem: track loan requests | 18 Required: PaymentRow, StatusBadge, DataRow | 26 Offline: Global | 34 AI confirmation: cancel/submit |
| 3 Persian: درخواست‌های وام | 11 Goal: understand application state | 19 Optional: FilterChip | 27 Partial: N/A | 35 RTL: dates localized |
| 4 Type: LIST | 12 Entry: Credit Overview | 20 Data: product, amount, duration, status, submitted date | 28 Refresh: pull-to-refresh | 36 A11y: status + amount |
| 5 Priority: P0 | 13 Exit: Application Detail | 21 API: GET /loan-applications VERIFIED | 29 Form: filters | 37 Responsive: one column |
| 6 IA: CREDIT | 14 Primary: open application | 22 Source: services/lending.ts | 30 Confirmation: submit/cancel if exposed | 38 Analytics: applications_filtered |
| 7 Current: /lending/applications | 15 Secondary: create new application | 23 Loading: Global | 31 Security: authenticated | 39 Design: no raw status enum |
| 8 Target: /credit/applications | 16 Hierarchy: product, amount, status, date | 24 Empty: no applications | 32 AI context: optional | 40 Acceptance: status transitions localized |

### CREDIT-009 — Application Detail
| 1 ID: CREDIT-009 | 9 Action: NEW | 17 Layout: application header/status → amount/terms → timeline → actions | 25 Error: Global | 33 AI allowed: explain timeline |
| 2 Name: Application Detail | 10 Problem: verify one application | 18 Required: DataList, StatusBadge, ReviewSummary | 26 Offline: Global | 34 AI confirmation: submit/cancel |
| 3 Persian: جزئیات درخواست | 11 Goal: understand state and next action | 19 Optional: AIInsightCard | 27 Partial: review data may be restricted | 35 RTL: references LTR |
| 4 Type: DETAIL | 12 Entry: Applications | 20 Data: application, product, status, dates, decision/rejection reason | 28 Refresh: pull-to-refresh | 36 A11y: status and amount |
| 5 Priority: P1 | 13 Exit: Product, Applications, Loan Detail | 21 API: GET /loan-applications/{id}, submit/cancel VERIFIED backend | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: CREDIT | 14 Primary: view application status | 22 Source: service to be added/extended | 30 Confirmation: submit/cancel | 38 Analytics: application_detail_viewed |
| 7 Current: none | 15 Secondary: contact support if verified | 23 Loading: Global | 31 Security: only owner actions | 39 Design: timeline optional if dates available |
| 8 Target: /credit/applications/[applicationId] | 16 Hierarchy: status → amount → terms → timeline | 24 Empty: N/A | 32 AI context: optional | 40 Acceptance: no invented review data |

### CREDIT-010 — My Loans
| 1 ID: CREDIT-010 | 9 Action: MOVE/REFACTOR | 17 Layout: loan summary → remaining balance → status → next installment | 25 Error: Global | 33 AI allowed: repayment advice |
| 2 Name: My Loans | 10 Problem: track active obligations | 18 Required: LoanCard, InstallmentRow | 26 Offline: Global | 34 AI confirmation: payment |
| 3 Persian: وام‌های من | 11 Goal: understand loans and payments | 19 Optional: FilterChip | 27 Partial: installments may load separately | 35 RTL: amounts LTR |
| 4 Type: LIST | 12 Entry: Credit Overview | 20 Data: product, principal, remaining, rate, status, maturity | 28 Refresh: pull-to-refresh | 36 A11y: remaining balance and status |
| 5 Priority: P0 | 13 Exit: Loan Detail, Payment | 21 API: GET /loans VERIFIED | 29 Form: filters | 37 Responsive: one column |
| 6 IA: CREDIT | 14 Primary: open loan | 22 Source: services/lending.ts | 30 Confirmation: payment | 38 Analytics: loans_viewed |
| 7 Current: /lending/my-loans | 15 Secondary: pay active loan | 23 Loading: Global | 31 Security: authenticated | 39 Design: overdue state explicit |
| 8 Target: /credit/loans | 16 Hierarchy: remaining → status → next payment | 24 Empty: no loans | 32 AI context: optional | 40 Acceptance: statuses localized |

### CREDIT-011 — Loan Detail
| 1 ID: CREDIT-011 | 9 Action: MOVE/REFACTOR | 17 Layout: loan header → balance → terms → repayment progress → recent installments | 25 Error: Global | 33 AI allowed: repayment explanation |
| 2 Name: Loan Detail | 10 Problem: understand one loan | 18 Required: LoanCard, ProgressBar, InstallmentRow, DataList | 26 Offline: Global | 34 AI confirmation: payment |
| 3 Persian: جزئیات وام | 11 Goal: track balance and schedule | 19 Optional: AIInsightCard | 27 Partial: installments unavailable separately | 35 RTL: amounts LTR |
| 4 Type: DETAIL | 12 Entry: My Loans | 20 Data: loan, product, principal, interest, total payable, remaining, installments | 28 Refresh: pull-to-refresh | 36 A11y: remaining + progress + next due |
| 5 Priority: P0 | 13 Exit: Installments, Payment | 21 API: GET /loans/{id}, installments VERIFIED | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: CREDIT | 14 Primary: pay installment | 22 Source: services/lending.ts | 30 Confirmation: payment | 38 Analytics: loan_detail_viewed |
| 7 Current: /lending/loan/[loanId] | 15 Secondary: view all installments | 23 Loading: Global | 31 Security: authenticated | 39 Design: terms on readable surface |
| 8 Target: /credit/loans/[loanId] | 16 Hierarchy: remaining → terms → progress → schedule | 24 Empty: no installments | 32 AI context: optional | 40 Acceptance: payment action only for ACTIVE |

### CREDIT-012 — Installments
| 1 ID: CREDIT-012 | 9 Action: NEW | 17 Layout: status filter → installment rows → due date/amount/status | 25 Error: Global | 33 AI allowed: payment planning |
| 2 Name: Installments | 10 Problem: manage repayment schedule | 18 Required: InstallmentRow, FilterChip | 26 Offline: Global | 34 AI confirmation: payment |
| 3 Persian: اقساط | 11 Goal: find due/paid installments | 19 Optional: ProgressBar | 27 Partial: N/A | 35 RTL: dates localized, amounts LTR |
| 4 Type: LIST | 12 Entry: Loan Detail | 20 Data: number, due date, principal, interest, total, paid, remaining, status | 28 Refresh: pull-to-refresh | 36 A11y: installment number + due + amount |
| 5 Priority: P0 | 13 Exit: Loan Payment | 21 API: GET /loans/{id}/installments VERIFIED | 29 Form: filters | 37 Responsive: dense list |
| 6 IA: CREDIT | 14 Primary: pay due installment | 22 Source: services/lending.ts | 30 Confirmation: payment | 38 Analytics: installments_filtered |
| 7 Current: part of loan detail | 15 Secondary: view paid/pending/overdue | 23 Loading: Global | 31 Security: authenticated | 39 Design: overdue visually and textually explicit |
| 8 Target: /credit/loans/[loanId]/installments | 16 Hierarchy: due date → amount → status | 24 Empty: no installments | 32 AI context: optional plan | 40 Acceptance: no truncated schedule |

### CREDIT-013 — Loan Payment
| 1 ID: CREDIT-013 | 9 Action: FIX/MOVE/REFACTOR | 17 Layout: loan/installment context → amount → review → confirm → processing | 25 Error: Global and payment failure | 33 AI allowed: amount explanation |
| 2 Name: Loan Payment | 10 Problem: repay a loan safely | 18 Required: ReviewSummary, GlassInput, PrimaryButton, SuccessState | 26 Offline: block payment | 34 AI confirmation: payment execution |
| 3 Persian: پرداخت وام | 11 Goal: complete verified payment | 19 Optional: installment selector | 27 Partial: N/A | 35 RTL: amount LTR |
| 4 Type: ACTION | 12 Entry: Loan Detail, Installments | 20 Data: loan, installment, amount, currency, remaining | 28 Refresh: refresh loan after payment | 36 A11y: amount + loan context announced |
| 5 Priority: P0 | 13 Exit: Loan Detail, Success | 21 API: POST /loans/{id}/pay VERIFIED backend; mobile ENDPOINT MISMATCH | 29 Validation: positive amount, not greater than remaining unless product supports overpay | 37 Responsive: sticky confirm |
| 6 IA: CREDIT | 14 Primary: review and confirm payment | 22 Source: services/lending.ts | 30 Confirmation: explicit review + processing | 38 Analytics: loan_payment_confirmed |
| 7 Current: /lending/loan/[loanId]/pay | 15 Secondary: cancel | 23 Loading: processing | 31 Security: idempotency key, no double submit | 39 Design: endpoint mismatch is a Wave 0 blocker |
| 8 Target: /credit/loans/[loanId]/pay | 16 Hierarchy: context → amount → fees → review | 24 Empty: N/A | 32 AI context: N/A | 40 Acceptance: payment uses verified endpoint and refreshes loan |

## 10. AI Pages

### AI-001 — Ask Nova
| 1 ID: AI-001 | 9 Action: MOVE/REFACTOR | 17 Layout: message list → composer → pending confirmation cards | 25 Error: message error + retry | 33 AI allowed: informational/analytical/recommendation |
| 2 Name: Ask Nova | 10 Problem: ask a financial question | 18 Required: AIMessage, AIActionCard, GlassInput, PrimaryButton | 26 Offline: queued input prohibited | 34 AI confirmation: all mutations |
| 3 Persian: بپرس نوا | 11 Goal: receive trustworthy guidance | 19 Optional: AIInsightCard | 27 Partial: tool result may be partial | 35 RTL: Persian text RTL, IDs LTR |
| 4 Type: COMMAND | 12 Entry: AI tab, contextual AI actions | 20 Data: conversation, messages, pending tool confirmations, usage | 28 Refresh: conversation refresh | 36 A11y: streaming/loading announcements |
| 5 Priority: P1 | 13 Exit: Conversations, entity details | 21 API: POST /ai/chat, /ai/confirm VERIFIED | 29 Form: free text input | 37 Responsive: full-height chat |
| 6 IA: AI | 14 Primary: send question | 22 Source: services/ai.ts | 30 Confirmation: backend tool confirmation | 38 Analytics: ai_message_sent/confirmed |
| 7 Current: /(tabs)/ai | 15 Secondary: new conversation | 23 Loading: assistant typing state | 31 Security: AI never directly accesses DB | 39 Design: AI attribution clear |
| 8 Target: /ai | 16 Hierarchy: conversation → response → proposed actions | 24 Empty: suggested questions | 32 AI context: primary | 40 Acceptance: mutation requires explicit confirmation |

### AI-002 — Conversations
| 1 ID: AI-002 | 9 Action: NEW | 17 Layout: search → conversation rows → last message/date | 25 Error: Global | 33 AI allowed: history summary |
| 2 Name: Conversations | 10 Problem: return to past AI work | 18 Required: DataRow, SearchField | 26 Offline: cached list marked stale | 34 AI confirmation: N/A |
| 3 Persian: گفتگوها | 11 Goal: find a conversation | 19 Optional: FilterChip | 27 Partial: N/A | 35 RTL: global |
| 4 Type: LIST | 12 Entry: AI tab | 20 Data: conversation id/title, last message, timestamp | 28 Refresh: pull-to-refresh | 36 A11y: conversation title + date |
| 5 Priority: P1 | 13 Exit: Conversation Detail | 21 API: GET /ai/conversations VERIFIED | 29 Form: search | 37 Responsive: one column |
| 6 IA: AI | 14 Primary: open conversation | 22 Source: services/ai.ts | 30 Confirmation: delete if verified (NOT VERIFIED) | 38 Analytics: conversations_viewed |
| 7 Current: none | 15 Secondary: start new conversation | 23 Loading: Global | 31 Security: owner-only conversations | 39 Design: not a general social inbox |
| 8 Target: /ai/conversations | 16 Hierarchy: title, last update | 24 Empty: no conversations | 32 AI context: history | 40 Acceptance: no unverified delete action |

### AI-003 — Conversation Detail
| 1 ID: AI-003 | 9 Action: NEW | 17 Layout: conversation header → messages → pending confirmations → composer | 25 Error: Global | 33 AI allowed: continue conversation |
| 2 Name: Conversation Detail | 10 Problem: continue previous AI context | 18 Required: AIMessage, AIActionCard | 26 Offline: block send | 34 AI confirmation: mutations |
| 3 Persian: جزئیات گفتگو | 11 Goal: resume analysis | 19 Optional: usage metadata | 27 Partial: historical tool data | 35 RTL: global |
| 4 Type: DETAIL | 12 Entry: Conversations | 20 Data: messages, tool executions, pending confirmations | 28 Refresh: pull-to-refresh | 36 A11y: message roles and statuses |
| 5 Priority: P1 | 13 Exit: entity details, Ask Nova | 21 API: GET /ai/conversations/{id}, chat/confirm VERIFIED | 29 Form: message composer | 37 Responsive: full-height chat |
| 6 IA: AI | 14 Primary: continue conversation | 22 Source: services/ai.ts | 30 Confirmation: tool actions | 38 Analytics: ai_conversation_opened |
| 7 Current: none | 15 Secondary: new conversation | 23 Loading: Global | 31 Security: owner-only | 39 Design: preserve context without fake memory |
| 8 Target: /ai/conversations/[conversationId] | 16 Hierarchy: context → messages → actions | 24 Empty: no messages | 32 AI context: primary | 40 Acceptance: history accurately represents backend state |

### AI-004 — Insights
| 1 ID: AI-004 | 9 Action: NEW | 17 Layout: insight cards by domain → timeframe → confidence/source | 25 Error: Global | 33 AI allowed: analytical |
| 2 Name: Insights | 10 Problem: understand financial patterns | 18 Required: AIInsightCard, FilterChip | 26 Offline: Global | 34 AI confirmation: any action |
| 3 Persian: بینش‌ها | 11 Goal: review AI-generated insights | 19 Optional: DataRow | 27 Partial: domain-specific unavailable | 35 RTL: global |
| 4 Type: LIST | 12 Entry: AI tab, Home | 20 Data: insight title/body/domain/timeframe/source | 28 Refresh: pull-to-refresh | 36 A11y: insight attributed and summarized |
| 5 Priority: P2 | 13 Exit: related entity/domain | 21 Backend capability: dedicated insights endpoint NOT VERIFIED | 29 Form: domain/time filters | 37 Responsive: one column |
| 6 IA: AI | 14 Primary: view insight detail/entity | 22 Source: backend capability must be verified | 30 Confirmation: N/A | 38 Analytics: ai_insight_viewed |
| 7 Current: none | 15 Secondary: ask follow-up | 23 Loading: Global | 31 Security: no fabricated predictions | 39 Design: block until capability verified |
| 8 Target: /ai/insights | 16 Hierarchy: domain → insight → action | 24 Empty: no verified insights | 32 AI context: primary | 40 Acceptance: no fake insights |

### AI-005 — Recommendations
| 1 ID: AI-005 | 9 Action: NEW | 17 Layout: recommendation cards → rationale → impact → confirm action | 25 Error: Global | 33 AI allowed: recommend |
| 2 Name: Recommendations | 10 Problem: decide next financial action | 18 Required: AIActionCard, ReviewSummary | 26 Offline: block execution | 34 AI confirmation: every mutation |
| 3 Persian: پیشنهادها | 11 Goal: evaluate proposed actions | 19 Optional: AIInsightCard | 27 Partial: N/A | 35 RTL: amounts LTR |
| 4 Type: DECISION | 12 Entry: AI tab, Home | 20 Data: recommendation, rationale, impact, required action | 28 Refresh: pull-to-refresh | 36 A11y: impact and confirmation explicit |
| 5 Priority: P2 | 13 Exit: target action flow | 21 Backend capability: dedicated recommendations endpoint NOT VERIFIED | 29 Form: N/A | 37 Responsive: one column |
| 6 IA: AI | 14 Primary: review recommendation | 22 Source: backend capability must be verified | 30 Confirmation: required before execution | 38 Analytics: ai_recommendation_accepted |
| 7 Current: none | 15 Secondary: ask explanation | 23 Loading: Global | 31 Security: AI cannot directly mutate records | 39 Design: block until capability verified |
| 8 Target: /ai/recommendations | 16 Hierarchy: recommendation → rationale → impact → action | 24 Empty: no recommendations | 32 AI context: primary | 40 Acceptance: no silent mutation |

## 11. Global Pages

### GLOBAL-001 — Notifications
| 1 ID: GLOBAL-001 | 9 Action: REFACTOR | 17 Layout: unread filter → notification rows → mark all read | 25 Error: Global | 33 AI allowed: summarize notification |
| 2 Name: Notifications | 10 Problem: catch important events | 18 Required: NotificationRow, FilterChip | 26 Offline: cached list marked stale | 34 AI confirmation: N/A |
| 3 Persian: اعلان‌ها | 11 Goal: review notifications | 19 Optional: StatusBadge | 27 Partial: pagination | 35 RTL: global |
| 4 Type: LIST | 12 Entry: global header | 20 Data: title, body, type, read state, date | 28 Refresh: pull-to-refresh | 36 A11y: unread state exposed |
| 5 Priority: P1 | 13 Exit: Notification Detail | 21 API: GET /notifications, read-all VERIFIED | 29 Form: unread filter | 37 Responsive: one column |
| 6 IA: GLOBAL | 14 Primary: open notification | 22 Source: services/notifications.ts | 30 Confirmation: mark all read | 38 Analytics: notifications_viewed |
| 7 Current: /notifications | 15 Secondary: mark all read | 23 Loading: Global | 31 Security: authenticated | 39 Design: global header badge if unread count available |
| 8 Target: /notifications | 16 Hierarchy: unread first, then date | 24 Empty: no notifications | 32 AI context: optional | 40 Acceptance: read state persists |

### GLOBAL-002 — Notification Detail
| 1 ID: GLOBAL-002 | 9 Action: REFACTOR | 17 Layout: title → body → date → related entity action if data exists | 25 Error: Global | 33 AI allowed: explain notification |
| 2 Name: Notification Detail | 10 Problem: understand one event | 18 Required: DataList, DataRow | 26 Offline: Global | 34 AI confirmation: any linked mutation |
| 3 Persian: جزئیات اعلان | 11 Goal: read and act | 19 Optional: ActionTile | 27 Partial: linked entity may be unavailable | 35 RTL: dates localized |
| 4 Type: DETAIL | 12 Entry: Notifications | 20 Data: notification, read state, data payload | 28 Refresh: pull-to-refresh | 36 A11y: title/body/date |
| 5 Priority: P2 | 13 Exit: related entity, Notifications | 21 API: GET /notifications/{id}, mark read VERIFIED | 29 Form: N/A | 37 Responsive: single column |
| 6 IA: GLOBAL | 14 Primary: mark/read | 22 Source: services/notifications.ts | 30 Confirmation: linked mutation | 38 Analytics: notification_opened |
| 7 Current: /notifications/[id] | 15 Secondary: open related entity | 23 Loading: Global | 31 Security: payload actions must be allowlisted | 39 Design: no arbitrary deep link from payload |
| 8 Target: /notifications/[id] | 16 Hierarchy: title → body → date → action | 24 Empty: N/A | 32 AI context: optional | 40 Acceptance: read state updated safely |

### GLOBAL-003 — Global Search
| 1 ID: GLOBAL-003 | 9 Action: NEW | 17 Layout: search field → recent/suggested → grouped results | 25 Error: Global | 33 AI allowed: answer/search help |
| 2 Name: Global Search | 10 Problem: find financial entities quickly | 18 Required: SearchField, DataRow, FilterChip | 26 Offline: search blocked | 34 AI confirmation: N/A |
| 3 Persian: جست‌وجو | 11 Goal: navigate to an entity | 19 Optional: EmptyState | 27 Partial: per-domain results independent | 35 RTL: technical identifiers LTR |
| 4 Type: LIST | 12 Entry: global header | 20 Data: transactions, accounts, cards, payments, goals, investments, loans, help, AI | 28 Refresh: new query only | 36 A11y: results grouped with headings |
| 5 Priority: P1 | 13 Exit: matching detail screens | 21 Backend capability: aggregate search NOT VERIFIED; individual list endpoints partially available | 29 Form: query/filter | 37 Responsive: one column |
| 6 IA: GLOBAL | 14 Primary: search | 22 Source: requires backend capability decision | 30 Confirmation: N/A | 38 Analytics: search_submitted/result_selected |
| 7 Current: none | 15 Secondary: filter domain | 23 Loading: grouped skeletons | 31 Security: owner-scoped results only | 39 Design: block until aggregate or per-domain search strategy verified |
| 8 Target: /search | 16 Hierarchy: recent → suggested → grouped results | 24 Empty: no results | 32 AI context: AI answer clearly separated | 40 Acceptance: no unsupported domain shown |

## 12. Blocked Capability Candidates

These are not implementation screens until capability is verified:

| Candidate | Status | Requirement |
|---|---|---|
| Savings | MISSING | Define savings model/endpoint or map to verified Goal capability |
| Tags | MISSING | Verify tag model, API, and transaction tagging |
| Bills | NOT VERIFIED | Verify bill products/providers/payments |
| Recharge | NOT VERIFIED | Verify recharge providers and payments |
| Global search aggregation | NOT VERIFIED | Verify aggregate endpoint or client search strategy |
| Net-worth aggregation | NOT VERIFIED | Verify account/investment/credit aggregate endpoint |
| External bank connection | NOT VERIFIED | Verify OAuth/linking provider and security review |
