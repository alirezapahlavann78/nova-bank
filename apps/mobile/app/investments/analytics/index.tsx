import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useAssetAllocation, usePortfolioPerformance } from '../../../hooks/useInvestments';
import { fa } from '../../../localization';
import { formatCurrency } from '../../../utils/format';

export default function InvestmentAnalyticsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data: allocation, isLoading: loadingAlloc } = useAssetAllocation(accessToken || '');
  const { data: performance, isLoading: loadingPerf } = usePortfolioPerformance(accessToken || '');

  if (!accessToken) {
    router.replace('/(auth)/login');
    return null;
  }

  if (loadingAlloc || loadingPerf) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">{fa.common.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">{fa.investment.performance}</Text>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">{fa.investment.assetAllocation}</Text>
          {allocation?.byAssetType?.length === 0 ? (
            <Text className="text-gray-500">{fa.investment.noHoldings}</Text>
          ) : (
            allocation?.byAssetType?.map((item: any) => (
              <View key={item.assetType} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="font-medium text-gray-900">{item.assetType}</Text>
                  <Text className="text-gray-600">{item.percentage.toFixed(1)}%</Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">{fa.investment.accountAllocation}</Text>
          {allocation?.byAccount?.length === 0 ? (
            <Text className="text-gray-500">{fa.investment.noHoldings}</Text>
          ) : (
            allocation?.byAccount?.map((item: any) => (
              <View key={item.accountId} className="flex-row justify-between py-2 border-b border-gray-100 last:border-0">
                <Text className="font-medium text-gray-900">{item.accountId}</Text>
                <Text className="text-gray-600">{item.percentage.toFixed(1)}%</Text>
              </View>
            ))
          )}
        </View>

        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-3">{fa.investment.performance}</Text>
          {performance?.points?.length === 0 ? (
            <Text className="text-gray-500">{fa.investment.noHoldings}</Text>
          ) : (
            performance?.points?.slice(-7).reverse().map((point: any) => (
              <View key={point.date} className="flex-row justify-between py-2 border-b border-gray-100 last:border-0">
                <Text className="text-gray-700">{point.date}</Text>
                <View className="items-end">
                  <Text className="font-medium text-gray-900">
                    {formatCurrency(point.totalValue, 'USD')}
                  </Text>
                  <Text className={`text-xs ${point.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {point.dailyChange >= 0 ? '+' : ''}{point.cumulativeReturn.toFixed(2)}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
