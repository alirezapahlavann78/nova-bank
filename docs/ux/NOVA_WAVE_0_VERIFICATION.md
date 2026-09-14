# NOVA — Wave 0 Verification

## 1. Baseline Repository State

- Baseline Git HEAD: `49510871d20911b18f527b7289fe838fa5b72ac8`.
- Repository status at baseline: **not clean**.
- The repository contained extensive pre-existing uncommitted API, mobile, asset, documentation, and lockfile changes.
- No reset, checkout, clean, stash, or destructive file operation was performed.
- Wave 0 edited only the files listed in section 16.

## 2. Problems Investigated

| Problem | Investigation result | Wave 0 result |
|---|---|---|
| Loan payment endpoint mismatch | Backend canonical route is `POST /loans/{id}/pay`; mobile used `POST /loans/{id}/payments`. | FIXED |
| Budget delete method mismatch | Backend canonical route is `DELETE /budgets/{id}`; mobile service used `POST`. | FIXED |
| Goal delete method mismatch | Backend canonical route is `DELETE /goals/{id}`; mobile service used `POST`. | FIXED |
| Hard-coded API base URL | Two mobile modules contained a hard-coded LAN API URL. | FIXED |
| Asset Detail mock prices | No verified asset-price endpoint exists; screen displayed `$192.50` and `$190.30`. | FIXED for Asset Detail |
| Missing route baseline | Current app has 35 screen route files plus layouts. | ADDED static smoke baseline |
| Authenticated root behavior | Root guard and startup refresh were inspected and covered by static smoke assertions. | VERIFIED at code/type level |
| Payment idempotency | Backend expects `idempotency-key` as a header; mobile previously sent it in the payment body or omitted it. | FIXED |
| Refresh/invalidation | Payments, budgets, goals, and loan detail lacked reliable post-mutation refresh. | PARTIALLY FIXED |
| Token storage | Access token was in AsyncStorage; refresh token used SecureStore. | IMPROVED |
| AI → Prisma boundary | `ToolManagerService` directly queried Prisma for credit-score history. | FIXED for financial tools |

## 3. Problems Fixed

1. Loan payment now calls `POST /loans/{loanId}/pay` with `{ amount }` and an `idempotency-key` header.
2. Budget deletion now calls `DELETE /budgets/{id}`.
3. Goal deletion now calls `DELETE /goals/{id}`.
4. API base URL is read from `EXPO_PUBLIC_API_URL`, normalized, and validated as an absolute HTTP/HTTPS URL.
5. Missing API configuration fails explicitly instead of silently using a source-coded IP.
6. Asset Detail no longer shows the two hard-coded prices and displays an explicit Persian unavailable state.
7. Payment and loan-payment screens retain one idempotency key per logical submission and reset it when the form changes.
8. Payment idempotency keys are sent as headers, not request-body fields.
9. Access tokens now use platform-aware secure storage on native and migrate the legacy AsyncStorage value once.
10. Payment, budget, goal, and loan-detail data refresh after relevant mutations or route focus.
11. Budget deletion now requires explicit confirmation.
12. Goal progress uses the verified service rather than a relative native `fetch` URL.
13. AI credit-score history now goes through `CreditScoreService`; `ToolManagerService` no longer injects or calls Prisma.

## 4. Problems Intentionally Not Fixed

1. The backend investment module still uses `MockMarketDataProvider`. Asset Detail no longer displays its hard-coded prices, but holdings, watchlists, portfolio value, allocation, and performance can still receive mock-derived values. Replacing or hiding every derived investment metric requires a product decision and is not safely completable in Wave 0 without a broader investment-data pass.
2. No new market-data provider was added.
3. No six-tab navigation, Home, Money, Pay, Grow, Credit, AI, or Design System work was performed.
4. No global query-cache architecture was introduced.
5. No compatibility endpoint was added for the old loan-payment route.
6. No commit was created because the repository already contains unrelated uncommitted changes in many of the same files. Committing whole files would include unrelated user work.

## 5. Verified API Contracts

