import { View, Text, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  GlassView,
  GlassButton,
  GlassListCard,
  GradientBackground,
  MoneyText,
  ScreenState,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { usePayments } from "../../hooks/usePayments";
import { fa } from "../../localization";
import { formatCurrency } from "../../utils/format";

export default function PaymentsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data: payments, isLoading, refetch } = usePayments(accessToken || "");

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <GlassView className="flex-row items-center justify-between p-4 mb-6">
            <Text className="text-2xl font-bold text-gray-900">{fa.payment.payments}</Text>
            <GlassButton size="sm" variant="ghost" onPress={() => router.push("/payments/new")}>
              {fa.payment.createPayment}
            </GlassButton>
          </GlassView>

          {payments.length === 0 ? (
            <ScreenState state="empty" message="هیچ پرداختی وجود ندارد" />
          ) : (
            payments.map((payment) => (
              <GlassListCard key={payment.id} className="p-4 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold text-gray-900">
                    {fa.payment[payment.type.toLowerCase() as keyof typeof fa.payment] ||
                      payment.type}
                  </Text>
                  <Text
                    className={`text-sm font-medium ${payment.status === "COMPLETED" ? "text-green-400" : payment.status === "FAILED" ? "text-red-400" : "text-yellow-400"}`}
                  >
                    {fa.payment[payment.status.toLowerCase() as keyof typeof fa.payment] ||
                      payment.status}
                  </Text>
                </View>
                <MoneyText size="md" className="mb-1">
                  {formatCurrency(payment.amount, payment.currency)}
                </MoneyText>
                <Text className="text-sm text-gray-600">
                  {payment.destinationName || payment.destinationValue}
                </Text>
                <Text className="text-xs text-gray-400 mt-2">
                  {new Date(payment.createdAt).toLocaleDateString("fa-IR")}
                </Text>
              </GlassListCard>
            ))
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
