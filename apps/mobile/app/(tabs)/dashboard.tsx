import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  GradientBackground,
  GlassSurface,
  GlassIconButton,
  GlassPill,
  GlassCard,
  SectionHeader,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../theme";

type QuickAction = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route?: string;
  tint: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "تحلیل مالی", icon: "stats-chart", route: "/analytics", tint: "#7c3aed" },
  { label: "سرمایه‌گذاری", icon: "trending-up", route: "/investments", tint: "#0d9488" },
  { label: "پرداخت‌ها", icon: "card", route: "/payments", tint: "#0891b2" },
  { label: "بودجه‌ها", icon: "pie-chart", route: "/budgets", tint: "#7c3aed" },
  { label: "اهداف", icon: "flag", route: "/goals", tint: "#f59e0b" },
  { label: "اعلان‌ها", icon: "notifications", route: "/notifications", tint: "#ef4444" },
];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const displayName = user?.firstName || user?.phone || "کاربر نوابانک";
  const initials = (user?.firstName?.[0] ?? "ن") + (user?.lastName?.[0] ?? "");

  return (
    <GradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 120,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            marginBottom: 18,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <GlassSurface
              radius="pill"
              intensity={55}
              style={{ width: 46, height: 46, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: theme.tint, fontWeight: "800", fontSize: 16 }}>{initials}</Text>
            </GlassSurface>
            <View>
              <Text style={{ fontSize: 12.5, color: theme.textMuted }}>خوش آمدید</Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: theme.textPrimary }}>
                {displayName}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <GlassIconButton
              icon="notifications-outline"
              onPress={() => router.push("/notifications")}
            />
            <GlassIconButton icon="log-out" onPress={logout} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ overflow: "hidden", borderRadius: 20 }}>
            <LinearGradient
              colors={["#7c3aed", "#4f46e5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 22 }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: -60,
                  right: -30,
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                  backgroundColor: "rgba(255,255,255,0.18)",
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5 }}>موجودی کل</Text>
                <Ionicons name="eye-outline" size={18} color="rgba(255,255,255,0.85)" />
              </View>

              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 34,
                  fontWeight: "800",
                  marginTop: 10,
                  letterSpacing: 0.5,
                }}
              >
                ‎— ۰ تومان
              </Text>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
                <Pressable style={{ flex: 1 }} onPress={() => router.push("/payments/new")}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 11,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.22)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <Ionicons name="add" size={17} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13.5 }}>واریز</Text>
                  </View>
                </Pressable>

                <Pressable style={{ flex: 1 }} onPress={() => router.push("/payments/new")}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 11,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.22)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <Ionicons name="swap-horizontal" size={17} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13.5 }}>انتقال</Text>
                  </View>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20, marginTop: 18 }}>
          <GlassPill icon="shield-checkmark" tint="#10b981">
            امن
          </GlassPill>
          <GlassPill icon="flash" tint="#f59e0b">
            فعال
          </GlassPill>
          <GlassPill icon="star" tint="#7c3aed">
            نسخه آزمایشی
          </GlassPill>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
          <SectionHeader title="دسترسی سریع" />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {QUICK_ACTIONS.map((action) => (
              <GlassCard
                key={action.label}
                style={{ width: "47.5%", padding: 16, minHeight: 100 }}
                onPress={() => action.route && router.push(action.route as never)}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${action.tint}22`,
                    borderWidth: 1,
                    borderColor: `${action.tint}44`,
                  }}
                >
                  <Ionicons name={action.icon} size={20} color={action.tint} />
                </View>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 14.5,
                    fontWeight: "700",
                    color: theme.textPrimary,
                  }}
                >
                  {action.label}
                </Text>
              </GlassCard>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
          <SectionHeader
            title="فعالیت اخیر"
            action="همه"
            onAction={() => router.push("/payments")}
          />
          <GlassCard style={{ padding: 20 }}>
            <View style={{ alignItems: "center", paddingVertical: 14 }}>
              <Ionicons name="receipt-outline" size={30} color={theme.iconMuted} />
              <Text style={{ color: theme.textSecondary, marginTop: 10, fontSize: 14 }}>
                هنوز تراکنشی ثبت نشده است
              </Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
