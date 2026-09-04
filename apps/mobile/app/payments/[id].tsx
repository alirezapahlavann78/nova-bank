import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePayment, cancelPayment } from '../../hooks/usePayments';
import { fa } from '../../localization';
import { formatCurrency } from '../../utils/format';

export default function PaymentDetailScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: payment, isLoading, refetch } = usePayment(accessToken || '', id || '');

  if (!accessToken) {
    router.replace('/(auth)/login');
    return null;
  }

  if (isLoading || !payment) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">{fa.common.loading}</Text>
      </View>
    );
  }

  const handleCancel = async () => {
    Alert.alert(
      fa.payment.cancelPayment,
      'آیا مطمئن هستید که می‌خواهید این پرداخت را لغو کنید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'لغو',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelPayment(accessToken, payment.id);
              await refetch();
            } catch (error) {
              Alert.alert('خطا', error instanceof Error ? error.message : 'خطای نامعلوم');
            }
          },
        },
      ],
    );
  };

  const statusColor = {
    COMPLETED: 'text-green-600',
    FAILED: 'text-red-600',
    PENDING: 'text-yellow-600',
    PROCESSING: 'text-blue-600',
    CANCELLED: 'text-gray-600',
    REVERSED: 'text-purple-600',
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <View className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-medium text-gray-500">{fa.payment.type}</Text>
            <Text className={`text-sm font-medium ${statusColor[payment.status as keyof typeof statusColor] || 'text-gray-600'}`}>
              {fa.payment[payment.status.toLowerCase() as keyof typeof fa.payment] || payment.status}
            </Text>
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-4">
            {formatCurrency(payment.amount, payment.currency)}
          </Text>

          <Text className="text-sm font-medium text-gray-500 mb-1">{fa.payment.destinationName}</Text>
          <Text className="text-lg text-gray-900 mb-4">
            {payment.destinationName || payment.destinationValue}
          </Text>

          {payment.description ? (
            <>
              <Text className="text-sm font-medium text-gray-500 mb-1">{fa.common.description}</Text>
              <Text className="text-gray-700 mb-4">{payment.description}</Text>
            </>
          ) : null}

          {payment.fees > 0 ? (
            <>
              <View className="flex-row justify-between py-2 border-t border-gray-100">
                <Text className="text-gray-600">{fa.payment.fees}</Text>
                <Text className="text-gray-900">{formatCurrency(payment.fees, payment.currency)}</Text>
              </View>
            </>
          ) : null}

          {payment.internalReference ? (
            <View className="flex-row justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-500">شماره مرجع</Text>
              <Text className="text-gray-900 font-mono">{payment.internalReference}</Text>
            </View>
          ) : null}

          {payment.riskLevel ? (
            <View className="flex-row justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-500">سطح ریسک</Text>
              <Text className={`font-medium ${payment.riskLevel === 'HIGH' ? 'text-red-600' : payment.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                {payment.riskLevel === 'HIGH' ? 'بالا' : payment.riskLevel === 'MEDIUM' ? 'متوسط' : 'پایین'}
              </Text>
            </View>
          ) : null}

          {payment.executedAt ? (
            <View className="flex-row justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-500">تاریخ اجرا</Text>
              <Text className="text-gray-900">{new Date(payment.executedAt).toLocaleDateString('fa-IR')}</Text>
            </View>
          ) : null}
        </View>

        {payment.status === 'COMPLETED' && (
          <Pressable
            onPress={handleCancel}
            className="bg-red-600 rounded-lg py-4 items-center mb-4"
          >
            <Text className="text-white font-semibold text-lg">{fa.payment.cancelPayment}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
