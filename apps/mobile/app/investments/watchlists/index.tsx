import { View, Text, ScrollView, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useWatchlists } from '../../../hooks/useInvestments';
import { fa } from '../../../localization';
import { formatCurrency } from '../../../utils/format';

export default function WatchlistsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useWatchlists(accessToken || '');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreateWatchlist = () => {
    setCreating(false);
    setNewName('');
  };

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

  const watchlists = data?.data || [];

  if (watchlists.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        {creating ? (
          <View className="w-64 mb-4">
            <Text className="text-sm text-gray-500 mb-2">{fa.investment.createWatchlist}</Text>
            <Pressable
              onPress={handleCreateWatchlist}
              className="bg-blue-600 px-6 py-3 rounded-lg mt-2"
            >
              <Text className="text-white font-semibold">{fa.common.save}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text className="text-gray-500 text-center mb-4">{fa.investment.noWatchlists}</Text>
            <Pressable
              onPress={() => setCreating(true)}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">{fa.investment.createWatchlist}</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">{fa.investment.watchlists}</Text>
          <Pressable
            onPress={() => setCreating(true)}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">+</Text>
          </Pressable>
        </View>

        {creating && (
          <View className="mb-4 p-4 bg-white rounded-lg shadow-sm">
            <Text className="font-semibold text-gray-900 mb-2">{fa.investment.createWatchlist}</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder={fa.investment.name}
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
            />
            <Pressable
              onPress={handleCreateWatchlist}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">{fa.common.save}</Text>
            </Pressable>
          </View>
        )}

        {watchlists.map((wl: any) => (
          <View key={wl.id} className="bg-white rounded-lg p-4 shadow-sm mb-3">
            <Text className="font-semibold text-gray-900 text-lg">{wl.name}</Text>
            {wl.description && <Text className="text-sm text-gray-500 mt-1">{wl.description}</Text>}
            <View className="mt-3">
              {wl.items?.length === 0 ? (
                <Text className="text-xs text-gray-400">{fa.investment.noHoldings}</Text>
              ) : (
                wl.items?.map((item: any) => (
                  <View key={item.id} className="flex-row justify-between py-2 border-b border-gray-100 last:border-0">
                    <View>
                      <Text className="font-medium text-gray-900">{item.asset?.symbol}</Text>
                      <Text className="text-xs text-gray-500">{item.asset?.name}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-medium text-gray-900">
                        {item.currentPrice !== null ? formatCurrency(item.currentPrice, item.asset?.currency || 'USD') : '-'}
                      </Text>
                      <Text className={`text-xs ${item.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.dailyChange >= 0 ? '+' : ''}{item.dailyChange.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
