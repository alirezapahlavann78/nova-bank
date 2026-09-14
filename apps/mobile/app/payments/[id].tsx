import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  GlassView,
  GlassButton,
  GradientBackground,
  MoneyText,
  ScreenState,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { usePayment } from "../../hooks/usePayments";
import { cancelPayment } from "../../services/payments";
import { fa } from "../../localization";
import { formatCurrency } from "../../utils/format";

export default function PaymentDetailScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: payment, isLoading, refetch } = usePayment(accessToken || "", id || "");

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  if (isLoading || !payment) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={fa.common.loading} />
      </GradientBackground>
    );
  }

  const handleCancel = async () => {
    Alert.alert(fa.payment.cancelPayment, "آیا مطمئن هستید که می‌خواهید این پرداخت را لغو کنید؟", [
      { text: "انصراف", style: "cancel" },
      {
        text: "لغو",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelPayment(accessToken, payment.id);
            await refetch();
          } catch (error) {
            Alert.alert("خطا", error instanceof Error ? error.message : "خطای نامعلوم");
          }
        },
      },
    ]);
  };

  const statusColor = {
    COMPLETED: "text-green-400",
    FAILED: "text-red-400",
    PENDING: "text-yellow-400",
    PROCESSING: "text-blue-400",
    CANCELLED: "text-gray-400",
    REVERSED: "text-purple-400",
  };

  return (
    <GradientBackground>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <GlassView className="p-6 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-medium text-gray-500">{fa.payment.type}</Text>
              <Text
                className={`text-sm font-medium ${statusColor[payment.status as keyof typeof statusColor] || "text-gray-400"}`}
              >
                {fa.payment[payment.status.toLowerCase() as keyof typeof fa.payment] ||
                  payment.status}
              </Text>
            </View>

            <MoneyText size="xl" className="mb-4">
              {formatCurrency(payment.amount, payment.currency)}
            </MoneyText>

            <Text className="text-sm text-gray-500 mb-1">{fa.payment.destinationName}</Text>
            <Text className="text-lg text-gray-900 mb-4">
              {payment.destinationName || payment.destinationValue}
            </Text>

            {payment.description ? (
              <>
                <Text className="text-sm text-gray-500 mb-1">{fa.common.description}</Text>
                <Text className="text-gray-700 mb-4">{payment.description}</Text>
              </>
            ) : null}

            {payment.fees > 0 ? (
              <View className="flex-row justify-between py-2 border-t border-gray-300/30">
                <Text className="text-gray-500">{fa.payment.fees}</Text>
                <MoneyText size="sm">{formatCurrency(payment.fees, payment.currency)}</MoneyText>
              </View>
            ) : null}

            {payment.internalReference ? (
              <View className="flex-row justify-between py-2 border-t border-gray-300/30">
                <Text className="text-gray-500">شماره مرجع</Text>
                <Text className="text-gray-900 font-mono">{payment.internalReference}</Text>
              </View>
            ) : null}

            {payment.riskLevel ? (
              <View className="flex-row justify-between py-2 border-t border-gray-300/30">
                <Text className="text-gray-500">سطح ریسک</Text>
                <Text
                  className={`font-medium ${payment.riskLevel === "HIGH" ? "text-red-400" : payment.riskLevel === "MEDIUM" ? "text-yellow-400" : "text-green-400"}`}
                >
                  {payment.riskLevel === "HIGH"
                    ? "بالا"
                    : payment.riskLevel === "MEDIUM"
                      ? "متوسط"
                      : "پایین"}
                </Text>
              </View>
            ) : null}

            {payment.executedAt ? (
              <View className="flex-row justify-between py-2 border-t border-gray-300/30">
                <Text className="text-gray-500">تاریخ اجرا</Text>
                <Text className="text-gray-900">
                  {new Date(payment.executedAt).toLocaleDateString("fa-IR")}
                </Text>
              </View>
            ) : null}
          </GlassView>

          {payment.status === "COMPLETED" && (
            <GlassButton onPress={handleCancel} variant="ghost" className="mt-2">
              {fa.payment.cancelPayment}
            </GlassButton>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
