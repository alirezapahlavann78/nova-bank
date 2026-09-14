import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  DataList,
  DataRow,
  GlassListCard,
  GradientBackground,
  MoneyText,
  ScreenHeader,
  ScreenState,
} from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import { useHoldings } from "../../../hooks/useInvestments";
import { useTheme } from "../../../theme";
import { fa } from "../../../localization";
import { formatCurrency } from "../../../utils/format";

export default function HoldingsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data, isLoading, error } = useHoldings(accessToken || "");

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

  if (error) {
    return (
      <GradientBackground>
        <ScreenState state="error" title={fa.common.error} message={error.message} />
      </GradientBackground>
    );
  }

  const holdings = data?.data || [];

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={fa.investment.holdings}
          subtitle={`${holdings.length} دارایی`}
          onBack={() => router.back()}
        />

        {holdings.length === 0 ? (
          <ScreenState state="empty" message={fa.investment.noHoldings} />
        ) : (
          <View style={styles.list}>
            {holdings.map((holding) => {
              const currency = holding.asset.currency || "USD";
              const isPositivePL = holding.pl >= 0;

              return (
                <GlassListCard key={holding.id} level={2}>
                  <View style={styles.header}>
                    <View style={styles.titleWrap}>
                      <Text style={[styles.title, { color: theme.textPrimary }]}>
                        {holding.asset.symbol}
                      </Text>
                      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {holding.asset.name}
                      </Text>
                    </View>
                    <View style={styles.valueBlock}>
                      <MoneyText size="sm">
                        {formatCurrency(holding.marketValue, currency)}
                      </MoneyText>
                      <Text
                        style={[
                          styles.change,
                          { color: isPositivePL ? theme.success : theme.danger },
                        ]}
                      >
                        {isPositivePL ? "+" : ""}
                        {holding.plPercentage.toFixed(2)}%
                      </Text>
                    </View>
                  </View>

                  <DataList style={styles.data}>
                    <DataRow
                      label={fa.investment.quantity}
                      value={
                        <Text style={[styles.value, { color: theme.textPrimary }]}>
                          {holding.quantity}
                        </Text>
                      }
                    />
                    <DataRow
                      label={fa.investment.averagePrice}
                      value={
                        <MoneyText size="sm">
                          {formatCurrency(holding.averagePrice, currency)}
                        </MoneyText>
                      }
                    />
                    <DataRow
                      label={fa.investment.currentPrice}
                      value={
                        holding.currentPrice ? (
                          <MoneyText size="sm">
                            {formatCurrency(holding.currentPrice, currency)}
                          </MoneyText>
                        ) : (
                          <Text style={[styles.value, { color: theme.textSecondary }]}>-</Text>
                        )
                      }
                    />
                  </DataList>
                </GlassListCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  list: { gap: 14 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  titleWrap: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: "800" },
  subtitle: { fontSize: 13 },
  valueBlock: { alignItems: "flex-end", gap: 3 },
  change: { fontSize: 13, fontWeight: "700" },
  data: { gap: 10 },
  value: { fontSize: 13.5, fontWeight: "700" },
});
