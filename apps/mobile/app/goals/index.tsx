import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useGoals } from '../../hooks/useGoals';
import { useTranslation } from '../../hooks/useTranslation';

export default function GoalsScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { data: goals, isLoading, error } = useGoals(accessToken || '');
  const router = useRouter();

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
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500">{t('goal.goal')} {t('common.loading').toLowerCase()}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push(`/goals/${item.id}`)}
          >
            <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-600">{t('goal.target')}: {item.targetAmount}</Text>
              <Text className={`font-semibold ${item.isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                {Math.round(item.percentageComplete)}%
              </Text>
            </View>
          </Pressable>
        )}
      />
      <Pressable
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/goals/new')}
      >
        <Text className="text-white text-2xl font-bold">+</Text>
      </Pressable>
    </View>
  );
}