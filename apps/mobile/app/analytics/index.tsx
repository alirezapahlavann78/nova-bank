import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useReportsOverview, useReportsTrends, useReportsCategoryBreakdown, useReportsBudgetPerformance, useReportsGoalProgress } from '../../hooks/useReports';
import { useTranslation } from '../../hooks/useTranslation';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { data: overview, isLoading: overviewLoading } = useReportsOverview(accessToken || '');
  const { data: trends, isLoading: trendsLoading } = useReportsTrends(accessToken || '');
  const { data: breakdown, isLoading: breakdownLoading } = useReportsCategoryBreakdown(accessToken || '');
  const { data: budgetPerformance, isLoading: budgetLoading } = useReportsBudgetPerformance(accessToken || '');
  const { data: goalProgress, isLoading: goalLoading } = useReportsGoalProgress(accessToken || '');

  const isLoading = overviewLoading || trendsLoading || breakdownLoading || budgetLoading || goalLoading;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-4">{t('analytics.overview')}</Text>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('analytics.income')}</Text>
        <Text className="text-2xl font-bold text-green-600">{overview?.totalIncome ?? 0}</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('analytics.expenses')}</Text>
        <Text className="text-2xl font-bold text-red-600">{overview?.totalExpenses ?? 0}</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <Text className="text-gray-600 mb-1">{t('analytics.netCashFlow')}</Text>
        <Text className="text-2xl font-bold text-gray-900">{overview?.netCashFlow ?? 0}</Text>
      </View>

      <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">{t('analytics.trends')}</Text>
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        {trends?.map((item: any, idx: number) => (
          <View key={idx} className="flex-row justify-between py-1">
            <Text className="text-gray-700">{item.period}</Text>
            <Text className="text-gray-900 font-semibold">{item.netCashFlow}</Text>
          </View>
        ))}
      </View>

      <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">{t('analytics.categories')}</Text>
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        {breakdown?.map((item: any, idx: number) => (
          <View key={idx} className="flex-row justify-between py-1">
            <Text className="text-gray-700">{item.category?.name || item.category?.nameEn || '-'}</Text>
            <Text className="text-gray-900 font-semibold">{item.amount}</Text>
          </View>
        ))}
      </View>

      <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">{t('analytics.budgetPerformance')}</Text>
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        {budgetPerformance?.map((item: any, idx: number) => (
          <View key={idx} className="py-1">
            <Text className="text-gray-700">{item.budget.name}</Text>
            <Text className="text-gray-900 font-semibold">{Math.round(item.percentageUsed)}%</Text>
          </View>
        ))}
      </View>

      <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">{t('analytics.goalProgress')}</Text>
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        {goalProgress?.map((item: any, idx: number) => (
          <View key={idx} className="py-1">
            <Text className="text-gray-700">{item.goal.name}</Text>
            <Text className="text-gray-900 font-semibold">{Math.round(item.percentageComplete)}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}