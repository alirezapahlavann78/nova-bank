import { View, Text, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  GlassView,
  GlassButton,
  GradientBackground,
  MoneyText,
  ScreenState,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useGoal } from "../../hooks/useGoals";
import { addGoalProgress } from "../../services/goals";
import { useTranslation } from "../../hooks/useTranslation";

export default function GoalDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { data: goal, isLoading, error, refetch } = useGoal(accessToken || "", id || "");
  const router = useRouter();

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={t("common.loading")} />
      </GradientBackground>
    );
  }

  if (error || !goal) {
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
            <Text className="text-2xl font-bold text-gray-900 text-center">{goal.name}</Text>
          </GlassView>

          <GlassView className="p-4 mb-3">
            <Text className="text-gray-600 mb-1">{t("goal.target")}</Text>
            <MoneyText>{goal.targetAmount}</MoneyText>
          </GlassView>

          <GlassView className="p-4 mb-3">
            <Text className="text-gray-600 mb-1">{t("goal.progress")}</Text>
            <MoneyText>{goal.currentAmount}</MoneyText>
          </GlassView>

          <GlassView className="p-4 mb-3">
            <Text className="text-gray-600 mb-1">{t("goal.remaining")}</Text>
            <MoneyText>{goal.remaining}</MoneyText>
          </GlassView>

          <GlassView className="p-4 mb-6">
            <Text className="text-gray-600 mb-1">{t("goal.progress")} %</Text>
            <Text
              className={`text-2xl font-bold ${goal.isCompleted ? "text-green-400" : "text-blue-400"}`}
            >
              {Math.round(goal.percentageComplete)}%
            </Text>
          </GlassView>

          <View className="flex-row gap-3">
            <GlassButton
              onPress={() => router.push(`/goals/${id}/edit`)}
              variant="secondary"
              className="flex-1"
            >
              {t("common.edit")}
            </GlassButton>
            <GlassButton
              onPress={async () => {
                if (!accessToken || !id) return;
                try {
                  await addGoalProgress(accessToken, id, 1000);
                  await refetch();
                } catch {
                  // Keep the previously verified goal amount if progress fails.
                }
              }}
              variant="primary"
              className="flex-1"
            >
              {t("goal.progress")}
            </GlassButton>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
