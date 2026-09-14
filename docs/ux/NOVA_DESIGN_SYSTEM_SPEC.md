# Nova Design System Specification

**Stage:** Wave 1 — Foundation implemented  
**Source of truth:** `apps/mobile/theme/design-tokens.ts`  
**Implementation status:** Canonical tokens, surfaces, controls, state primitives, and the Nova page shell are implemented. Full screen migration remains scoped to later waves.

## 0. Wave 1 Implementation Map

- **Canonical tokens:** `apps/mobile/theme/design-tokens.ts` defines spacing, radius, typography, icon sizes, and layout constants. Existing screens continue to read theme values through `apps/mobile/theme/index.ts`.
- **Canonical component root:** `apps/mobile/components/ui/nova/` is the implementation home; `apps/mobile/components/ui/index.ts` is the single mobile UI entrypoint.
- **Implemented primitives:** `NovaIcon`, `Typography`, `BaseSurface`, `ElevatedSurface`, `CardSurface`, `InteractiveSurface`, `GlassSurface`, `CriticalSurface`, `ListSurface`, `Button`, `IconButton`, `Input`, `MoneyAmount`, `MoneyText`, `StatusBadge`, `StatusPill`, `ProgressBar`, state primitives, `NovaPage`, `PageHeader`, `PageBackground`, `FormSection`, `ReviewSummary`, `ConfirmationSheet`, and `SectionHeader`.
- **Compatibility layer:** legacy `GlassButton`, `GlassIconButton`, `GlassListCard`, `GlassForm`, `SectionTitle`, and `ScreenHeader` names remain available through `nova/compat.tsx`.
- **Legacy wrappers:** `PrimaryButton`, `SecondaryButton`, `GlassCard`, `GlassInput`, `SectionHeader`, and `StatCard` now delegate to canonical Nova primitives without forcing a full screen migration.
- **RTL and accessibility:** the page header, inputs, buttons, progress, states, and financial values expose localized labels and accessible roles; financial text uses tabular numerals and preserves LTR numeric direction.
- **Glass restriction:** `GlassSurface` remains an accent material. Dense lists, forms, critical confirmations, errors, and offline states use solid `CardSurface` or `CriticalSurface`.
- **Scope boundary:** navigation architecture, Home, section screens, and large-scale page rewrites are intentionally not changed in Wave 1.

## 1. Product UX Principles

1. **Trust first:** financial values, states, and consequences must never be ambiguous.
2. **Clarity before decoration:** glass, gradients, and motion may never reduce readability.
3. **One screen, one primary job:** every page has one dominant task or question.
4. **Action-first finance:** core actions are reachable in one tap from their domain.
5. **Entity-centric UX:** accounts, cards, transactions, payments, goals, assets, loans, and applications behave as coherent entities.
6. **Progressive disclosure:** technical banking details appear in review/detail contexts, not primary labels.
7. **Contextual AI:** AI explains, analyzes, recommends, and proposes actions; it never directly mutates financial records.
8. **Real RTL:** Persian-first layout is structural, not a mirror of an LTR design.
9. **Consistent states:** every data page defines initial, loading, success, empty, error, refreshing, offline, and partial/stale behavior.
10. **Maximum task depth:** common tasks require approximately three or fewer navigation levels.
11. **No decorative complexity:** every visual choice must improve understanding, action, confidence, or restrained delight.

## 2. Color System

### 2.1 Semantic Tokens