| Operation | Verified contract | Ownership/security | Tests |
|---|---|---|---|
| Loan payment | `POST /loans/{id}/pay`, body `{ amount }`, optional `idempotency-key` header | JWT guard; service filters by `userId` | `wave0-contracts.spec.ts` |
| Budget delete | `DELETE /budgets/{id}` | JWT guard; service filters by `userId` | `wave0-contracts.spec.ts` |
| Goal delete | `DELETE /goals/{id}` | JWT guard; service filters by `userId` | `wave0-contracts.spec.ts` |
| Payment create | `POST /payments`, body excludes idempotency key, `idempotency-key` header | JWT guard; source-account ownership and balance checks | `wave0-contracts.spec.ts`, `payments.service.spec.ts` |
| Payment duplicate | Completed idempotency key returns stored response without re-execution | User-scoped key and request hash | `wave0-contracts.spec.ts`, `idempotency.service.spec.ts` |
| Loan duplicate | Existing `idempotencyKey` returns existing payment without mutation | User-scoped loan lookup | `wave0-contracts.spec.ts` |
| Asset price | No verified real-time asset-price endpoint found | N/A | Static Wave 0 smoke |

## 6. Route Inventory

Route count: **35**.

The route smoke baseline verifies that:

1. The app contains exactly the 35 inventoried screen route files.
2. Route paths are unique.
3. Every route module has a default export.
4. Dynamic routes read route parameters.
5. Every route records authentication, expected initial render, parameters, backend dependency, known issue, migration action, and migration target.
6. TypeScript resolves and compiles all route modules.

| Route | Screen | Auth | Parameters | Backend dependency | Migration target |
|---|---|---|---|---|---|
| `/` | Welcome | public | - | Root guard decision | `/home (auth-aware)` |
| `/(auth)/login` | Login | public | - | Auth contract | `/(auth)/login` |
| `/(auth)/register` | Register | public | - | Auth contract | `/(auth)/register` |
| `/(tabs)/dashboard` | Dashboard | authenticated | - | Accounts/reports data | `/home` |
| `/(tabs)/ai` | AI Assistant | authenticated | - | AI endpoints | `/ai` |
| `/(tabs)/lending` | Lending hub | authenticated | - | Credit endpoints | `/credit` |
| `/analytics` | Analytics | authenticated | - | Reports endpoints | `/money/reports` |
| `/budgets` | Budget list | authenticated | - | Budgets | `/grow/budgets` |
| `/budgets/new` | New budget | authenticated | - | Budget create | `/grow/budgets/new` |
| `/budgets/[id]` | Budget detail | authenticated | `id` | Budget detail | `/grow/budgets/[id]` |
| `/budgets/[id]/edit` | Edit budget | authenticated | `id` | Budget update | `/grow/budgets/[id]/edit` |
| `/goals` | Goal list | authenticated | - | Goals | `/grow/goals` |
| `/goals/new` | New goal | authenticated | - | Goal create | `/grow/goals/new` |
| `/goals/[id]` | Goal detail | authenticated | `id` | Goal detail | `/grow/goals/[id]` |
| `/goals/[id]/edit` | Edit goal | authenticated | `id` | Goal update | `/grow/goals/[id]/edit` |
| `/investments` | Investments overview | authenticated | - | Portfolio endpoints | `/grow/portfolio` |
| `/investments/accounts` | Investment accounts | authenticated | - | Investment accounts | `/grow/investments/accounts` |
| `/investments/analytics` | Investment analytics | authenticated | - | Performance/allocation | `/grow/wealth-analytics` |
| `/investments/asset/[id]` | Asset detail | authenticated | `id` | Asset endpoint | `/grow/assets/[id]` |
| `/investments/holdings` | Holdings | authenticated | - | Holdings | `/grow/investments/holdings` |
| `/investments/transactions` | Investment transactions | authenticated | - | Investment transactions | `/grow/investments/transactions` |
| `/investments/watchlists` | Watchlists | authenticated | - | Watchlists | `/grow/investments/watchlists` |
| `/lending/products` | Loan products | authenticated | - | Loan products | `/credit/products` |
| `/lending/eligibility` | Eligibility | authenticated | - | Credit eligibility | `/credit/eligibility` |
| `/lending/application/new` | New application | authenticated | - | Product/application | `/credit/application` |
| `/lending/applications` | Applications | authenticated | - | Applications | `/credit/applications` |
| `/lending/my-loans` | My loans | authenticated | - | Loans | `/credit/loans` |
| `/lending/loan/[loanId]` | Loan detail | authenticated | `loanId` | Loan detail | `/credit/loans/[loanId]` |
| `/lending/loan/[loanId]/pay` | Loan payment | authenticated | `loanId` | Contract fix | `/credit/loans/[loanId]/pay` |
| `/notifications` | Notifications | authenticated | - | Notifications | `/notifications` |
| `/notifications/preferences` | Preferences | authenticated | - | Preferences | `/profile (settings section)` |
| `/notifications/[id]` | Notification detail | authenticated | `id` | Notification detail | `/notifications/[id]` |
| `/payments` | Payment history | authenticated | - | Payments | `/pay/history` |
| `/payments/new` | New payment | authenticated | - | Payment/transfer | `/pay/send` or `/pay/transfer` |
| `/payments/[id]` | Payment detail | authenticated | `id` | Payment detail | `/pay/history/[paymentId]` |

