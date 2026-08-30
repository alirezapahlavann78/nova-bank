import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useTranslation } from '../../hooks/useTranslation';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { data: notifications, isLoading, error } = useNotifications(accessToken || '');
  const router = useRouter();

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'BUDGET_WARNING':
      case 'BUDGET_EXCEEDED':
        return '⚠️';
      case 'GOAL_MILESTONE':
      case 'GOAL_COMPLETED':
        return '🎯';
      case 'TRANSACTION_CREATED':
        return '💰';
      case 'TRANSFER_COMPLETED':
        return '🔄';
      case 'SYSTEM':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600">{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500">{t('notification.notifications')} {t('common.loading').toLowerCase()}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className={`bg-white rounded-xl p-4 mb-3 shadow-sm ${!item.isRead ? 'border-l-4 border-blue-500' : ''}`}
            onPress={() => router.push(`/notifications/${item.id}`)}
          >
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">{renderNotificationIcon(item.type)}</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
                <Text className="text-sm text-gray-600 mt-1">{item.body}</Text>
                <Text className="text-xs text-gray-400 mt-2">
                  {new Date(item.createdAt).toLocaleString('fa-IR')}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}