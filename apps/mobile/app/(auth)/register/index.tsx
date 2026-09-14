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
  GlassIconButton,
} from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import { useTheme } from "../../../theme";
import { normalizePhone, isValidPhone } from "../../../utils/phone";

export default function RegisterScreen() {
  const [phoneInput, setPhoneInput] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const { register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleRegister = async () => {
    setError("");
    const phone = normalizePhone(phoneInput);

    if (!isValidPhone(phone)) {
      setError("شماره موبایل معتبر نیست (مثال: 09123456789)");
      return;
    }
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }
    setLoading(true);
    try {
      await register(
        phone,
        password,
        undefined,
        firstName.trim() || undefined,
        lastName.trim() || undefined
      );
      router.replace("/(tabs)/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت ناموفق بود");
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
      paddingTop: insets.top + 16,
      paddingBottom: insets.bottom + 24,
    },
    showsVerticalScrollIndicator: false,
  };

  const content = (
    <>
      <View style={{ alignItems: "flex-start", marginBottom: 18 }}>
        <GlassIconButton icon="arrow-forward" onPress={() => router.back()} size={42} />
      </View>

      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <GlassSurface
          radius="xxl"
          intensity={70}
          elevated
          style={{ width: 72, height: 72, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="person-add" size={32} color={theme.tint} />
        </GlassSurface>
        <Text style={{ fontSize: 27, fontWeight: "800", color: theme.textPrimary, marginTop: 16 }}>
          ساخت حساب جدید
        </Text>
        <Text style={{ fontSize: 14.5, color: theme.textSecondary, marginTop: 6 }}>
          کمتر از یک دقیقه زمان می‌برد
        </Text>
      </View>

      <GlassForm style={{ padding: 22 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <GlassInput
            label="نام"
            placeholder="نام"
            value={firstName}
            onChangeText={setFirstName}
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
            containerStyle={{ flex: 1 }}
          />
          <GlassInput
            label="نام خانوادگی"
            placeholder="نام خانوادگی"
            value={lastName}
            onChangeText={setLastName}
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            ref={lastNameRef}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <GlassInput
          label="شماره موبایل"
          icon="phone-portrait-outline"
          placeholder="09123456789"
          value={phoneInput}
          onChangeText={setPhoneInput}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          ref={phoneRef}
        />

        <GlassInput
          label="رمز عبور"
          icon="lock-closed-outline"
          placeholder="حداقل ۸ کاراکتر"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          ref={passwordRef}
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
          onPress={handleRegister}
          disabled={loading}
          loading={loading}
          icon="person-add-outline"
          size="lg"
          className="w-full"
        >
          {loading ? "در حال ثبت نام..." : "ثبت نام"}
        </GlassButton>
      </GlassForm>

      <Pressable
        onPress={() => router.replace("/(auth)/login")}
        style={{ marginTop: 20, alignItems: "center" }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
          حساب دارید؟ <Text style={{ color: theme.tint, fontWeight: "700" }}>وارد شوید</Text>
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
