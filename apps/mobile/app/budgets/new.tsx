import { ScrollView, TextInput, Pressable, ActivityIndicator, Text } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { createBudget } from '../../services/budgets';
import { useTranslation } from '../../hooks/useTranslation';

export default function NewBudgetScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('MONTHLY');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      await createBudget(accessToken, {
        name,
        amount: Number(amount),
        period,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">{t('budget.budget')}</Text>

      <Text className="text-gray-700 mb-1">{t('budget.amount')}</Text>
      <TextInput
        className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
        value={name}
        onChangeText={setName}
        placeholder={t('budget.budget')}
      />

      <Text className="text-gray-700 mb-1">{t('budget.amount')}</Text>
      <TextInput
        className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0"
      />

      <Text className="text-gray-700 mb-1">{t('budget.period')}</Text>
      <TextInput
        className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
        value={period}
        onChangeText={setPeriod}
        placeholder="MONTHLY"
      />

      <Pressable
        className="bg-blue-600 py-3 rounded-lg items-center mt-4"
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">{t('common.save')}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}