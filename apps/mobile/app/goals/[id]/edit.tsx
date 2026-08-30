import { ScrollView, TextInput, Pressable, ActivityIndicator, Text } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { updateGoal } from '../../../services/goals';
import { useTranslation } from '../../../hooks/useTranslation';

export default function EditGoalScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!accessToken || !id) return;
    setLoading(true);
    try {
      await updateGoal(accessToken, id, { name, targetAmount: Number(targetAmount) });
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">{t('goal.goal')}</Text>

      <Text className="text-gray-700 mb-1">{t('goal.target')}</Text>
      <TextInput
        className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
        value={name}
        onChangeText={setName}
        placeholder={t('goal.goal')}
      />

      <Text className="text-gray-700 mb-1">{t('goal.target')} Amount</Text>
      <TextInput
        className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
        value={targetAmount}
        onChangeText={setTargetAmount}
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