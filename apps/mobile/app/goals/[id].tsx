import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useGoal } from '../../hooks/useGoals';
import { useTranslation } from '../../hooks/useTranslation';

export default function GoalDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { data: goal, isLoading, error } = useGoal(accessToken || '', id);
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !goal) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600">{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-4">{goal.name}</Text>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('goal.target')}</Text>
        <Text className="text-2xl font-bold text-gray-900">{goal.targetAmount}</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('goal.progress')}</Text>
        <Text className="text-2xl font-bold text-gray-900">{goal.currentAmount}</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('goal.remaining')}</Text>
        <Text className="text-2xl font-bold text-gray-900">{goal.remaining}</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('goal.progress')} %</Text>
        <Text className={`text-2xl font-bold ${goal.isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
          {Math.round(goal.percentageComplete)}%
        </Text>
      </View>

      <View className="flex-row gap-3 mt-4">
        <Pressable
          className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
          onPress={() => router.push(`/goals/${id}/edit`)}
        >
          <Text className="text-white font-semibold">{t('common.edit')}</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-green-600 py-3 rounded-lg items-center"
          onPress={async () => {
            if (accessToken && id) {
              await fetch(`/api/v1/goals/${id}/progress`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 1000 }),
              });
            }
          }}
        >
          <Text className="text-white font-semibold">{t('goal.progress')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}