import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useInvestmentTransactions } from '../../../hooks/useInvestments';
import { fa } from '../../../localization';
import { formatCurrency, formatJalaliDate } from '../../../utils/format';

export default function InvestmentTransactionsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useInvestmentTransactions(accessToken || '');

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

  const transactions = data?.data || [];

  if (transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-gray-500 text-center">{fa.investment.noTransactions}</Text>
      </View>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUY':
      case 'DEPOSIT':
      case 'DIVIDEND':
      case 'INTEREST':
        return 'text-green-600';
      case 'SELL':
      case 'WITHDRAWAL':
      case 'FEE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">{fa.investment.transactions}</Text>
        {transactions.map((tx: any) => (
          <View key={tx.id} className="bg-white rounded-lg p-4 shadow-sm mb-3">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="font-semibold text-gray-900">{tx.asset?.symbol || tx.transactionType}</Text>
                {tx.asset?.name && <Text className="text-sm text-gray-500">{tx.asset.name}</Text>}
                <Text className="text-xs text-gray-400 mt-1">{formatJalaliDate(tx.transactionDate)}</Text>
              </View>
              <View className="items-end">
                <Text className={`font-semibold ${getTypeColor(tx.transactionType)}`}>
                  {formatCurrency(tx.amount, tx.currency)}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">{tx.transactionType}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
