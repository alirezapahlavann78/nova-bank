import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { createPayment, PaymentSummaryResponse } from '../../services/payments';
import { fa } from '../../localization';

export default function NewPaymentScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'DOMESTIC_TRANSFER',
    amount: '',
    currency: 'IRT',
    sourceAccountId: '',
    destinationType: 'ACCOUNT',
    destinationValue: '',
    destinationName: '',
    description: '',
    fees: '0',
  });

  const handleSubmit = async () => {
    if (!accessToken) return;
    setIsSubmitting(true);
    try {
      const response = await createPayment(accessToken, {
        type: form.type,
        amount: Number(form.amount),
        currency: form.currency,
        sourceAccountId: form.sourceAccountId,
        destinationType: form.destinationType,
        destinationValue: form.destinationValue,
        destinationName: form.destinationName || undefined,
        description: form.description || undefined,
        fees: Number(form.fees),
      });
      Alert.show?.('پرداخت با موفقیت انجام شد');
      router.replace('/payments');
    } catch (error) {
      Alert.alert('خطا', error instanceof Error ? error.message : 'خطای نامعلوم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">{fa.payment.createPayment}</Text>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">{fa.payment.destinationType}</Text>
          <TextInput
            value={form.destinationType}
            onChangeText={(text) => setForm({ ...form, destinationType: text.toUpperCase() })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
            placeholder="ACCOUNT"
          />
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">{fa.payment.amount}</Text>
          <TextInput
            value={form.amount}
            onChangeText={(text) => setForm({ ...form, amount: text })}
            keyboardType="numeric"
            className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
            placeholder="0"
          />
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">{fa.payment.destinationValue}</Text>
          <TextInput
            value={form.destinationValue}
            onChangeText={(text) => setForm({ ...form, destinationValue: text })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
            placeholder="شماره حساب یا کارت"
          />
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">{fa.payment.destinationName}</Text>
          <TextInput
            value={form.destinationName}
            onChangeText={(text) => setForm({ ...form, destinationName: text })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
            placeholder="نام گیرنده"
          />
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">{fa.payment.fees}</Text>
          <TextInput
            value={form.fees}
            onChangeText={(text) => setForm({ ...form, fees: text })}
            keyboardType="numeric"
            className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
            placeholder="0"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-lg py-4 items-center ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-lg">{fa.payment.createPayment}</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
