import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useHoldings } from '../../../hooks/useInvestments';
import { fa } from '../../../localization';
import { formatCurrency } from '../../../utils/format';

export default function HoldingsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useHoldings(accessToken || '');

  if (!accessToken) {
    router.replace('/(auth)/login');
    return null;
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">{fa.common.loading}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-600">{fa.common.error}: {error.message}</Text>
      </View>
    );
  }

  const holdings = data?.data || [];

  if (holdings.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-gray-500 text-center">{fa.investment.noHoldings}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">{fa.investment.holdings}</Text>
        {holdings.map((h: any) => {
          const plPositive = Number(h.pl) >= 0;
          return (
            <View key={h.id} className="bg-white rounded-lg p-4 shadow-sm mb-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-lg">{h.asset?.symbol}</Text>
                  <Text className="text-sm text-gray-500">{h.asset?.name}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-semibold text-gray-900">{formatCurrency(h.marketValue, h.asset?.currency || 'USD')}</Text>
                  <Text className={`text-sm ${plPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {plPositive ? '+' : ''}{h.plPercentage.toFixed(2)}%
                  </Text>
                </View>
              </View>
              <View className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                <View>
                  <Text className="text-xs text-gray-500">{fa.investment.quantity}</Text>
                  <Text className="font-medium text-gray-900">{h.quantity}</Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">{fa.investment.averagePrice}</Text>
                  <Text className="font-medium text-gray-900">{formatCurrency(h.averagePrice, h.asset?.currency || 'USD')}</Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">{fa.investment.currentPrice}</Text>
                  <Text className="font-medium text-gray-900">
                    {h.currentPrice ? formatCurrency(h.currentPrice, h.asset?.currency || 'USD') : '-'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
