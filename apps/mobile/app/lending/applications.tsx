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
import { useLoanApplications } from "../../hooks/useLoanApplications";
import { useTheme } from "../../theme";
import { fa } from "../../localization";
import { formatCurrency, formatDate } from "../../utils/format";

const STATUS_TEXT: Record<string, string> = {
  DRAFT: fa.lending.draft,
  SUBMITTED: fa.lending.submitted,
  UNDER_REVIEW: fa.lending.underReview,
  APPROVED: fa.lending.approved,
  REJECTED: fa.lending.rejected,
  CANCELLED: "لغو شده",
};

const STATUS_TONE: Record<string, "neutral" | "info" | "warning" | "positive" | "negative"> = {
  DRAFT: "neutral",
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  APPROVED: "positive",
  REJECTED: "negative",
  CANCELLED: "neutral",
};

export default function LoanApplicationsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data: applications, isLoading } = useLoanApplications(accessToken || "");

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
          title={fa.lending.loanApplications}
          subtitle={`${applications.length} درخواست ثبت‌شده`}
          onBack={() => router.back()}
          right={
            <GlassButton size="sm" variant="ghost" onPress={() => router.push("/lending/products")}>
              جدید
            </GlassButton>
          }
        />

        {applications.length === 0 ? (
          <ScreenState
            state="empty"
            message="هیچ درخواست وامی وجود ندارد"
            action={fa.lending.newApplication}
            onAction={() => router.push("/lending/products")}
          />
        ) : (
          <View style={styles.list}>
            {applications.map((application) => (
              <GlassListCard key={application.id} level={2}>
                <View style={styles.header}>
                  <View style={styles.titleWrap}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                      {application.loanProduct?.name || "وام"}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                      {formatDate(application.createdAt)}
                    </Text>
                  </View>
                  <StatusPill
                    label={STATUS_TEXT[application.status] || application.status}
                    tone={STATUS_TONE[application.status] || "neutral"}
                  />
                </View>

                <DataList>
                  <DataRow
                    label="مبلغ درخواستی"
                    value={
                      <MoneyText size="sm">
                        {formatCurrency(application.requestedAmount, application.currency)}
                      </MoneyText>
                    }
                  />
                  <DataRow
                    label={fa.lending.duration}
                    value={
                      <Text style={[styles.value, { color: theme.textPrimary }]}>
                        {application.durationMonths} ماه
                      </Text>
                    }
                  />
                  <DataRow
                    label={fa.lending.interestRate}
                    value={
                      <MoneyText size="sm">
                        {`${application.loanProduct?.interestRate ?? 0}%`}
                      </MoneyText>
                    }
                  />
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
