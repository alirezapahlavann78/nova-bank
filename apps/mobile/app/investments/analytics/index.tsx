import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  DataList,
  DataRow,
  GlassCard,
  GlassListCard,
  GradientBackground,
  MoneyText,
  ProgressBar,
  ScreenHeader,
  ScreenState,
} from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import { useAssetAllocation, usePortfolioPerformance } from "../../../hooks/useInvestments";
import { useTheme } from "../../../theme";
import { fa } from "../../../localization";
import { formatCurrency } from "../../../utils/format";

export default function InvestmentAnalyticsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data: allocation, isLoading: loadingAllocation } = useAssetAllocation(accessToken || "");
  const { data: performance, isLoading: loadingPerformance } = usePortfolioPerformance(
    accessToken || "",
  );

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  if (loadingAllocation || loadingPerformance) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={fa.common.loading} />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={fa.investment.performance}
          subtitle="تحلیل تخصیص و بازدهی پرتفوی"
          onBack={() => router.back()}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {fa.investment.assetAllocation}
          </Text>
          <GlassCard>
            {allocation?.byAssetType?.length ? (
              <View style={styles.progressList}>
                {allocation.byAssetType.map((item) => (
                  <View key={item.assetType} style={styles.progressItem}>
                    <View style={styles.progressHeader}>
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {fa.investment.accountAllocation}
          </Text>
          <GlassCard>
            {allocation?.byAccount?.length ? (
              <DataList>
                {allocation.byAccount.map((item) => (
                  <DataRow
                    key={item.accountId}
                    label={item.accountId}
                    value={
                      <Text style={[styles.itemValue, { color: theme.textPrimary }]}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    }
                  />
                ))}
              </DataList>
            ) : (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {fa.investment.noHoldings}
              </Text>
            )}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {fa.investment.performance}
          </Text>
          {performance?.points?.length ? (
            <View style={styles.list}>
              {performance.points
                .slice(-7)
                .reverse()
                .map((point) => {
                  const isPositive = point.dailyChange >= 0;
                  return (
                    <GlassListCard key={point.date}>
                      <DataList>
                        <DataRow
                          label={point.date}
                          value={
                            <MoneyText size="sm">
                              {formatCurrency(point.totalValue, "USD")}
                            </MoneyText>
                          }
                        />
                        <DataRow
                          label="بازدهی تجمعی"
                          value={
                            <MoneyText
                              size="sm"
                              tone={isPositive ? "positive" : "negative"}
                            >
                              {`${point.cumulativeReturn.toFixed(2)}%`}
                            </MoneyText>
                          }
                        />
                      </DataList>
                    </GlassListCard>
                  );
                })}
            </View>
          ) : (
            <GlassCard style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {fa.investment.noHoldings}
              </Text>
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  progressList: { gap: 16 },
  progressItem: { gap: 8 },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  list: { gap: 12 },
  itemTitle: { fontSize: 15, fontWeight: "700" },
  itemValue: { fontSize: 13.5, fontWeight: "700" },
  emptyCard: { alignItems: "center", paddingVertical: 26 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
