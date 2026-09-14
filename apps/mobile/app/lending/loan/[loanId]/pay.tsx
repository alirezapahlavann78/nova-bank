import { View, Text, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  GlassView,
  GlassForm,
  GlassButton,
  GlassInput,
  GradientBackground,
} from "../../../../components/ui";
import { useAuth } from "../../../../hooks/useAuth";
import { useMakeLoanPayment } from "../../../../hooks/useLoans";
import { fa } from "../../../../localization";
import { formatCurrency } from "../../../../utils/format";
import { createIdempotencyKey } from "../../../../services/api";

export default function LoanPaymentScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const { makePayment, isLoading } = useMakeLoanPayment(accessToken || "");
  const [amount, setAmount] = useState("");
  const idempotencyKeyRef = useRef<string | null>(null);

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  const handlePay = async () => {
    if (!amount) {
      Alert.alert(fa.common.error, "لطفاً مبلغ را وارد کنید");
      return;
    }

    const amountNum = parseInt(amount, 10);
    Alert.alert(
      "تایید پرداخت",
      `آیا مطمئن هستید می‌خواهید ${formatCurrency(amountNum)} پرداخت کنید؟`,
      [
        { text: fa.common.cancel, style: "cancel" },
        {
          text: fa.lending.makePayment,
          style: "default",
          onPress: async () => {
            try {
              idempotencyKeyRef.current ??= createIdempotencyKey("loan-payment");
              await makePayment(loanId, amountNum, idempotencyKeyRef.current);
              Alert.alert(fa.common.success, "پرداخت با موفقیت انجام شد", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err: any) {
              Alert.alert(fa.common.error, err.message || "خطا در پرداخت");
            }
          },
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <View className="flex-1 p-6">
        <GlassView className="p-4 mb-6">
          <Text className="text-2xl font-bold text-gray-900 text-center">
            {fa.lending.makePayment}
          </Text>
        </GlassView>

        <GlassForm
          footer={
            <GlassButton onPress={handlePay} disabled={isLoading} variant="primary">
              {isLoading ? "در حال پرداخت..." : fa.lending.makePayment}
            </GlassButton>
          }
        >
          <GlassInput
            label={fa.lending.loanAmount}
            placeholder="مثال: 5000000"
            value={amount}
            onChangeText={(value: string) => {
              idempotencyKeyRef.current = null;
              setAmount(value);
            }}
            keyboardType="numeric"
          />
        </GlassForm>
      </View>
    </GradientBackground>
  );
}
