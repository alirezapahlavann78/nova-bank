import { View, Text, FlatList } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  GlassIconButton,
  GlassListCard,
  GradientBackground,
  ScreenState,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useGoals } from "../../hooks/useGoals";
import { useTranslation } from "../../hooks/useTranslation";

export default function GoalsScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { data: goals, isLoading, error, refetch } = useGoals(accessToken || "");
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={t("common.loading")} />
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <ScreenState state="error" title={t("common.error")} />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        ListEmptyComponent={<ScreenState state="empty" message={t("goal.goal")} />}
        renderItem={({ item }) => (
          <GlassListCard className="mb-3">
            <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-600">
                {t("goal.target")}: {item.targetAmount}
              </Text>
              <Text
                className={`font-semibold ${item.isCompleted ? "text-green-400" : "text-blue-400"}`}
              >
                {Math.round(item.percentageComplete)}%
              </Text>
            </View>
          </GlassListCard>
        )}
      />
      <GlassIconButton
        icon="add"
        size={56}
        className="absolute bottom-6 right-6"
        onPress={() => router.push("/goals/new")}
      />
    </GradientBackground>
  );
}
