import { Alert, View, Text, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  GlassView,
  GlassButton,
  GradientBackground,
  MoneyText,
  ScreenState,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useBudget } from "../../hooks/useBudgets";
import { deleteBudget } from "../../services/budgets";
import { useTranslation } from "../../hooks/useTranslation";

export default function BudgetDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { data: budget, isLoading, error } = useBudget(accessToken || "", id || "");
  const router = useRouter();

  const handleDelete = () => {
    Alert.alert(t("common.delete"), "آیا از حذف این بودجه مطمئن هستید؟", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (!accessToken || !id) return;
          try {
            await deleteBudget(accessToken, id);
            router.back();
          } catch {
            Alert.alert(t("common.error"), "حذف بودجه انجام نشد");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={t("common.loading")} />
      </GradientBackground>
    );
  }

  if (error || !budget) {
    return (
      <GradientBackground>
        <ScreenState state="error" title={t("common.error")} />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <GlassView className="p-4 mb-6">
            <Text className="text-2xl font-bold text-gray-900 text-center">{budget.name}</Text>
          </GlassView>

          <GlassView className="p-4 mb-3">
            <Text className="text-gray-600 mb-1">{t("budget.amount")}</Text>
            <MoneyText>{budget.amount}</MoneyText>
          </GlassView>

          <GlassView className="p-4 mb-3">
            <Text className="text-gray-600 mb-1">{t("budget.spent")}</Text>
            <MoneyText>{budget.spent}</MoneyText>
          </GlassView>

          <GlassView className="p-4 mb-3">
            <Text className="text-gray-600 mb-1">{t("budget.remaining")}</Text>
            <MoneyText>{budget.remaining}</MoneyText>
          </GlassView>

          <GlassView className="p-4 mb-6">
            <Text className="text-gray-600 mb-1">{t("budget.amount")} %</Text>
            <Text
              className={`text-2xl font-bold ${budget.exceeded ? "text-red-400" : "text-green-400"}`}
            >
              {Math.round(budget.percentageUsed)}%
            </Text>
          </GlassView>

          <View className="flex-row gap-3">
            <GlassButton
              onPress={() => router.push(`/budgets/${id}/edit`)}
              variant="secondary"
              className="flex-1"
            >
              {t("common.edit")}
            </GlassButton>
            <GlassButton
              onPress={handleDelete}
              variant="ghost"
              className="flex-1"
            >
              {t("common.delete")}
            </GlassButton>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
