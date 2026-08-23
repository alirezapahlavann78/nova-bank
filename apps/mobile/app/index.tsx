import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <Text className="text-3xl font-bold text-gray-900 mb-2">نوابانک</Text>
      <Text className="text-base text-gray-600 mb-8 text-center">
        پایه‌های مالی هوشمند
      </Text>
      <Pressable
        onPress={() => router.push('/transactions')}
        className="bg-blue-600 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">مشاهده تراکنش‌ها</Text>
      </Pressable>
    </View>
  );
}
