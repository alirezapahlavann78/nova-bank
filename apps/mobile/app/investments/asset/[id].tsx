import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GlassListCard, GradientBackground, ScreenState } from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import { fa } from "../../../localization";

export default function AssetDetailScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; symbol?: string; name?: string }>();

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <GradientBackground>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <GlassListCard className="mb-4">
            <Text className="text-2xl font-bold text-gray-900">{params.symbol || "UNKNOWN"}</Text>
            <Text className="text-lg text-gray-600 mt-1">{params.name || fa.investment.asset}</Text>
          </GlassListCard>

          <View className="grid grid-cols-2 gap-3 mb-6">
            <GlassListCard>
              <Text className="text-xs text-gray-500 mb-1">{fa.investment.currentPrice}</Text>
              <Text className="text-sm text-gray-500">اطلاعات قیمت در دسترس نیست</Text>
            </GlassListCard>
            <GlassListCard>
              <Text className="text-xs text-gray-500 mb-1">{fa.investment.previousPrice}</Text>
              <Text className="text-sm text-gray-500">اطلاعات قیمت در دسترس نیست</Text>
            </GlassListCard>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              {fa.investment.holdings}
            </Text>
            <ScreenState state="empty" message={fa.investment.noHoldings} />
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              {fa.investment.transactions}
            </Text>
            <ScreenState state="empty" message={fa.investment.noTransactions} />
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
