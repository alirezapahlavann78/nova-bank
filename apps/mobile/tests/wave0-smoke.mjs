import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = path.join(mobileRoot, 'app');
const readMobileFile = (relativePath) =>
  fs.readFileSync(path.join(mobileRoot, relativePath), 'utf8');

const inventory = JSON.parse(fs.readFileSync(path.join(mobileRoot, 'tests/routeInventory.json'), 'utf8'));

function collectRouteFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectRouteFiles(fullPath, files);
    } else if (/\.(ts|tsx)$/.test(entry.name) && entry.name !== '_layout.ts' && entry.name !== '_layout.tsx') {
      files.push(path.relative(appRoot, fullPath).replaceAll(path.sep, '/'));
    }
  }
  return files;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Wave 0 smoke failure: ${message}`);
  }
}

assert(inventory.length === 35, `expected 35 routes, found ${inventory.length}`);
assert(new Set(inventory.map((route) => route.path)).size === 35, 'route paths must be unique');

const actualRouteFiles = collectRouteFiles(appRoot).sort();
const inventoryFiles = inventory.map((route) => route.file).sort();
assert(
  JSON.stringify(actualRouteFiles) === JSON.stringify(inventoryFiles),
  `route file inventory mismatch\nactual: ${actualRouteFiles.join(', ')}\nexpected: ${inventoryFiles.join(', ')}`,
);

for (const route of inventory) {
  const source = readMobileFile(path.posix.join('app', route.file));
  assert(/export\s+default/.test(source), `${route.path} must export a route module`);
  if (route.parameters.length > 0) {
    assert(source.includes('useLocalSearchParams'), `${route.path} must read dynamic parameters`);
  }
  assert(route.authentication === 'public' || route.authentication === 'authenticated', `${route.path} has an invalid auth requirement`);
  assert(Boolean(route.expectedRender), `${route.path} must define an expected initial render`);
  assert(Boolean(route.backendDependency), `${route.path} must define a backend dependency`);
  assert(Boolean(route.migrationTarget), `${route.path} must define a migration target`);
}

const apiSource = readMobileFile('services/api.ts');
const authSource = readMobileFile('services/auth.ts');
const lendingSource = readMobileFile('services/lending.ts');
const budgetsSource = readMobileFile('services/budgets.ts');
const goalsSource = readMobileFile('services/goals.ts');
const paymentsSource = readMobileFile('services/payments.ts');
const paymentScreenSource = readMobileFile('app/payments/new.tsx');
const loanPaymentScreenSource = readMobileFile('app/lending/loan/[loanId]/pay.tsx');
const assetDetailSource = readMobileFile('app/investments/asset/[id].tsx');
const rootLayoutSource = readMobileFile('app/_layout.tsx');
const useAuthSource = readMobileFile('hooks/useAuth.ts');
const toolManagerSource = fs.readFileSync(
  path.join(mobileRoot, '..', 'api/src/ai/tools/tool-manager.service.ts'),
  'utf8',
);

assert(apiSource.includes('process.env.EXPO_PUBLIC_API_URL'), 'API base URL must come from EXPO_PUBLIC_API_URL');
assert(!/https?:\/\/\d+\.\d+\.\d+\.\d+/.test(apiSource), 'API client must not contain a hard-coded IP URL');
assert(apiSource.includes('if (!apiUrl)'), 'missing API URL must fail validation');

assert(lendingSource.includes('`/loans/${loanId}/pay`'), 'loan payment must call /loans/{id}/pay');
assert(!lendingSource.includes('`/loans/${loanId}/payments`'), 'old loan payment endpoint must not remain');
assert(lendingSource.includes("'idempotency-key'"), 'loan payment must send an idempotency key header');

assert(budgetsSource.includes('deleteWithAuth<ApiResponse>(`/budgets/${id}`'), 'budget deletion must use DELETE /budgets/{id}');
assert(goalsSource.includes('deleteWithAuth<ApiResponse>(`/goals/${id}`'), 'goal deletion must use DELETE /goals/{id}');
assert(!budgetsSource.includes('postWithAuth<ApiResponse>(`/budgets/${id}`'), 'budget deletion must not use POST');
assert(!goalsSource.includes('postWithAuth<ApiResponse>(`/goals/${id}`'), 'goal deletion must not use POST');

assert(paymentsSource.includes("'idempotency-key'"), 'payment creation must send an idempotency key header');
assert(paymentsSource.includes('const { idempotencyKey, ...payment }'), 'idempotency key must not be sent in the payment body');
assert(paymentScreenSource.includes('idempotencyKeyRef'), 'payment screen must retain one key per logical submission');
assert(loanPaymentScreenSource.includes('idempotencyKeyRef'), 'loan payment screen must retain one key per logical submission');

assert(!assetDetailSource.includes('192.50') && !assetDetailSource.includes('190.30'), 'Asset Detail must not contain mock prices');
assert(assetDetailSource.includes('اطلاعات قیمت در دسترس نیست'), 'Asset Detail must show an explicit unavailable price state');

assert(rootLayoutSource.includes('if (!isAuthenticated && !inAuthGroup)'), 'root guard must protect unauthenticated routes');
assert(rootLayoutSource.includes('router.replace("/(auth)/login")'), 'unauthenticated users must reach login');
assert(rootLayoutSource.includes('else if (isAuthenticated && inAuthGroup)'), 'authenticated users must leave the auth group');
assert(useAuthSource.includes('await refreshAccessToken()'), 'startup must refresh the access token');
assert(useAuthSource.includes('clearAuth()'), 'invalid or missing refresh must clear auth state');

assert(authSource.includes('ACCESS_TOKEN_SECURE_KEY'), 'access token must use platform-aware secure storage');
assert(authSource.includes('ACCESS_TOKEN_LEGACY_KEY'), 'legacy access token migration must exist');
assert(!authSource.includes('AsyncStorage.setItem(ACCESS_TOKEN_MEMORY_KEY'), 'new access tokens must not be written to AsyncStorage on native');

assert(!toolManagerSource.includes('PrismaService') && !toolManagerSource.includes('this.prisma'), 'AI financial tools must not access Prisma directly');
assert(toolManagerSource.includes('CreditScoreService'), 'AI credit history must use a domain service');

const changedSources = [apiSource, authSource, lendingSource, budgetsSource, goalsSource, paymentsSource, rootLayoutSource, useAuthSource, toolManagerSource];
for (const source of changedSources) {
  assert(!source.includes('<<<<<<<') && !source.includes('>>>>>>>'), 'merge conflict marker found');
}

console.log(`Wave 0 smoke: PASS (${inventory.length} routes, contract and trust checks)`);
