import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  GradientBackground,
  GlassCard,
  PrimaryButton,
  GlassInput,
  BackButton,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { checkEligibility } from '../../services/lending';
import { fa } from '../../localization';
import { formatCurrency } from '../../utils/format';

export default function EligibilityCheckScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('12');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!accessToken) {
    router.replace('/(auth)/login');
    return null;
  }

  const handleCheck = async () => {
    if (!amount) {
      Alert.alert(fa.common.error, 'لطفاً مبلغ وام را وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      const res = await checkEligibility(accessToken, parseInt(amount, 10), 'IRT', parseInt(duration, 10));
      setResult(res);
    } catch (err: any) {
      Alert.alert(fa.common.error, err.message || 'خطا در بررسی صلاحیت');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelText = (level: string) => {
    const texts: Record<string, string> = {
      LOW: fa.lending.lowRisk,
      MEDIUM: fa.lending.mediumRisk,
      HIGH: fa.lending.highRisk,
      BLOCKED: 'قابل‌پوشش نیست',
    };
    return texts[level] || level;
  };

  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      LOW: '#22c55e',
      MEDIUM: '#eab308',
      HIGH: '#ef4444',
      BLOCKED: '#ef4444',
    };
    return colors[level] || '#64748b';
  };

  return (
    <GradientBackground>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          <BackButton onPress={() => router.back()} />

          <GlassCard style={{ marginBottom: 24, alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#0b1020', textAlign: 'center' }}>
              {fa.lending.checkEligibility}
            </Text>
          </GlassCard>

          <GlassCard style={{ marginBottom: 24 }}>
            <GlassInput
              label={fa.lending.loanAmount}
              placeholder="مثال: 50000000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <GlassInput
              label={`${fa.lending.duration} (ماه)`}
              placeholder="12"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
            <View style={{ marginTop: 20 }}>
              <PrimaryButton
                label={isLoading ? 'در حال بررسی...' : fa.lending.checkEligibility}
                onPress={handleCheck}
                disabled={isLoading}
              />
            </View>
          </GlassCard>

          {result && (
            <GlassCard style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, color: '#64748b' }}>{fa.lending.status}</Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: result.eligible ? '#22c55e' : '#ef4444' }}>
                  {result.eligible ? fa.common.confirm : fa.common.cancel}
                </Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: '#64748b' }}>{fa.lending.maxEligible}</Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#0b1020', marginTop: 4 }}>
                  {formatCurrency(result.maxEligibleAmount)}
                </Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: '#64748b' }}>{fa.lending.riskLevel}</Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: getRiskLevelColor(result.riskLevel), marginTop: 4 }}>
                  {getRiskLevelText(result.riskLevel)}
                </Text>
              </View>

              {result.reasons.length > 0 ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>دلایل:</Text>
                  {result.reasons.map((reason: string, index: number) => (
                    <Text key={index} style={{ fontSize: 14, color: '#475569', marginBottom: 4 }}>
                      • {reason}
                    </Text>
                  ))}
                </View>
              ) : null}

              {result.eligible ? (
                <PrimaryButton
                  label="مشاهده محصولات وام"
                  onPress={() => router.push('/lending/products')}
                  style={{ marginTop: 16 }}
                />
              ) : null}
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
