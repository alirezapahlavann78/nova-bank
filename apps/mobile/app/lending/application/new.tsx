import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  DataList,
  DataRow,
  GlassCard,
  GlassForm,
  GlassButton,
  GlassInput,
  GradientBackground,
  MoneyText,
  ScreenHeader,
  ScreenState,
} from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import {
  createLoanApplication,
  getLoanProduct,
  LoanProductResponse,
} from "../../../services/lending";
import { useTheme } from "../../../theme";
import { fa } from "../../../localization";
import { formatCurrency } from "../../../utils/format";

export default function NewLoanApplicationScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<LoanProductResponse | null>(null);
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(Boolean(productId));

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  if (!productId) {
    router.replace("/lending/products");
    return null;
  }

  useEffect(() => {
    if (productId && accessToken) {
      getLoanProduct(accessToken, productId)
        .then(setProduct)
        .catch(() => setProduct(null))
        .finally(() => setProductLoading(false));
    }
  }, [productId, accessToken]);

  const handleSubmit = async () => {
    if (!product || !amount || !duration) {
      Alert.alert(fa.common.error, "لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    const requestedAmount = Number(amount);
    const requestedDuration = Number(duration);

    if (requestedAmount < product.minAmount || requestedAmount > product.maxAmount) {
      Alert.alert(
        fa.common.error,
        `مبلغ باید بین ${formatCurrency(product.minAmount, product.currency)} و ${formatCurrency(
          product.maxAmount,
          product.currency,
        )} باشد`,
      );
      return;
    }

    setIsLoading(true);
    try {
      await createLoanApplication(accessToken, {
        loanProductId: productId,
        requestedAmount,
        durationMonths: requestedDuration,
        purpose: purpose.trim() || undefined,
      });
      Alert.alert(fa.common.success, "درخواست وام با موفقیت ثبت شد", [
        { text: "OK", onPress: () => router.push("/lending/applications") },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطا در ثبت درخواست";
      Alert.alert(fa.common.error, message);
    } finally {
      setIsLoading(false);
    }
  };

  if (productLoading || !product) {
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
          title={fa.lending.newApplication}
          subtitle={product.name}
          onBack={() => router.back()}
        />

        <GlassCard style={styles.productCard}>
          <DataList>
            <DataRow
              label={fa.lending.loanAmount}
              value={
                <MoneyText size="sm">
                  {`${formatCurrency(product.minAmount, product.currency)} - ${formatCurrency(
                    product.maxAmount,
                    product.currency,
                  )}`}
                </MoneyText>
              }
            />
            <DataRow
              label={fa.lending.interestRate}
              value={<MoneyText size="sm">{`${product.interestRate}%`}</MoneyText>}
            />
            <DataRow
              label={fa.lending.duration}
              value={
                <Text style={[styles.value, { color: theme.textPrimary }]}>
                  {product.durationMonths} ماه
                </Text>
              }
            />
          </DataList>
        </GlassCard>

        <GlassForm
          footer={
            <GlassButton onPress={handleSubmit} disabled={isLoading} variant="primary">
              {isLoading ? "در حال ثبت..." : fa.lending.createApplication}
            </GlassButton>
          }
        >
          <GlassInput
            label={fa.lending.loanAmount}
            placeholder="مثال: 50,000,000"
            value={amount}
            onChangeText={(value: string) => setAmount(value.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
          />
          <GlassInput
            label={`${fa.lending.duration} (ماه)`}
            placeholder={String(product.durationMonths)}
            value={duration}
            onChangeText={(value: string) => setDuration(value.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
          />
          <GlassInput
            label="هدف از وام"
            placeholder="اختیاری"
            value={purpose}
            onChangeText={setPurpose}
          />
        </GlassForm>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  productCard: { marginBottom: 16 },
  value: { fontSize: 13.5, fontWeight: "700" },
});
