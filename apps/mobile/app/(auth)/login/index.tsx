import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  GradientBackground,
  GlassSurface,
  GlassForm,
  GlassInput,
  GlassButton,
} from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import { useTheme } from "../../../theme";
import { normalizePhone } from "../../../utils/phone";

export default function LoginScreen() {
  const [phoneInput, setPhoneInput] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleLogin = async () => {
    setError("");
    const phone = normalizePhone(phoneInput);

    // if (!/^\+?[0-9]{10,15}$/.test(phone)) {
    //   setError('شماره موبایل معتبر نیست (مثال: 09123456789)');
    //   return;
    // }
    // if (password.length < 8) {
    //   setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
    //   return;
    // }

    setLoading(true);
    try {
      await login(phone, password);
      router.replace("/(tabs)/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "اطلاعات ورود نامعتبر است");
    } finally {
      setLoading(false);
    }
  };

  const scrollProps = {
    keyboardShouldPersistTaps: "always" as const,
    keyboardDismissMode: "none" as const,
    contentContainerStyle: {
      flexGrow: 1,
      justifyContent: "flex-start" as const,
      paddingHorizontal: 22,
      paddingTop: insets.top + 24,
      paddingBottom: insets.bottom + 24,
    },
    showsVerticalScrollIndicator: false,
  };

  const content = (
    <>
      {/* Brand hero */}
      <View style={{ alignItems: "center", marginBottom: 28 }}>
        <GlassSurface
          radius="xxl"
          intensity={70}
          elevated
          style={{ width: 84, height: 84, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="wallet" size={38} color={theme.tint} />
        </GlassSurface>

        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: theme.textPrimary,
            marginTop: 18,
          }}
        >
          نوابانک
        </Text>
        <Text style={{ fontSize: 15, color: theme.textSecondary, marginTop: 6 }}>
          بانکداری هوشمند، ساده و امن
        </Text>
      </View>

      {/* Login card */}
      <GlassForm style={{ padding: 22 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: theme.textPrimary,
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          ورود به حساب
        </Text>
        <Text
          style={{
            fontSize: 13.5,
            color: theme.textMuted,
            textAlign: "center",
            marginBottom: 22,
          }}
        >
          برای ادامه شماره موبایل و رمز عبور خود را وارد کنید
        </Text>

        <GlassInput
          label="شماره موبایل"
          icon="phone-portrait-outline"
          placeholder="09123456789"
          value={phoneInput}
          onChangeText={setPhoneInput}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <GlassInput
          label="رمز عبور"
          icon="lock-closed-outline"
          placeholder="••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          ref={passwordRef}
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />

        {error ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 14,
              padding: 10,
              borderRadius: 14,
              backgroundColor: "rgba(239,68,68,0.12)",
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.35)",
            }}
          >
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={{ color: "#ef4444", fontSize: 13, marginStart: 8, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        <GlassButton
          onPress={handleLogin}
          disabled={loading}
          loading={loading}
          icon="log-in-outline"
          size="lg"
          className="w-full"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </GlassButton>
      </GlassForm>

      <Pressable
        onPress={() => router.push("/(auth)/register")}
        style={{ marginTop: 20, alignItems: "center" }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
          حساب کاربری ندارید؟{" "}
          <Text style={{ color: theme.tint, fontWeight: "700" }}>ثبت نام کنید</Text>
        </Text>
      </Pressable>
    </>
  );

  const showKeyboardAvoiding = Platform.OS === "ios";

  return (
    <GradientBackground>
      {showKeyboardAvoiding ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView {...scrollProps}>{content}</ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView {...scrollProps}>{content}</ScrollView>
      )}
    </GradientBackground>
  );
}