## 7. Authentication Behavior

- Unauthenticated user outside `(auth)`: root guard replaces the current route with `/(auth)/login`.
- Authenticated user inside `(auth)`: root guard replaces the current route with `/(tabs)/dashboard`.
- Startup calls `refreshAccessToken()` before treating the user as authenticated.
- Missing refresh token: auth state is cleared and login is shown.
- Invalid or expired refresh token: logout is called, tokens are cleared, and login is shown.
- Profile fetch failure does not invalidate an otherwise valid refreshed token.

Verification level: code inspection, static smoke assertions, API auth tests, and TypeScript. A device/emulator startup journey was not run.

## 8. API Environment Strategy

The mobile client now reads `EXPO_PUBLIC_API_URL`.

| Environment | Strategy |
|---|---|
| Development | Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`; copy `apps/mobile/.env.example`. |
| Android emulator | Use `http://10.0.2.2:3000/api/v1` when the API runs on the host loopback interface. |
| iOS simulator | Use `http://localhost:3000/api/v1` when the API runs on the host. |
| Physical device | Use the development machine's reachable LAN IPv4 and ensure firewall/network access. |
| Production | Set a verified HTTPS API URL through the Expo release environment. |

Validation:

- Empty or missing value fails.
- Non-HTTP(S) value fails.
- Trailing slashes are removed.
- No API URL remains hard-coded in mobile source.
- No server secret is embedded in the mobile app.

## 9. Token Storage Findings

- Refresh token: platform-aware SecureStore on native; AsyncStorage fallback on web.
- Access token before Wave 0: AsyncStorage.
- Access token after Wave 0: platform-aware SecureStore on native; AsyncStorage fallback on web.
- Legacy access token: migrated once from AsyncStorage to secure storage, then removed from AsyncStorage.
- Logout: calls the backend logout endpoint when both tokens exist, then clears both token locations.
- Expiration: access-token refresh occurs during startup; refresh-token expiry is enforced by the backend and triggers logout on refresh failure.
- Threat consideration: native token storage is now encrypted, but web remains browser storage by platform limitation.

## 10. Financial-Data Trust Findings

- Asset Detail no longer presents `$192.50` or `$190.30`.
- Asset Detail shows `اطلاعات قیمت در دسترس نیست`.
- No replacement price was invented.
- Budget deletion is confirmed before execution.
- Failed budget deletion does not navigate or appear successful.
- Payment submission remains disabled while in flight and uses a stable idempotency key.
- Loan payment uses the verified backend route and key.
- Backend investment services still use `MockMarketDataProvider`; this remains a financial-trust blocker for other investment values.

## 11. Payment Idempotency Findings

- Mobile generates a unique idempotency key per logical payment or loan-payment submission.
- The key persists across network retries for the same unchanged form.
- Changing the form resets the key because the request payload changes.
- The key is sent in the `idempotency-key` header.
- Backend reserves the key with a request hash.
- A completed duplicate returns the stored response without re-executing the payment.
- A pending duplicate returns a conflict.
- A failed key can be retried.
- Successful payments mark the key completed.
- Audit and notification behavior remains in the backend payment service.

## 12. Refresh / Invalidation Findings

Implemented:

- Payment history refetches on route focus after payment creation.
- Budget list refetches on route focus after create/edit/delete navigation.
- Goal list refetches on route focus after create/edit/progress navigation.
- Goal detail refetches immediately after verified progress.
- Loan detail refetches on route focus after loan payment.

Not implemented:

- A global query-cache invalidation architecture.
- Cross-domain refresh for account balances, transactions, reports, and portfolio after every financial mutation.

This is intentional for Wave 0; a broader cache strategy belongs to the later design-system/global-state work unless a specific stale-data defect is verified.

## 13. Tests Added

- `apps/mobile/tests/wave0-smoke.mjs`
  - 35-route inventory.
  - Route module/default-export checks.
  - Dynamic-parameter checks.
  - Loan, budget, goal, and payment contract checks.
  - API environment checks.
  - Mock-price regression check.
  - Auth root/refresh assertions.
  - Secure access-token assertions.
  - AI financial-tool Prisma boundary check.
