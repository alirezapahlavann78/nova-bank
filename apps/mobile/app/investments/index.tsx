import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePortfolioOverview, useInvestmentAccounts, useAssetAllocation } from '../../hooks/useInvestments';
import { fa } from '../../localization';
import { formatCurrency } from '../../utils/format';

export default function InvestmentDashboardScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolioOverview(accessToken || '');
  const { data: accounts, isLoading: loadingAccounts } = useInvestmentAccounts(accessToken || '');
  const { data: allocation, isLoading: loadingAllocation } = useAssetAllocation(accessToken || '');

  const isLoading = loadingPortfolio || loadingAccounts || loadingAllocation;

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

  const totalValue = portfolio?.totalPortfolioValue ?? 0;
  const returnPercentage = portfolio?.returnPercentage ?? 0;
  const invested = portfolio?.totalInvestedCapital ?? 0;
  const cash = portfolio?.totalCashBalance ?? 0;
  const unrealizedPL = portfolio?.totalUnrealizedPL ?? 0;

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">{fa.investment.dashboard}</Text>

        <View className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <Text className="text-sm text-gray-500 mb-1">{fa.investment.totalValue}</Text>
          <Text className="text-3xl font-bold text-gray-900">
            {formatCurrency(totalValue, 'USD')}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className={`text-lg font-semibold ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
            </Text>
            <Text className="text-sm text-gray-500 mr-2">
              ({unrealizedPL >= 0 ? '+' : ''}{formatCurrency(unrealizedPL, 'USD')} {fa.investment.today})
            </Text>
          </View>
        </View>

        <View className="grid grid-cols-3 gap-3 mb-6">
          <View className="bg-white rounded-lg p-3 shadow-sm">
            <Text className="text-xs text-gray-500 mb-1">{fa.investment.totalInvested}</Text>
            <Text className="text-lg font-semibold text-gray-900">{formatCurrency(invested, 'USD')}</Text>
          </View>
          <View className="bg-white rounded-lg p-3 shadow-sm">
            <Text className="text-xs text-gray-500 mb-1">{fa.investment.cash}</Text>
            <Text className="text-lg font-semibold text-gray-900">{formatCurrency(cash, 'USD')}</Text>
          </View>
          <View className="bg-white rounded-lg p-3 shadow-sm">
            <Text className="text-xs text-gray-500 mb-1">{fa.investment.return}</Text>
            <Text className={`text-lg font-semibold ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {returnPercentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">{fa.investment.accounts}</Text>
          {accounts?.data?.length === 0 ? (
            <View className="bg-white rounded-lg p-4 items-center">
              <Text className="text-gray-500">{fa.investment.noHoldings}</Text>
            </View>
          ) : (
            accounts?.data?.map((account: any) => (
              <View key={account.id} className="bg-white rounded-lg p-4 shadow-sm mb-2">
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="font-semibold text-gray-900">{account.brokerName || fa.investment.accounts}</Text>
                    <Text className="text-sm text-gray-500">{account.accountType}</Text>
                  </View>
                  <Text className="font-semibold text-gray-900">{formatCurrency(account.totalValue, account.baseCurrency)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">{fa.investment.assetAllocation}</Text>
          {allocation?.byAssetType?.length === 0 ? (
            <View className="bg-white rounded-lg p-4 items-center">
              <Text className="text-gray-500">{fa.investment.noHoldings}</Text>
            </View>
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

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push('/investments/holdings')}
            className="flex-1 bg-white rounded-lg p-4 shadow-sm items-center"
          >
            <Text className="text-blue-600 font-semibold">{fa.investment.holdings}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/investments/watchlists')}
            className="flex-1 bg-white rounded-lg p-4 shadow-sm items-center"
          >
            <Text className="text-blue-600 font-semibold">{fa.investment.watchlists}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/investments/transactions')}
            className="flex-1 bg-white rounded-lg p-4 shadow-sm items-center"
          >
            <Text className="text-blue-600 font-semibold">{fa.investment.transactions}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
