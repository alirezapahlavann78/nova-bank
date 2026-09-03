import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useInvestmentAccounts } from '../../../hooks/useInvestments';
import { fa } from '../../../localization';
import { formatCurrency } from '../../../utils/format';

export default function InvestmentAccountsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useInvestmentAccounts(accessToken || '');

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

  const accounts = data?.data || [];

  if (accounts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-gray-500 text-center mb-4">{fa.investment.noTransactions}</Text>
        <Text className="text-gray-500 text-center">(No investment accounts yet)</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">{fa.investment.accounts}</Text>
        {accounts.map((account: any) => (
          <View key={account.id} className="bg-white rounded-lg p-4 shadow-sm mb-3">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="font-semibold text-gray-900 text-lg">
                  {account.brokerName || 'Investment Account'}
                </Text>
                <Text className="text-sm text-gray-500">{account.accountType} • {account.status}</Text>
                {account.accountNumber && (
                  <Text className="text-xs text-gray-400 mt-1">{fa.investment.accountNumber}: {account.accountNumber}</Text>
                )}
              </View>
              <View className="items-end">
                <Text className="font-semibold text-gray-900">
                  {formatCurrency(account.totalValue, account.baseCurrency)}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {fa.investment.cashBalance}: {formatCurrency(account.cashBalance, account.baseCurrency)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