Screens must consume semantic tokens only. Screen-level hex values are prohibited.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `color/background/base` | `#F5F7FB` | `#070B1A` | App canvas |
| `color/background/ambient` | `#EEF2FF` | `#0B1226` | Subtle ambient layer |
| `color/surface/base` | `#FFFFFF` | `#0F172A` | Lists, forms, dense data |
| `color/surface/elevated` | `#FFFFFF` | `#16213B` | Cards, sheets, dialogs |
| `color/surface/secondary` | `#F8FAFC` | `#1E293B` | Nested groups, metadata |
| `color/surface/disabled` | `#EEF2F7` | `#243044` | Disabled controls |
| `color/primary` | `#4F46E5` | `#8B93FF` | Primary action and focus |
| `color/primary/pressed` | `#4338CA` | `#7C84F2` | Pressed primary |
| `color/secondary` | `#0D9488` | `#2DD4BF` | Secondary action |
| `color/accent` | `#7C3AED` | `#A78BFA` | Selected/analytical emphasis |
| `color/text/primary` | `#0B1020` | `#F8FAFC` | Main text |
| `color/text/secondary` | `#475569` | `#CBD5E1` | Supporting text |
| `color/text/muted` | `#64748B` | `#94A3B8` | Metadata |
| `color/text/onPrimary` | `#FFFFFF` | `#0B1020` | Text on primary |
| `color/border/subtle` | `rgba(15,23,42,0.08)` | `rgba(255,255,255,0.10)` | Hairlines |
| `color/border/strong` | `rgba(15,23,42,0.16)` | `rgba(255,255,255,0.22)` | Inputs, focused containers |
| `color/divider` | `rgba(15,23,42,0.08)` | `rgba(255,255,255,0.08)` | List/group dividers |
| `color/status/success` | `#10B981` | `#34D399` | Positive completed state |
| `color/status/warning` | `#F59E0B` | `#FBBF24` | Attention/pending |
| `color/status/danger` | `#EF4444` | `#F87171` | Failure/overdue |
| `color/status/info` | `#2563EB` | `#60A5FA` | Neutral process information |
| `color/financial/positive` | `#059669` | `#34D399` | Gain, income, credit |
| `color/financial/negative` | `#DC2626` | `#F87171` | Loss, expense, debit |
| `color/financial/pending` | `#D97706` | `#FBBF24` | Pending/unavailable |

### 2.2 Color Rules

- Do not use raw status colors for decorative accents.
- Positive/negative financial meaning is semantic and must not be inferred only from green/red.
- Every financial value has a sign or explicit state label.
- Disabled state uses token colors and never changes financial meaning.
- Dark mode is mandatory; no screen may define a private palette.

## 3. Typography

Font family: **Vazirmatn**.

| Style | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| `display` | 34 | 800 | 42 | Home primary balance |
| `largeTitle` | 28 | 800 | 36 | Page hero titles |
| `title` | 22 | 800 | 30 | Page titles |
| `sectionTitle` | 18 | 700 | 26 | Section headers |
| `body` | 15 | 400 | 24 | Default text |
| `bodyMedium` | 15 | 500 | 24 | Emphasized body |
| `caption` | 12.5 | 400 | 18 | Metadata |
| `label` | 13 | 600 | 18 | Field labels |
| `button` | 15 | 700 | 20 | Buttons |
| `financialNumber` | 16 | 700 | 22 | List amounts |
| `financialNumberLarge` | 28 | 800 | 34 | Summary amounts |

### Numeric Rules

- Amounts use tabular numerals and remain LTR inside RTL text.
- Persian digits are used for counts and local narrative text.
- Financial amounts, symbols, card numbers, IBAN, phone numbers, and references remain semantically LTR.
- Currency symbol/unit appears consistently after the formatted amount according to the display dictionary.
- Negative signs precede the numeric value and are never hidden.
- Unavailable data renders `—` with an accessible label, never `0`.

## 4. Spacing

Canonical scale: `2, 4, 8, 12, 16, 20, 24, 32, 40, 48`.

| Context | Value |
|---|---:|
| Page horizontal padding | 20 |
| Header bottom | 12 |
| Section vertical rhythm | 24 |
| Card internal padding | 16 |
| List row gap | 12 |
| Form field gap | 18 |
| Footer action gap | 16 |
| Bottom scroll padding | 48 plus safe area |

Arbitrary margins/paddings outside this scale are prohibited.

## 5. Radii

| Token | Value | Usage |
|---|---:|---|
| `radius/sm` | 10 | Chips, badges |
| `radius/md` | 14 | Inputs, small buttons |
| `radius/lg` | 18 | Rows, tiles |
| `radius/card` | 22 | Cards |
| `radius/sheet` | 28 | Sheets/modals |
| `radius/pill` | 999 | Filter chips, status pills |

## 6. Surfaces

