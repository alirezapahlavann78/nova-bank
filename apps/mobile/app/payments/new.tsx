import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GradientBackground,
  GlassCard,
  GlassInput,
  PrimaryButton,
  BackButton,
  SectionHeader,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, accent } from '../../theme';
import { createPayment } from '../../services/payments';
import { createIdempotencyKey } from '../../services/api';

export default function NewPaymentScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);
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
      idempotencyKeyRef.current ??= createIdempotencyKey('payment');
      await createPayment(accessToken, {
        type: form.type,
        amount: Number(form.amount),
        currency: form.currency,
        sourceAccountId: form.sourceAccountId,
        destinationType: form.destinationType,
        destinationValue: form.destinationValue,
        destinationName: form.destinationName || undefined,
        description: form.description || undefined,
        fees: Number(form.fees),
        idempotencyKey: idempotencyKeyRef.current,
      });
      Alert.alert('موفقیت', 'پرداخت با موفقیت انجام شد');
      router.replace('/payments');
    } catch (error) {
      Alert.alert('خطا', error instanceof Error ? error.message : 'خطای نامعلوم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (key: keyof typeof form, value: string) => {
    idempotencyKeyRef.current = null;
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <GradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
      >
        <BackButton onPress={() => router.back()} />

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 99,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.55)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.45)',
            }}
          >
            <Ionicons name="swap-horizontal" size={22} color={accent[500]} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.textPrimary, marginTop: 12 }}>
            ایجاد پرداخت
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 6 }}>
            مقصد و مبلغ پرداخت را مشخص کنید
          </Text>
        </View>

        <GlassCard style={{ marginBottom: 16 }}>
          <GlassInput
            label="شناسه حساب مبدأ"
            placeholder="UUID حساب مبدأ"
            value={form.sourceAccountId}
            onChangeText={(v: string) => update('sourceAccountId', v)}
          />
        </GlassCard>

        <GlassCard style={{ marginBottom: 16 }}>
          <SectionHeader title="نوع مقصد" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['ACCOUNT', 'CARD', 'IBAN'].map((t) => (
              <Pressable
                key={t}
                onPress={() => update('destinationType', t)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                   borderColor: form.destinationType === t ? accent[500] : 'rgba(160,140,255,0.35)',
                   backgroundColor: form.destinationType === t ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.70)',
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: '600',
                    color: form.destinationType === t ? accent[500] : theme.textSecondary,
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={{ marginBottom: 16 }}>
          <GlassInput
            label="مقدار مقصد"
            placeholder="شماره حساب یا کارت"
            value={form.destinationValue}
            onChangeText={(v: string) => update('destinationValue', v)}
          />
          <GlassInput
            label="نام مقصد"
            placeholder="نام گیرنده"
            value={form.destinationName}
            onChangeText={(v: string) => update('destinationName', v)}
            containerStyle={{ marginTop: 12 }}
          />
        </GlassCard>

        <GlassCard style={{ marginBottom: 16 }}>
          <GlassInput
            label="مبلغ"
            placeholder="0"
            value={form.amount}
            onChangeText={(v: string) => update('amount', v)}
            keyboardType="numeric"
          />
          <GlassInput
            label="کارکرد"
            placeholder="0"
            value={form.fees}
            onChangeText={(v: string) => update('fees', v)}
            keyboardType="numeric"
            containerStyle={{ marginTop: 12 }}
          />
          <GlassInput
            label="توضیحات"
            placeholder="توضیح اختیاری"
            value={form.description}
            onChangeText={(v: string) => update('description', v)}
            multiline
            containerStyle={{ marginTop: 12 }}
            style={{ minHeight: 88 }}
          />
        </GlassCard>

        <View style={{ marginTop: 32 }}>
          <PrimaryButton
            label={isSubmitting ? 'در حال ارسال...' : 'ایجاد پرداخت'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!form.sourceAccountId || !form.destinationValue}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
