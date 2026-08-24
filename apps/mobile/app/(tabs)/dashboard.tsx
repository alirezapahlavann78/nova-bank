import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <Text className="text-2xl font-bold text-gray-900 mb-2">نوابانک</Text>
      <Text className="text-base text-gray-600 mb-8 text-center">
        خوش آمدید، {user?.firstName || user?.phone}
      </Text>
      <Pressable onPress={handleLogout} className="bg-red-600 px-6 py-3 rounded-lg">
        <Text className="text-white font-semibold">خروج</Text>
      </Pressable>
    </View>
  );
}
