import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  DataList,
  DataRow,
  GlassButton,
  GlassListCard,
  GradientBackground,
  MoneyText,
  ScreenHeader,
  ScreenState,
  StatusPill,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useLoans } from "../../hooks/useLoans";
import { useTheme } from "../../theme";
import { fa } from "../../localization";
import { formatCurrency, formatDate } from "../../utils/format";

const STATUS_TEXT: Record<string, string> = {
  APPROVED: fa.lending.approved,
  ACTIVE: fa.lending.active,
  COMPLETED: fa.lending.completed,
  DEFAULTED: fa.lending.defaulted,
  CANCELLED: "لغو شده",
};

const STATUS_TONE: Record<string, "neutral" | "info" | "positive" | "negative"> = {
  APPROVED: "info",
  ACTIVE: "positive",
  COMPLETED: "neutral",
  DEFAULTED: "negative",
  CANCELLED: "neutral",
};

export default function MyLoansScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data: loans, isLoading } = useLoans(accessToken || "");

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

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={fa.lending.myLoans}
          subtitle={`${loans.length} وام`}
          onBack={() => router.back()}
        />

        {loans.length === 0 ? (
          <ScreenState
            state="empty"
            message="شما هنوز وامی ندارید"
            action={fa.lending.newApplication}
            onAction={() => router.push("/lending/products")}
          />
        ) : (
          <View style={styles.list}>
            {loans.map((loan) => (
              <GlassListCard key={loan.id} level={2}>
                <View style={styles.header}>
                  <View style={styles.titleWrap}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                      {loan.product?.name || "وام"}
                    </Text>
                    <StatusPill
                      label={STATUS_TEXT[loan.status] || loan.status}
                      tone={STATUS_TONE[loan.status] || "neutral"}
                    />
                  </View>
                </View>

                <View style={styles.balanceBlock}>
                  <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
                    {fa.lending.remainingBalance}
                  </Text>
                  <MoneyText size="lg">
                    {formatCurrency(loan.remainingBalance, loan.currency)}
                  </MoneyText>
                </View>

                <DataList style={styles.data}>
                  <DataRow
                    label={fa.lending.principal}
                    value={
                      <MoneyText size="sm">
                        {formatCurrency(loan.principal, loan.currency)}
                      </MoneyText>
                    }
                  />
                  <DataRow
                    label={fa.lending.interestRate}
                    value={<MoneyText size="sm">{`${loan.interestRate}%`}</MoneyText>}
                  />
                  <DataRow
                    label={fa.lending.dueDate}
                    value={
                      <Text style={[styles.value, { color: theme.textPrimary }]}>
                        {formatDate(loan.maturityDate)}
                      </Text>
                    }
                  />
                </DataList>

                {loan.status === "ACTIVE" ? (
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onPress={() => router.push(`/lending/loan/${loan.id}/pay`)}
                  >
                    {fa.lending.makePayment}
                  </GlassButton>
                ) : null}
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  titleWrap: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 17, fontWeight: "800" },
  balanceBlock: { gap: 4, marginBottom: 14 },
  balanceLabel: { fontSize: 13 },
  data: { marginBottom: 12 },
  value: { fontSize: 13.5, fontWeight: "700" },
});