| Surface | Purpose | Allowed use | Prohibited use |
|---|---|---|---|
| `BaseSurface` | Readable content foundation | Lists, tables, forms, detail pages | Decoration |
| `ElevatedSurface` | Floating content | Sheets, dialogs, sticky actions | Long scroll backgrounds |
| `CardSurface` | Grouped entity cards | Account, transaction, loan summaries | Nested cards more than two levels |
| `InteractiveSurface` | Pressable entity/action | Buttons, action tiles, rows with actions | Static information |
| `GlassSurface` | Selective premium/transient material | Tab bar, floating controls, AI insights, hero overlays | Dense lists, forms, errors, critical numbers |
| `CriticalSurface` | High-stakes information | Confirmations, security, errors, financial summaries | Decorative effects |

### Glass Rules

Glass is allowed for floating navigation, floating action controls, AI insight surfaces, verified-contrast premium hero moments, transient overlays, and ambient decorative layers.

Glass must not dominate transaction lists, dense tables, loan/credit details, payment confirmation, security screens, forms, error/offline states, or long scrolling content.

## 7. Elevation

| Level | Shadow | Usage |
|---:|---|---|
| 0 | none | Flat list/content |
| 1 | subtle bottom hairline | Nested rows |
| 2 | soft shadow | Cards |
| 3 | medium shadow | Sheets/modals |
| 4 | strong shadow | Floating tab bar/action |

Shadows are restrained, never colored for decoration, and must not replace borders where a border conveys structure.

## 8. Iconography

- Family: Ionicons.
- Sizes: `14`, `18`, `22`, `24`, `28`.
- Action icons are paired with text unless the icon is universally understood and accessible.
- Navigation back uses `chevron-forward` in RTL.
- Directional icons flip by semantic direction, not blindly.
- Financial increase/decrease icons are paired with signed values.
- Status icons never replace status text.
- Minimum touch target is 44×44.

## 9. Motion

| Interaction | Motion | Duration |
|---|---|---:|
| Button press | Scale 1 → 0.98 | 100ms |
| Sheet presentation | Slide up + fade | 220ms |
| Sheet dismiss | Slide down + fade | 180ms |
| Loading | Spinner/skeleton only | continuous |
| Success | Check fade/scale | 180ms |
| Error | Banner slide/fade | 180ms |
| Financial state change | Crossfade only | 160ms |
| Screen transition | Platform default | N/A |

Do not animate balances on every render. Do not use decorative looping animation around critical financial data.

## 10. Canonical Component System

### 10.1 Component Contract

Every canonical component must define purpose, use and do-not-use rules, variants and sizes, states, required and optional props, data contract, RTL behavior, accessibility behavior, interaction behavior, loading/error behavior, dark-mode behavior, and glass compatibility.

### 10.2 Canonical Components

