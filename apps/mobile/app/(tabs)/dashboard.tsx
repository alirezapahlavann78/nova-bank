import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { fa } from '../../localization';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">{fa.common.appName}</Text>
        <Text className="text-base text-gray-600 mb-4 text-center">
          خوش آمدید، {user?.firstName || user?.phone}
        </Text>

        <View className="grid grid-cols-2 gap-4 mb-8">
          <Pressable
            onPress={() => router.push('/analytics')}
            className="bg-white rounded-xl p-5 shadow-sm items-center"
          >
            <Text className="text-blue-600 font-semibold mb-1">{fa.analytics.analytics}</Text>
            <Text className="text-sm text-gray-500">تحلیل مالی</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/investments')}
            className="bg-white rounded-xl p-5 shadow-sm items-center"
          >
            <Text className="text-blue-600 font-semibold mb-1">{fa.investment.investments}</Text>
            <Text className="text-sm text-gray-500">سرمایه‌گذاری</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/payments')}
            className="bg-white rounded-xl p-5 shadow-sm items-center"
          >
            <Text className="text-blue-600 font-semibold mb-1">{fa.payment.payments}</Text>
            <Text className="text-sm text-gray-500">پرداخت‌ها</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/budgets')}
            className="bg-white rounded-xl p-5 shadow-sm items-center"
          >
            <Text className="text-blue-600 font-semibold mb-1">{fa.budget.budgets}</Text>
            <Text className="text-sm text-gray-500">بودجه‌ها</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/goals')}
            className="bg-white rounded-xl p-5 shadow-sm items-center"
          >
            <Text className="text-blue-600 font-semibold mb-1">{fa.goal.goals}</Text>
            <Text className="text-sm text-gray-500">اهداف</Text>
          </Pressable>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">{fa.notification.notifications}</Text>
          <Pressable
            onPress={() => router.push('/notifications')}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <Text className="text-gray-600">اعلان‌ها و پیام‌ها</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleLogout} className="bg-red-600 px-6 py-3 rounded-lg">
          <Text className="text-white font-semibold">{fa.auth.logout}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
