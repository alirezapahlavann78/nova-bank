import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useBudget } from '../../hooks/useBudgets';
import { useTranslation } from '../../hooks/useTranslation';

export default function BudgetDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { data: budget, isLoading, error } = useBudget(accessToken || '', id);
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !budget) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600">{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-4">{budget.name}</Text>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('budget.amount')}</Text>
        <Text className="text-2xl font-bold text-gray-900">{budget.amount}</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('budget.spent')}</Text>
        <Text className="text-2xl font-bold text-gray-900">{budget.spent}</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('budget.remaining')}</Text>
        <Text className="text-2xl font-bold text-gray-900">{budget.remaining}</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('budget.amount')} %</Text>
        <Text className={`text-2xl font-bold ${budget.exceeded ? 'text-red-600' : 'text-green-600'}`}>
          {Math.round(budget.percentageUsed)}%
        </Text>
      </View>

      <View className="flex-row gap-3 mt-4">
        <Pressable
          className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
          onPress={() => router.push(`/budgets/${id}/edit`)}
        >
          <Text className="text-white font-semibold">{t('common.edit')}</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-red-600 py-3 rounded-lg items-center"
          onPress={async () => {
            await fetch(`/api/v1/budgets/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } });
            router.back();
          }}
        >
          <Text className="text-white font-semibold">{t('common.delete')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}