| Component | Purpose | Variants/sizes | Required props | States | Accessibility / RTL | Do not use |
|---|---|---|---|---|---|---|
| `NovaPage` | Page shell | standard/form/detail | children, title | loading/empty/error | full-width, safe-area, RTL | Nested page |
| `PageHeader` | Page identity/back | compact/large | title, onBack | default/action | 44px back target, RTL back icon | Multiple headers |
| `SectionHeader` | Section label/action | default/compact | title | default | heading semantics | Hero replacement |
| `MoneyAmount` | Financial value | sm/md/lg/xl | value, currency | unavailable | LTR tabular number | Raw Text |
| `BalanceSummary` | Money position | standard/compact | primary amount | loading/unavailable | RTL label, LTR amount | Decorative hero |
| `AccountCard` | Account entity | standard/compact | name, balance | loading | row semantics | Card management |
| `BankCard` | Payment card | standard/mini | masked number, status | loading/disabled | masked accessible label | Revealing PAN/CVV |
| `TransactionRow` | Transaction discovery | standard/dense | title, amount, date, status | loading | signed amount | Dense unreadable row |
| `TransactionDetail` | Transaction facts | standard | transaction data | loading/error | definition list | Endpoint dump |
| `PaymentRow` | Payment entity | standard/dense | title, amount, status | loading | localized status | Raw enum |
| `PaymentDetail` | Payment facts/actions | standard | payment data | loading/error | destructive confirmation | Unconfirmed mutation |
| `ActionTile` | Domain action | 2-col/full | title, icon | default/disabled | button role | Dashboard overload |
| `QuickAction` | Primary action | sm/md | label, action | default/disabled | 44px target | Secondary actions |
| `StatusBadge` | Localized state | neutral/info/success/warning/danger | status | default | exposes localized text | Color-only state |
| `CategoryChip` | Spending category | sm/md | name | default | RTL text | Unverified category |
| `FilterChip` | List filter | single/multi | label, selected | default/selected | option semantics | Complex filters |
| `TagChip` | User tag | sm | label | default | RTL text | Until backend verified |
| `SearchField` | Search input | standard | value, onChangeText | idle/typing | search role | Results surface |
| `FormField` | Field wrapper | standard | label, children | idle/error/disabled | error association | Random spacing |
| `GlassInput` | Text control | md/lg | value, onChangeText | idle/focus/error/disabled | 44px height, RTL label | Glass on critical forms |
| `PrimaryButton` | Main action | sm/md/lg | label, onPress | default/pressed/loading/disabled | button role | Destructive action |
| `SecondaryButton` | Secondary action | sm/md/lg | label, onPress | default/pressed/disabled | button role | Competing primary |
| `TertiaryButton` | Low emphasis | sm/md | label, onPress | default/disabled | button role | Critical mutation |
| `IconButton` | Compact action | sm/md/lg | icon, onPress | default/disabled | accessible label | Ambiguous icon |
| `BottomSheet` | Filters/selection | standard | title, children | open/closing | focus containment | Complex workflow |
| `ConfirmationSheet` | Confirm action | standard/destructive | title, message, confirm | idle/processing | destructive semantics | Ordinary navigation |
| `ReviewSummary` | Mutation review | payment/loan/goal | structured data | loading | definition list | Hidden fees |
| `DataList` | Fact grouping | standard | children | loading | list semantics | Endpoint dump |
| `DataRow` | Label/value | standard | label, value | unavailable | RTL label, LTR technical value | Arbitrary alignment |
| `EmptyState` | No data | standard | message | default | text semantics | Fake data |
| `ErrorState` | Failure | standard/critical | message, retry | default | polite/assertive announcement | Blame user |
| `OfflineState` | Offline | standard | retry | default | network announcement | Fake success |
| `LoadingState` | Page loading | standard | title | default | loading announcement | Fake delay |
| `Skeleton` | Content loading | row/card/list | layout | loading | hidden from a11y tree | Perceived delay |
| `ProgressBar` | Numeric progress | sm/md | progress | unavailable | value text | Decorative filler |
| `ProgressCard` | Goal/budget | standard | title, progress | loading | progress semantics | Unclear scale |
| `GoalCard` | Goal entity | standard | name, target, current | loading | progress semantics | Fake progress |
| `BudgetCard` | Budget entity | standard | name, spent, limit | loading/exceeded | warning semantics | Ambiguous exceeded state |
| `PortfolioCard` | Portfolio summary | standard | total, return | loading/unavailable | LTR return values | Fake prices |
| `HoldingRow` | Holding entity | standard | symbol, value, P/L | loading | signed return | Raw asset IDs |
| `CreditScoreCard` | Score summary | standard | score, band | loading | score range announced | Generic gauge |
| `FinancialHealthCard` | Health summary | standard | score/debt/utilization | loading | grouped semantics | Merging with eligibility |
| `LoanCard` | Loan summary | standard | product, balance, status | loading | localized status | Raw enum |
| `InstallmentRow` | Installment entity | standard | number, date, amount, status | loading/paid/overdue | clear due date | Hidden remaining |
| `AIInsightCard` | Contextual insight | info/recommendation | title, body | loading | AI attribution | Fake prediction |
| `AIMessage` | Chat message | user/assistant/system | role, content | streaming/error | conversational semantics | Direct mutation claim |
| `AIActionCard` | Proposed action | informational/mutating | action, confirmation level | idle/processing | confirmation required | Silent mutation |
| `SuccessState` | Completed action | standard | title, next action | default | success announcement | Fake completion |
| `ErrorBanner` | Inline failure | standard | message | default | polite alert | Blocking recovery |
| `NotificationRow` | Notification entity | standard/unread | title, date, read state | loading | unread semantics | Hidden action |

Canonical component count: **50**.

### 10.3 Component Migration

