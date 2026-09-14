import { Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { GlassListCard, GradientBackground, ScreenState } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { getNotification, markAsRead } from "../../services/notifications";
import { useTranslation } from "../../hooks/useTranslation";
import { useEffect, useState } from "react";

export default function NotificationDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const [notification, setNotification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !id) return;
    getNotification(accessToken, id)
      .then((data) => {
        setNotification(data);
        if (!data.isRead) {
          markAsRead(accessToken, id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [accessToken, id]);

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" />
      </GradientBackground>
    );
  }

  if (!notification) {
    return (
      <GradientBackground>
        <ScreenState state="error" title={t("common.error")} />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <GlassListCard>
          <Text className="text-2xl font-bold text-gray-900 mb-4">{notification.title}</Text>
          <Text className="text-base text-gray-700 mb-4">{notification.body}</Text>
          <Text className="text-sm text-gray-400">
            {new Date(notification.createdAt).toLocaleString("fa-IR")}
          </Text>
        </GlassListCard>
      </ScrollView>
    </GradientBackground>
  );
}
