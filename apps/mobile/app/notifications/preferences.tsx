import { View, Text, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { useTranslation } from '../../hooks/useTranslation';

export default function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { data: preferences, isLoading, error, update } = useNotificationPreferences(accessToken || '');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !preferences) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600">{t('common.error')}</Text>
      </View>
    );
  }

  const toggle = async (key: string, value: boolean) => {
    await update({ [key]: value });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6">{t('notification.notificationSettings')}</Text>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-gray-900">{t('notification.budgetAlerts')}</Text>
          <Switch value={preferences.budgetAlerts} onValueChange={(val) => toggle('budgetAlerts', val)} />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-gray-900">{t('notification.goalAlerts')}</Text>
          <Switch value={preferences.goalAlerts} onValueChange={(val) => toggle('goalAlerts', val)} />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-gray-900">{t('notification.transactionNotifications')}</Text>
          <Switch value={preferences.transactionAlerts} onValueChange={(val) => toggle('transactionAlerts', val)} />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-gray-900">{t('notification.transferNotifications')}</Text>
          <Switch value={preferences.transferAlerts} onValueChange={(val) => toggle('transferAlerts', val)} />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-gray-900">{t('notification.systemNotifications')}</Text>
          <Switch value={preferences.systemAlerts} onValueChange={(val) => toggle('systemAlerts', val)} />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-gray-900">{t('notification.pushNotifications')}</Text>
          <Switch value={preferences.pushEnabled} onValueChange={(val) => toggle('pushEnabled', val)} />
        </View>
      </View>
    </ScrollView>
  );
}