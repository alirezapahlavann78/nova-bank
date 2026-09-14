import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GradientBackground,
  GlassCard,
  BackButton,
  SectionHeader,
  StatCard,
  ScreenState,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import {
  useReportsOverview,
  useReportsTrends,
  useReportsCategoryBreakdown,
  useReportsBudgetPerformance,
  useReportsGoalProgress,
} from '../../hooks/useReports';
import { useTranslation } from '../../hooks/useTranslation';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { data: overview, isLoading: overviewLoading } = useReportsOverview(accessToken || '');
  const { data: trends, isLoading: trendsLoading } = useReportsTrends(accessToken || '');
  const { data: breakdown, isLoading: breakdownLoading } = useReportsCategoryBreakdown(accessToken || '');
  const { data: budgetPerformance, isLoading: budgetLoading } = useReportsBudgetPerformance(accessToken || '');
  const { data: goalProgress, isLoading: goalLoading } = useReportsGoalProgress(accessToken || '');

  const isLoading = overviewLoading || trendsLoading || breakdownLoading || budgetLoading || goalLoading;

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={t('common.loading')} />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          <BackButton onPress={() => router.back()} />

          <GlassCard style={{ marginBottom: 16, alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#0b1020', textAlign: 'center' }}>
              {t('analytics.overview')}
            </Text>
          </GlassCard>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <StatCard
              label={t('analytics.income')}
              value={String(overview?.totalIncome ?? 0)}
              style={{ flex: 1 }}
            />
            <StatCard
              label={t('analytics.expenses')}
              value={String(overview?.totalExpenses ?? 0)}
              style={{ flex: 1 }}
            />
            <StatCard
              label={t('analytics.netCashFlow')}
              value={String(overview?.netCashFlow ?? 0)}
              style={{ flex: 1 }}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <SectionHeader title={t('analytics.trends')} />
            <GlassCard>
              {trends?.map((item: any, idx: number) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <Text style={{ color: '#64748b' }}>{item.period}</Text>
                  <Text style={{ color: '#0b1020', fontWeight: '600' }}>{item.netCashFlow}</Text>
                </View>
              ))}
            </GlassCard>
          </View>

          <View style={{ marginBottom: 24 }}>
            <SectionHeader title={t('analytics.categories')} />
            <GlassCard>
              {breakdown?.map((item: any, idx: number) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <Text style={{ color: '#64748b' }}>
                    {item.category?.name || item.category?.nameEn || '-'}
                  </Text>
                  <Text style={{ color: '#0b1020', fontWeight: '600' }}>{item.amount}</Text>
                </View>
              ))}
            </GlassCard>
          </View>

          <View style={{ marginBottom: 24 }}>
            <SectionHeader title={t('analytics.budgetPerformance')} />
            <GlassCard>
              {budgetPerformance?.map((item: any, idx: number) => (
                <View key={idx} style={{ paddingVertical: 8 }}>
                  <Text style={{ color: '#64748b' }}>{item.budget.name}</Text>
                  <Text style={{ color: '#0b1020', fontWeight: '600', marginTop: 4 }}>
                    {Math.round(item.percentageUsed)}%
                  </Text>
                </View>
              ))}
            </GlassCard>
          </View>

          <View style={{ marginBottom: 24 }}>
            <SectionHeader title={t('analytics.goalProgress')} />
            <GlassCard>
              {goalProgress?.map((item: any, idx: number) => (
                <View key={idx} style={{ paddingVertical: 8 }}>
                  <Text style={{ color: '#64748b' }}>{item.goal.name}</Text>
                  <Text style={{ color: '#0b1020', fontWeight: '600', marginTop: 4 }}>
                    {Math.round(item.percentageComplete)}%
                  </Text>
                </View>
              ))}
            </GlassCard>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
