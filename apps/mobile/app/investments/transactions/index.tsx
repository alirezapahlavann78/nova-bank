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
import { useInvestmentTransactions } from "../../../hooks/useInvestments";
import { useTheme } from "../../../theme";
import { fa } from "../../../localization";
import { formatCurrency, formatJalaliDate } from "../../../utils/format";

const POSITIVE_TYPES = new Set(["BUY", "DEPOSIT", "DIVIDEND", "INTEREST"]);
const NEGATIVE_TYPES = new Set(["SELL", "WITHDRAWAL", "FEE"]);

const TYPE_LABELS: Record<string, string> = {
  BUY: "خرید",
  SELL: "فروش",
  DEPOSIT: "واریز",
  WITHDRAWAL: "برداشت",
  DIVIDEND: "سود سهام",
  INTEREST: "بهره",
  FEE: "کارمزد",
};

export default function InvestmentTransactionsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data, isLoading, error } = useInvestmentTransactions(accessToken || "");

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

  const transactions = data?.data || [];

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={fa.investment.transactions}
          subtitle={`${transactions.length} تراکنش`}
          onBack={() => router.back()}
        />

        {transactions.length === 0 ? (
          <ScreenState state="empty" message={fa.investment.noTransactions} />
        ) : (
          <View style={styles.list}>
            {transactions.map((transaction) => {
              const tone = POSITIVE_TYPES.has(transaction.transactionType)
                ? "positive"
                : NEGATIVE_TYPES.has(transaction.transactionType)
                  ? "negative"
                  : "neutral";

              return (
                <GlassListCard key={transaction.id} level={2}>
                  <View style={styles.header}>
                    <View style={styles.titleWrap}>
                      <Text style={[styles.title, { color: theme.textPrimary }]}>
                        {transaction.asset?.symbol || TYPE_LABELS[transaction.transactionType] || transaction.transactionType}
                      </Text>
                      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {formatJalaliDate(transaction.transactionDate)}
                      </Text>
                    </View>
                    <MoneyText
                      size="sm"
                      tone={tone === "positive" ? "positive" : tone === "negative" ? "negative" : "default"}
                    >
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </MoneyText>
                  </View>

                  <DataList>
                    <DataRow
                      label="نوع تراکنش"
                      value={
                        <StatusPill
                          label={TYPE_LABELS[transaction.transactionType] || transaction.transactionType}
                          tone={tone}
                        />
                      }
                    />
                    {transaction.quantity ? (
                      <DataRow
                        label={fa.investment.quantity}
                        value={
                          <Text style={[styles.value, { color: theme.textPrimary }]}>
                            {transaction.quantity}
                          </Text>
                        }
                      />
                    ) : null}
                    {transaction.price ? (
                      <DataRow
                        label="قیمت واحد"
                        value={
                          <MoneyText size="sm">
                            {formatCurrency(transaction.price, transaction.currency)}
                          </MoneyText>
                        }
                      />
                    ) : null}
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
  value: { fontSize: 13.5, fontWeight: "700" },
});
