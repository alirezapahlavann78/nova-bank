import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground, PrimaryButton, SecondaryButton } from '../components/ui';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 12 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 99,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.55)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.45)',
              shadowColor: '#4f46e5',
              shadowOpacity: 0.12,
              shadowRadius: 32,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#7c3aed' }}>ن</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#0b1020', marginTop: 16 }}>نوابانک</Text>
          <Text style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>پایه‌های مالی هوشمند با فنا‌آینده شیشه‌ای</Text>
        </View>

        <PrimaryButton label="مشاهده تراکنش‌ها" onPress={() => router.push('/payments')} />
        <SecondaryButton label="ورود به حساب کاربری" onPress={() => router.push('/(auth)/login')} />
      </View>
    </GradientBackground>
  );
}
