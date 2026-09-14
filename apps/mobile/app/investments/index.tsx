import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  GradientBackground,
  GlassCard,
  GlassListCard,
  GlassActionTile,
  DataList,
  DataRow,
  ProgressBar,
  MoneyText,
  ScreenHeader,
  ScreenState,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../theme";
import {
  usePortfolioOverview,
  useInvestmentAccounts,
  useAssetAllocation,
} from "../../hooks/useInvestments";
import { fa } from "../../localization";
import { formatCurrency } from "../../utils/format";

export default function InvestmentDashboardScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolioOverview(accessToken || "");
  const { data: accounts, isLoading: loadingAccounts } = useInvestmentAccounts(accessToken || "");
  const { data: allocation, isLoading: loadingAllocation } = useAssetAllocation(accessToken || "");

  const isLoading = loadingPortfolio || loadingAccounts || loadingAllocation;

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={fa.common.loading} />
      </GradientBackground>
    );
  }

  const totalValue = portfolio?.totalPortfolioValue ?? 0;
  const returnPercentage = portfolio?.returnPercentage ?? 0;
  const invested = portfolio?.totalInvestedCapital ?? 0;
  const cash = portfolio?.totalCashBalance ?? 0;
  const unrealizedPL = portfolio?.totalUnrealizedPL ?? 0;
  const isPositiveReturn = returnPercentage >= 0;

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={fa.investment.dashboard}
          subtitle={fa.investment.totalValue}
          onBack={() => router.back()}
        />

        <GlassCard style={styles.hero}>
          <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>
            {fa.investment.totalValue}
          </Text>
          <MoneyText size="xl" style={styles.heroValue}>
            {formatCurrency(totalValue, "USD")}
          </MoneyText>
          <View style={styles.heroChange}>
            <Text
              style={[
                styles.heroChangeValue,
                { color: isPositiveReturn ? theme.success : theme.danger },
              ]}
            >
              {isPositiveReturn ? "+" : ""}
              {returnPercentage.toFixed(2)}%
            </Text>
            <Text style={[styles.heroChangeCaption, { color: theme.textSecondary }]}>
              {unrealizedPL >= 0 ? "+" : ""}
              {formatCurrency(unrealizedPL, "USD")} {fa.investment.today}
            </Text>
          </View>

          <DataList style={styles.heroData}>
            <DataRow
              label={fa.investment.totalInvested}
              value={<MoneyText size="sm">{formatCurrency(invested, "USD")}</MoneyText>}
            />
            <DataRow
              label={fa.investment.cash}
              value={<MoneyText size="sm">{formatCurrency(cash, "USD")}</MoneyText>}
            />
            <DataRow
              label={fa.investment.return}
              value={
                <MoneyText size="sm" tone={isPositiveReturn ? "positive" : "negative"}>
                  {`${returnPercentage.toFixed(1)}%`}
                </MoneyText>
              }
            />
          </DataList>
        </GlassCard>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {fa.investment.accounts}
          </Text>
          {accounts?.data?.length ? (
            <View style={styles.list}>
              {accounts.data.map((account) => (
                <GlassListCard key={account.id}>
                  <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                    {account.brokerName || fa.investment.accounts}
                  </Text>
                  <DataList>
                    <DataRow
                      label="نوع حساب"
                      value={
                        <Text style={[styles.itemValue, { color: theme.textSecondary }]}>
                          {account.accountType}
                        </Text>
                      }
                    />
                    <DataRow
                      label="ارزش کل"
                      value={
                        <MoneyText size="sm">
                          {formatCurrency(account.totalValue, account.baseCurrency)}
                        </MoneyText>
                      }
                    />
                  </DataList>
                </GlassListCard>
              ))}
            </View>
          ) : (
            <GlassCard style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {fa.investment.noHoldings}
              </Text>
            </GlassCard>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {fa.investment.assetAllocation}
          </Text>
          <GlassCard>
            {allocation?.byAssetType?.length ? (
              <View style={styles.allocationList}>
                {allocation.byAssetType.map((item) => (
                  <View key={item.assetType} style={styles.allocationItem}>
                    <View style={styles.allocationHeader}>
                      <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                        {item.assetType}
                      </Text>
                      <Text style={[styles.itemValue, { color: theme.textSecondary }]}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    <ProgressBar progress={item.percentage} />
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {fa.investment.noHoldings}
              </Text>
            )}
          </GlassCard>
        </View>

        <View style={styles.actions}>
          <GlassActionTile
            title={fa.investment.holdings}
            icon="cube"
            onPress={() => router.push("/investments/holdings")}
          />
          <GlassActionTile
            title={fa.investment.watchlists}
            icon="star"
            onPress={() => router.push("/investments/watchlists")}
          />
          <GlassActionTile
            title={fa.investment.transactions}
            icon="swap-horizontal"
            onPress={() => router.push("/investments/transactions")}
          />
          <GlassActionTile
            title="تحلیل پرتفوی"
            icon="analytics"
            onPress={() => router.push("/investments/analytics")}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  hero: { gap: 6 },
  heroLabel: { fontSize: 13.5, fontWeight: "600" },
  heroValue: { fontSize: 32 },
  heroChange: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  heroChangeValue: { fontSize: 18, fontWeight: "800" },
  heroChangeCaption: { fontSize: 13 },
  heroData: { marginTop: 18 },
  section: { marginTop: 26 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  list: { gap: 12 },
  itemTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  itemValue: { fontSize: 13.5, fontWeight: "600" },
  emptyCard: { alignItems: "center", paddingVertical: 28 },
  emptyText: { fontSize: 14, textAlign: "center" },
  allocationList: { gap: 16 },
  allocationItem: { gap: 8 },
  allocationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 30 },
});
