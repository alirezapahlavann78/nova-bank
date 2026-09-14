import { View, Text, ScrollView, Switch } from "react-native";
import { GlassListCard, GradientBackground, ScreenState } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useNotificationPreferences } from "../../hooks/useNotificationPreferences";
import { useTranslation } from "../../hooks/useTranslation";

export default function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const {
    data: preferences,
    isLoading,
    error,
    update,
  } = useNotificationPreferences(accessToken || "");

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" />
      </GradientBackground>
    );
  }

  if (error || !preferences) {
    return (
      <GradientBackground>
        <ScreenState state="error" title={t("common.error")} />
      </GradientBackground>
    );
  }

  const toggle = async (key: string, value: boolean) => {
    await update({ [key]: value });
  };

  return (
    <GradientBackground>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          {t("notification.notificationSettings")}
        </Text>

        <GlassListCard className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-gray-900">{t("notification.budgetAlerts")}</Text>
            <Switch
              value={preferences.budgetAlerts}
              onValueChange={(val) => toggle("budgetAlerts", val)}
            />
          </View>
        </GlassListCard>

        <GlassListCard className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-gray-900">{t("notification.goalAlerts")}</Text>
            <Switch
              value={preferences.goalAlerts}
              onValueChange={(val) => toggle("goalAlerts", val)}
            />
          </View>
        </GlassListCard>

        <GlassListCard className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-gray-900">
              {t("notification.transactionNotifications")}
            </Text>
            <Switch
              value={preferences.transactionAlerts}
              onValueChange={(val) => toggle("transactionAlerts", val)}
            />
          </View>
        </GlassListCard>

        <GlassListCard className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-gray-900">
              {t("notification.transferNotifications")}
            </Text>
            <Switch
              value={preferences.transferAlerts}
              onValueChange={(val) => toggle("transferAlerts", val)}
            />
          </View>
        </GlassListCard>

        <GlassListCard className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-gray-900">{t("notification.systemNotifications")}</Text>
            <Switch
              value={preferences.systemAlerts}
              onValueChange={(val) => toggle("systemAlerts", val)}
            />
          </View>
        </GlassListCard>

        <GlassListCard className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-gray-900">{t("notification.pushNotifications")}</Text>
            <Switch
              value={preferences.pushEnabled}
              onValueChange={(val) => toggle("pushEnabled", val)}
            />
          </View>
        </GlassListCard>
      </ScrollView>
    </GradientBackground>
  );
}
