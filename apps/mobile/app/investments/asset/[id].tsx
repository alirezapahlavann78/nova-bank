import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { fa } from '../../../localization';

export default function AssetDetailScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; symbol?: string; name?: string }>();

  if (!accessToken) {
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <View className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <Text className="text-2xl font-bold text-gray-900">{params.symbol || 'UNKNOWN'}</Text>
          <Text className="text-lg text-gray-600 mt-1">{params.name || fa.investment.asset}</Text>
        </View>

        <View className="grid grid-cols-2 gap-3 mb-6">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-xs text-gray-500 mb-1">{fa.investment.currentPrice}</Text>
            <Text className="text-lg font-semibold text-gray-900">$192.50</Text>
          </View>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-xs text-gray-500 mb-1">{fa.investment.previousPrice}</Text>
            <Text className="text-lg font-semibold text-gray-900">$190.30</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">{fa.investment.holdings}</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-sm text-gray-500">{fa.investment.noHoldings}</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">{fa.investment.transactions}</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-sm text-gray-500">{fa.investment.noTransactions}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
