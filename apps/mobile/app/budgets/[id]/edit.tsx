import { ScrollView, TextInput, Pressable, ActivityIndicator, Text } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { updateBudget } from '../../../services/budgets';
import { useTranslation } from '../../../hooks/useTranslation';

export default function EditBudgetScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!accessToken || !id) return;
    setLoading(true);
    try {
      await updateBudget(accessToken, id, { name, amount: Number(amount) });
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