import { View, ScrollView, Text } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  GlassView,
  GlassForm,
  GlassButton,
  GlassInput,
  GradientBackground,
} from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import { updateBudget } from "../../../services/budgets";
import { useTranslation } from "../../../hooks/useTranslation";

export default function EditBudgetScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!accessToken || !id) return;
    setLoading(true);
    try {
      await updateBudget(accessToken, id, { name, amount: Number(amount) });
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <GlassView className="p-4 mb-6">
            <Text className="text-xl font-bold text-gray-900 text-center">
              {t("budget.budget")}
            </Text>
          </GlassView>

          <GlassForm
            footer={
              <GlassButton onPress={handleSubmit} disabled={loading} variant="primary">
                {loading ? "در حال ذخیره..." : t("common.save")}
              </GlassButton>
            }
          >
            <GlassInput
              label={t("budget.name")}
              placeholder={t("budget.budget")}
              value={name}
              onChangeText={setName}
            />
            <GlassInput
              label={t("budget.amount")}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </GlassForm>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
