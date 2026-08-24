import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';

export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!phone || !password) {
      Alert.alert('خطا', 'لطفا شماره موبایل و رمز عبور را وارد کنید');
      return;
    }
    setLoading(true);
    try {
      await register(phone, password, undefined, firstName, lastName);
      router.replace('/(tabs)/dashboard');
    } catch {
      Alert.alert('خطا', 'ثبت نام ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <Text className="text-3xl font-bold text-gray-900 mb-2">نوابانک</Text>
      <Text className="text-base text-gray-600 mb-8">ثبت نام</Text>

      <TextInput
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-right"
        placeholder="شماره موبایل"
        placeholderTextColor="#9CA3AF"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
      />

      <TextInput
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-right"
        placeholder="نام"
        placeholderTextColor="#9CA3AF"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-right"
        placeholder="نام خانوادگی"
        placeholderTextColor="#9CA3AF"
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-6 text-right"
        placeholder="رمز عبور"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />

      <Pressable
        onPress={handleRegister}
        disabled={loading}
        className="bg-blue-600 px-6 py-3 rounded-lg w-full items-center"
      >
        <Text className="text-white font-semibold">{loading ? 'در حال ثبت نام...' : 'ثبت نام'}</Text>
      </Pressable>

      <Pressable onPress={() => router.back()} className="mt-4">
        <Text className="text-blue-600">ورود به حساب</Text>
      </Pressable>
    </View>
  );
}