| Current concept | Target | Decision |
|---|---|---|
| `GlassView` | `CardSurface` | Replace |
| `GlassCard` | `CardSurface` | Replace |
| `GlassListCard` | `BaseSurface` list group | Replace |
| `Glass.tsx GlassInput` | `GlassInput` | Remove duplicate |
| `GlassButton` | Primary/Secondary/Tertiary button | Split |
| `PrimaryButton` | Canonical `PrimaryButton` | Refactor |
| `SecondaryButton` | Canonical `SecondaryButton` | Refactor |
| `SectionHeader` | Canonical `SectionHeader` | Refactor |
| `SectionTitle` | `SectionHeader` | Merge |
| `ScreenState` | Loading/Empty/Error/Offline states | Split |
| One-off status styles | `StatusBadge` | Replace |
| Local progress bars | `ProgressBar` | Replace |
| Local amount text | `MoneyAmount` | Replace |

## 11. Global Layout

Canonical page order:

1. `PageHeader`.
2. Optional summary/context.
3. Primary content.
4. Secondary content.
5. Contextual actions.
6. Bottom action area only when required.

Rules:

- Respect safe areas.
- Horizontal content padding is 20.
- Maximum content width on tablet/web is 720.
- Forms use keyboard-avoiding behavior and sticky primary action.
- Lists use pull-to-refresh where backend supports refresh.
- Bottom sheets do not cover the tab bar unexpectedly.
- Floating actions reserve bottom safe-area spacing.

## 12. Screen Type Rules

| Type | Primary job | Layout rule |
|---|---|---|
| COMMAND | Orient and route | Summary first, actions second, recents third |
| LIST | Discover entities | Search/filter first, rows second, pagination last |
| DETAIL | Understand one entity | Identity, status, facts, related actions |
| ACTION | Create/change | Grouped form, review, confirm |
| DECISION | Choose between options | Clear options, consequences, next action |

## 13. State Rules

Every important page supports initial, loading, success, empty, error, refreshing, offline, and partial/stale states.

Every mutation workflow supports idle, editing, review, confirmation, processing, success, failure, and retry.

Never show fake financial data while loading. Use skeleton or explicit unavailable state.

## 14. RTL Rules

- Page structure is RTL by default.
- Persian labels use natural Persian phrasing.
- Back icon points right.
- Progress bars fill right-to-left unless a chart has an independent time axis.
- Financial numbers, technical dates, card numbers, IBAN, phone numbers, and references remain LTR.
- Use logical spacing properties: `marginStart`, `marginEnd`, `paddingStart`, `paddingEnd`.
- Mixed Persian/English entity names wrap with RTL direction; technical identifiers use isolated LTR runs.
- API enums map to Persian labels before display.

## 15. Accessibility

- Minimum touch target: 44×44.
- Buttons use accessible role and label.
- Inputs expose label, required state, error text, and keyboard type.
- Loading regions announce "در حال بارگذاری".
- Errors announce politely; critical errors assertively.
- Financial changes include value and state in the accessible label.
- Charts have text summaries.
- Color is never the sole status signal.
- Dynamic type must not truncate critical amounts; allow wrapping and reserved space.
- Contrast minimum: 4.5:1 for text, 3:1 for large text and UI boundaries.

## 16. Financial Trust Rules

- Amount, currency, sign, and state are always explicit.
- Pending/failed/unavailable values are never shown as completed values.
- Never use fake market prices or fabricated portfolio values.
- Destructive and financial mutations require review and confirmation.
- Reference IDs are copyable and remain LTR.
- Dates use consistent Jalali display unless an explicit technical mode is needed.
- Negative and positive signs do not depend on color alone.
- Backend unavailable means unavailable, not zero.

## 17. Design Anti-Patterns

Do not:

- Put glass behind dense financial data.
- Add random gradients or giant decorative cards.
- Show hard-coded market prices.
- Overload Home with cards.
- Expose Paya/Satna/IBAN/provider state-machine terminology as primary UX.
- Use modals for ordinary navigation.
- Use bottom sheets for complete transfers or loan applications.
- Keep multiple versions of the same component.
- Use arbitrary colors, spacing, or typography.
- Expose English API enums to users.
- Use fake loading, fake data, or static financial information.
- Create screen-per-endpoint UX.
- Let AI mutate records without domain-service confirmation.
- Use dark patterns or inaccessible controls.
- Break RTL or mirror charts incorrectly.
