import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePayments } from '../../hooks/usePayments';
import { fa } from '../../localization';
import { formatCurrency } from '../../utils/format';

export default function PaymentsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data: payments, isLoading } = usePayments(accessToken || '');

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

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-900">{fa.payment.payments}</Text>
          <Pressable
            onPress={() => router.push('/payments/new')}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">{fa.payment.createPayment}</Text>
          </Pressable>
        </View>

        {payments.length === 0 ? (
          <View className="bg-white rounded-xl p-6 shadow-sm items-center">
            <Text className="text-gray-500 text-center">هیچ پرداختی وجود ندارد</Text>
          </View>
        ) : (
          payments.map((payment) => (
            <Pressable
              key={payment.id}
              className="bg-white rounded-xl p-4 shadow-sm mb-3"
              onPress={() => router.push(`/payments/${payment.id}`)}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-gray-900">
                  {fa.payment[payment.type.toLowerCase() as keyof typeof fa.payment] || payment.type}
                </Text>
                <Text className={`text-sm font-medium ${payment.status === 'COMPLETED' ? 'text-green-600' : payment.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {fa.payment[payment.status.toLowerCase() as keyof typeof fa.payment] || payment.status}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(payment.amount, payment.currency)}
              </Text>
              <Text className="text-sm text-gray-500">
                {payment.destinationName || payment.destinationValue}
              </Text>
              <Text className="text-xs text-gray-400 mt-2">
                {new Date(payment.createdAt).toLocaleDateString('fa-IR')}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}
