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
  StatusPill,
} from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import { useInvestmentAccounts } from "../../../hooks/useInvestments";
import { useTheme } from "../../../theme";
import { fa } from "../../../localization";
import { formatCurrency } from "../../../utils/format";

export default function InvestmentAccountsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data, isLoading, error } = useInvestmentAccounts(accessToken || "");

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

  const accounts = data?.data || [];

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={fa.investment.accounts}
          subtitle={`${accounts.length} حساب سرمایه‌گذاری`}
          onBack={() => router.back()}
        />

        {accounts.length === 0 ? (
          <ScreenState state="empty" message={fa.investment.noHoldings} />
        ) : (
          <View style={styles.list}>
            {accounts.map((account) => (
              <GlassListCard key={account.id} level={2}>
                <View style={styles.header}>
                  <View style={styles.titleWrap}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                      {account.brokerName || "حساب سرمایه‌گذاری"}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                      {account.accountType}
                    </Text>
                  </View>
                  <StatusPill label={account.status} tone="info" />
                </View>

                <DataList>
                  <DataRow
                    label="ارزش کل"
                    value={
                      <MoneyText size="sm">
                        {formatCurrency(account.totalValue, account.baseCurrency)}
                      </MoneyText>
                    }
                  />
                  <DataRow
                    label={fa.investment.cashBalance}
                    value={
                      <MoneyText size="sm">
                        {formatCurrency(account.cashBalance, account.baseCurrency)}
                      </MoneyText>
                    }
                  />
                  {account.accountNumber ? (
                    <DataRow
                      label={fa.investment.accountNumber}
                      value={
                        <Text style={[styles.value, { color: theme.textPrimary }]}>
                          {account.accountNumber}
                        </Text>
                      }
                    />
                  ) : null}
                </DataList>
              </GlassListCard>
            ))}
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
  value: { fontSize: 13.5, fontWeight: "700" },
});
