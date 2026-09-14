import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  DataList,
  DataRow,
  GlassListCard,
  GradientBackground,
  MoneyText,
  ProgressBar,
  ScreenHeader,
  ScreenState,
  StatusPill,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useBudgets } from "../../hooks/useBudgets";
import { useTheme, accent } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import { formatCurrency } from "../../utils/format";

export default function BudgetsScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { data: budgets, isLoading, error, refetch } = useBudgets(accessToken || "");
  const router = useRouter();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={t("common.loading")} />
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <ScreenState state="error" title={t("common.error")} />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ScreenHeader
            title={t("budget.budget")}
            subtitle={`${budgets.length} بودجه فعال`}
            onBack={() => router.back()}
          />
        }
        ListEmptyComponent={
          <ScreenState
            state="empty"
            message="هنوز بودجه‌ای ثبت نشده است"
            action={t("common.save")}
            onAction={() => router.push("/budgets/new")}
          />
        }
        renderItem={({ item }) => {
          const progress = Math.round(item.percentageUsed);

          return (
            <Pressable onPress={() => router.push(`/budgets/${item.id}`)}>
              <GlassListCard level={2}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleWrap}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>{item.name}</Text>
                    {item.category ? (
                      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {item.category.name}
                      </Text>
                    ) : null}
                  </View>
                  <StatusPill
                    label={item.exceeded ? t("budget.exceeded") : `${progress}%`}
                    tone={item.exceeded ? "negative" : progress >= 80 ? "warning" : "positive"}
                  />
                </View>

                <ProgressBar
                  progress={progress}
                  tone={item.exceeded ? "negative" : progress >= 80 ? "default" : "positive"}
                />

                <DataList style={styles.cardData}>
                  <DataRow
                    label={t("budget.spent")}
                    value={
                      <MoneyText
                        size="sm"
                        tone={item.exceeded ? "negative" : "default"}
                      >
                        {formatCurrency(item.spent, item.currency)}
                      </MoneyText>
                    }
                  />
                  <DataRow
                    label="باقیمانده"
                    value={
                      <MoneyText
                        size="sm"
                        tone={item.remaining < 0 ? "negative" : "positive"}
                      >
                        {formatCurrency(item.remaining, item.currency)}
                      </MoneyText>
                    }
                  />
                  <DataRow
                    label={t("budget.amount")}
                    value={
                      <MoneyText size="sm">
                        {formatCurrency(item.amount, item.currency)}
                      </MoneyText>
                    }
                  />
                </DataList>
              </GlassListCard>
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => router.push("/budgets/new")}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: accent[500], opacity: pressed ? 0.86 : 1 },
        ]}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 104, gap: 12 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  titleWrap: { flex: 1, gap: 3 },
  title: { fontSize: 17, fontWeight: "800" },
  subtitle: { fontSize: 13 },
  cardData: { marginTop: 14 },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});
