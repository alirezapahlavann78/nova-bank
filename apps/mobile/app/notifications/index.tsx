import { View, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GradientBackground,
  GlassCard,
  BackButton,
  ScreenState,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useTranslation } from '../../hooks/useTranslation';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { data: notifications, isLoading, error } = useNotifications(accessToken || '');
  const router = useRouter();

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'BUDGET_WARNING':
      case 'BUDGET_EXCEEDED':
        return '⚠️';
      case 'GOAL_MILESTONE':
      case 'GOAL_COMPLETED':
        return '🎯';
      case 'TRANSACTION_CREATED':
        return '💰';
      case 'TRANSFER_COMPLETED':
        return '🔄';
      case 'SYSTEM':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={t('common.loading')} />
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <ScreenState state="error" title={t('common.error')} />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={{ flex: 1, padding: 24, paddingBottom: 100 }}>
        <BackButton onPress={() => router.back()} />
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8 }}
          ListEmptyComponent={() => (
            <GlassCard style={{ alignItems: 'center', padding: 32 }}>
              <Text style={{ color: '#64748b' }}>{t('notification.notifications')}</Text>
            </GlassCard>
          )}
          renderItem={({ item }) => (
            <GlassCard style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>
                  {renderNotificationIcon(item.type)}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#0b1020' }}>{item.title}</Text>
                  <Text style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>{item.body}</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                    {new Date(item.createdAt).toLocaleString('fa-IR')}
                  </Text>
                </View>
              </View>
            </GlassCard>
          )}
        />
      </View>
    </GradientBackground>
  );
}
