import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { getNotification, markAsRead } from '../../services/notifications';
import { useTranslation } from '../../hooks/useTranslation';
import { useEffect, useState } from 'react';

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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!notification) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600">{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-4">{notification.title}</Text>
      <Text className="text-base text-gray-700 mb-4">{notification.body}</Text>
      <Text className="text-sm text-gray-400">
        {new Date(notification.createdAt).toLocaleString('fa-IR')}
      </Text>
    </ScrollView>
  );
}