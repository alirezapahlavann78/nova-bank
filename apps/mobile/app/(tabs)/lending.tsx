import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  GlassView,
  GlassActionTile,
  GradientBackground,
  MoneyText,
  ScreenState,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useCreditScore, useFinancialHealth } from "../../hooks/useCredit";
import { fa } from "../../localization";
import { formatCurrency } from "../../utils/format";

export default function LendingDashboardScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data: creditScore, isLoading: scoreLoading } = useCreditScore(accessToken || "");
  const { data: health, isLoading: healthLoading } = useFinancialHealth(accessToken || "");

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  const isLoading = scoreLoading || healthLoading;

  const getScoreColor = (band: string) => {
    const colors: Record<string, string> = {
      POOR: "text-red-600",
      FAIR: "text-orange-500",
      GOOD: "text-yellow-500",
      VERY_GOOD: "text-green-500",
      EXCELLENT: "text-blue-600",
    };
    return colors[band] || "text-gray-600";
  };

  return (
    <GradientBackground>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      >
        <View>
          <GlassView className="p-4 mb-4">
            <Text className="text-2xl font-bold text-gray-900">{fa.lending.lending}</Text>
          </GlassView>

          {isLoading ? (
            <ScreenState state="loading" title={fa.common.loading} />
          ) : (
            <>
              <GlassView className="p-6 mb-6">
                <Text className="text-sm text-gray-500 mb-1">{fa.lending.creditScore}</Text>
                {creditScore ? (
                  <>
                    <View className="flex-row items-end mb-2">
                      <Text className={`text-4xl font-bold ${getScoreColor(creditScore.band)}`}>
                        {creditScore.score}
                      </Text>
                      <Text className="text-lg text-gray-500 mb-1.5 ml-2">{creditScore.band}</Text>
                    </View>
                    {creditScore.previousScore && (
                      <Text className="text-sm text-gray-500">
                        {fa.lending.previousScore}: {creditScore.previousScore}
                      </Text>
                    )}
                    {creditScore.reasons.length > 0 && (
                      <Text className="text-xs text-gray-400 mt-2">
                        دلایل: {creditScore.reasons.join(", ")}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text className="text-gray-400">امتیاز اعتباری در دسترس نیست</Text>
                )}
              </GlassView>

              <GlassView className="p-6 mb-6">
                <Text className="text-sm text-gray-500 mb-1">{fa.lending.financialHealth}</Text>
                {health ? (
                  <>
                    <MoneyText className="mb-2">{formatCurrency(health.totalActiveDebt)}</MoneyText>
                    <Text className="text-sm text-gray-500">
                      {health.activeLoanCount} {fa.lending.loans} {fa.lending.active}
                    </Text>
                  </>
                ) : (
                  <Text className="text-gray-400">اطلاعات مالی در دسترس نیست</Text>
                )}
              </GlassView>

              <View style={styles.actionRow}>
                <GlassActionTile
                  icon="layers-outline"
                  onPress={() => router.push("/lending/products")}
                  title={fa.lending.loanProducts}
                  subtitle="محصولات وام"
                />
                <GlassActionTile
                  icon="documents-outline"
                  onPress={() => router.push("/lending/applications")}
                  title={fa.lending.loanApplications}
                  subtitle="درخواست‌ها"
                />
              </View>
              <View style={styles.actionRow}>
                <GlassActionTile
                  icon="wallet-outline"
                  onPress={() => router.push("/lending/my-loans")}
                  title={fa.lending.myLoans}
                  subtitle="وام‌های من"
                />
                <GlassActionTile
                  icon="checkmark-circle-outline"
                  onPress={() => router.push("/lending/eligibility")}
                  title={fa.lending.checkEligibility}
                  subtitle="بررسی صلاحیت"
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
});
