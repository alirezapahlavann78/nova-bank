import { View, Text, ScrollView } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  GlassView,
  GlassButton,
  GlassListCard,
  GradientBackground,
  MoneyText,
  ScreenState,
} from "../../../../components/ui";
import { useAuth } from "../../../../hooks/useAuth";
import { useLoan } from "../../../../hooks/useLoans";
import { fa } from "../../../../localization";
import { formatCurrency, formatDate } from "../../../../utils/format";

export default function LoanDetailScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const { data: loan, isLoading, refetch } = useLoan(accessToken || "", loanId);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  if (isLoading || !loan) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={fa.common.loading} />
      </GradientBackground>
    );
  }

  const paidInstallments = loan.installments.filter((i) => i.status === "PAID");
  const progressPercent =
    loan.installments.length > 0 ? (paidInstallments.length / loan.installments.length) * 100 : 0;

  return (
    <GradientBackground>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <GlassView className="p-4 mb-6">
            <Text className="text-2xl font-bold text-gray-900 text-center">
              {loan.product?.name || "وام"}
            </Text>
            <Text className="text-gray-500 text-center mt-1">{loan.status}</Text>
          </GlassView>

          <GlassView className="p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">{fa.lending.remainingBalance}</Text>
              <MoneyText>{formatCurrency(loan.remainingBalance, loan.currency)}</MoneyText>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-500">{fa.lending.purpose}</Text>
              <Text className="text-sm text-gray-600 mt-1">{loan.application?.purpose || "-"}</Text>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm text-gray-500">{fa.lending.principal}</Text>
                <MoneyText size="md">{formatCurrency(loan.principal, loan.currency)}</MoneyText>
              </View>
              <View>
                <Text className="text-sm text-gray-500">{fa.lending.interestRate}</Text>
                <MoneyText size="md">{loan.interestRate}%</MoneyText>
              </View>
              <View>
                <Text className="text-sm text-gray-500">{fa.lending.totalPayable}</Text>
                <MoneyText size="md">{formatCurrency(loan.totalPayable, loan.currency)}</MoneyText>
              </View>
            </View>

            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm text-gray-500">پیشرفت بازپرداخت</Text>
                <Text className="text-sm text-gray-600">{Math.round(progressPercent)}%</Text>
              </View>
              <View className="w-full bg-gray-300/30 rounded-full h-2 overflow-hidden">
                <View
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </View>
            </View>

            <Text className="text-xs text-gray-500 mt-2">
              {fa.lending.dueDate}: {formatDate(loan.maturityDate)}
            </Text>
          </GlassView>

          <GlassView className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              {fa.lending.installment}
            </Text>
            {loan.installments.slice(0, 6).map((inst) => (
              <GlassListCard key={inst.id} className="mb-2">
                <View>
                  <Text className="font-semibold text-gray-900">#{inst.installmentNumber}</Text>
                  <Text className="text-sm text-gray-500">{formatDate(inst.dueDate)}</Text>
                </View>
                <View className="items-end">
                  <MoneyText size="sm">{formatCurrency(inst.totalAmount, loan.currency)}</MoneyText>
                  <Text
                    className={`text-xs ${
                      inst.status === "PAID"
                        ? "text-green-400"
                        : inst.status === "OVERDUE"
                          ? "text-red-400"
                          : inst.status === "PARTIALLY_PAID"
                            ? "text-yellow-400"
                            : "text-gray-400"
                    }`}
                  >
                    {inst.status === "PAID"
                      ? fa.lending.paid
                      : inst.status === "OVERDUE"
                        ? fa.lending.overdue
                        : inst.status === "PARTIALLY_PAID"
                          ? fa.lending.partial
                          : fa.lending.pending}
                  </Text>
                </View>
              </GlassListCard>
            ))}
            {loan.installments.length > 6 && (
              <Text className="text-center text-sm text-gray-500">
                +{loan.installments.length - 6} قسط دیگر
              </Text>
            )}
          </GlassView>

          {loan.status === "ACTIVE" && (
            <GlassView className="mb-6">
              <GlassButton
                onPress={() => router.push(`/lending/loan/${loanId}/pay` as any)}
                variant="primary"
              >
                {fa.lending.makePayment}
              </GlassButton>
            </GlassView>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