- `apps/api/test/wave0-contracts.spec.ts`
  - Loan route/body/auth/idempotency contract.
  - Budget and goal DELETE contracts.
  - Payment idempotency-header contract.
  - Payment duplicate response behavior.
  - Loan ownership, rejection, success, and duplicate protection.
- Updated `apps/api/test/tool-manager.service.spec.ts` and `apps/api/test/ai-security.spec.ts` for the domain-service boundary.

## 14. Tests Executed

| Command | Result |
|---|---|
| `pnpm --filter @nova-bank/mobile test:wave0` | PASS — 35 routes and contract/trust checks |
| `pnpm --filter @nova-bank/mobile typecheck` | PASS |
| `pnpm --filter @nova-bank/mobile lint` | PASS — 0 errors, 38 pre-existing warnings |
| `pnpm --filter @nova-bank/api exec jest --runInBand` | PASS — 35 suites, 222 tests |
| `pnpm --filter @nova-bank/api typecheck` | PASS |
| `pnpm --filter @nova-bank/api build` | PASS |
| `pnpm --filter @nova-bank/api lint` | PASS — 0 errors, 421 pre-existing warnings |
| `pnpm --filter @nova-bank/api exec prisma validate --schema prisma/schema.prisma` | PASS |
| `pnpm --filter @nova-bank/api exec prisma generate --schema prisma/schema.prisma` | PASS |
| `git diff --check` | PASS |

## Wave 0.1 Runtime Verification

- **Platform:** Expo Web on Windows; Android/iOS runtimes were unavailable in this environment.
- **API:** `http://localhost:3000/api/v1` with PostgreSQL connected and schema in sync.
- **Auth journeys:** Unauthenticated startup, valid authenticated startup, valid refresh, invalid refresh, and logout were exercised end-to-end.
- **Runtime route smoke:** All 35 inventoried routes rendered without an immediate crash.
- **Live financial flows:** Payment creation and idempotency, loan payment and idempotency, budget deletion, and goal deletion were verified against the live database.
- **Asset Detail:** Explicit unavailable-price state was verified for current and previous price.
- **Refresh:** Payment, loan, budget, and goal lists reflected their latest mutations after navigation.
- **AI integration:** `GET /api/v1/ai/health` returned available.
- **Wave 0.1 fix:** Corrected Prisma multi-field `orderBy` usage in loan payment so live repayment succeeds.
- **Result:** `PASS — READY_FOR_WAVE_1`.

## 15. Remaining Blockers

1. None for Wave 0.1 closure.
2. Investment market-data continues to use `MockMarketDataProvider` and remains a product decision, not a Wave 0 blocker.

## 16. Exact Files Changed by Wave 0

1. `apps/mobile/.env.example`
2. `apps/mobile/package.json`
3. `apps/mobile/services/api.ts`
4. `apps/mobile/services/auth.ts`
5. `apps/mobile/services/lending.ts`
6. `apps/mobile/services/budgets.ts`
7. `apps/mobile/services/goals.ts`
8. `apps/mobile/services/payments.ts`
9. `apps/mobile/hooks/useLoans.ts`
10. `apps/mobile/hooks/useBudgets.ts`
11. `apps/mobile/hooks/useGoals.ts`
12. `apps/mobile/hooks/usePayments.ts`
13. `apps/mobile/app/budgets/[id].tsx`
14. `apps/mobile/app/budgets/index.tsx`
15. `apps/mobile/app/goals/[id].tsx`
16. `apps/mobile/app/goals/index.tsx`
17. `apps/mobile/app/payments/new.tsx`
18. `apps/mobile/app/payments/index.tsx`
19. `apps/mobile/app/lending/loan/[loanId]/index.tsx`
20. `apps/mobile/app/lending/loan/[loanId]/pay.tsx`
21. `apps/mobile/app/investments/asset/[id].tsx`
22. `apps/mobile/tests/routeInventory.json`
23. `apps/mobile/tests/wave0-smoke.mjs`
24. `apps/api/src/ai/tools/tool-manager.service.ts`
25. `apps/api/test/tool-manager.service.spec.ts`
26. `apps/api/test/ai-security.spec.ts`
27. `apps/api/test/wave0-contracts.spec.ts`
28. `docs/ux/NOVA_WAVE_0_VERIFICATION.md`

## 17. Exact Commits

None.

Reason: the repository contains unrelated pre-existing uncommitted changes, including changes in files touched by Wave 0. Creating whole-file commits would include unrelated user work.

## 18. Final Verification Status

**PASS — READY_FOR_WAVE_1.**

Runtime verification completed on the available Expo Web runtime, and all required Wave 0 checks passed.
