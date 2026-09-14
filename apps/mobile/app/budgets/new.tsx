import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  GlassForm,
  GlassButton,
  GlassInput,
  GradientBackground,
  ScreenHeader,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { createBudget } from "../../services/budgets";
import { useTheme } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";

const PERIODS = [
  { value: "WEEKLY", label: "هفتگی", days: 7 },
  { value: "MONTHLY", label: "ماهانه", days: 30 },
  { value: "YEARLY", label: "سالانه", days: 365 },
];

export default function NewBudgetScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("MONTHLY");
  const [loading, setLoading] = useState(false);

  const selectedPeriod = PERIODS.find((item) => item.value === period) ?? PERIODS[1];

  const handleSubmit = async () => {
    if (!accessToken) return;
    if (!name.trim() || !amount) {
      Alert.alert(t("common.error"), "نام و مبلغ بودجه را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      await createBudget(accessToken, {
        name: name.trim(),
        amount: Number(amount),
        period,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + selectedPeriod.days * 24 * 60 * 60 * 1000).toISOString(),
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert(t("common.error"), "ثبت بودجه انجام نشد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="بودجه جدید"
          subtitle="مصرف خود را کنترل کنید"
          onBack={() => router.back()}
        />

        <GlassForm
          footer={
            <GlassButton onPress={handleSubmit} disabled={loading} variant="primary">
              {loading ? "در حال ذخیره..." : t("common.save")}
            </GlassButton>
          }
        >
          <GlassInput
            label={t("budget.name")}
            placeholder="مثلاً خرید ماهانه"
            value={name}
            onChangeText={setName}
          />
          <GlassInput
            label={t("budget.amount")}
            placeholder="0"
            value={amount}
            onChangeText={(value: string) => setAmount(value.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
          />

          <View style={styles.periodSection}>
            <Text style={[styles.periodLabel, { color: theme.textSecondary }]}>
              {t("budget.period")}
            </Text>
            <View style={styles.periodOptions}>
              {PERIODS.map((item) => {
                const selected = item.value === period;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setPeriod(item.value)}
                    style={[
                      styles.periodButton,
                      {
                        borderColor: selected ? theme.tint : theme.glassBorder,
                        backgroundColor: selected ? `${theme.tint}22` : theme.inputFill,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        { color: selected ? theme.tint : theme.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </GlassForm>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  periodSection: { gap: 8 },
  periodLabel: { fontSize: 13, fontWeight: "600", marginStart: 4 },
  periodOptions: { flexDirection: "row", gap: 8 },
  periodButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodText: { fontSize: 13.5, fontWeight: "700" },
});
