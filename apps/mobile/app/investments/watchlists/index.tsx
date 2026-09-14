import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  DataList,
  DataRow,
  GlassButton,
  GlassForm,
  GlassIconButton,
  GlassInput,
  GlassListCard,
  GradientBackground,
  MoneyText,
  ScreenHeader,
  ScreenState,
  StatusPill,
} from "../../../components/ui";
import { useAuth } from "../../../hooks/useAuth";
import { useWatchlists } from "../../../hooks/useInvestments";
import { createWatchlist } from "../../../services/investments";
import { useTheme } from "../../../theme";
import { fa } from "../../../localization";
import { formatCurrency } from "../../../utils/format";

export default function WatchlistsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data, isLoading, error, refetch } = useWatchlists(accessToken || "");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreateWatchlist = async () => {
    if (!accessToken || !newName.trim()) return;
    setSaving(true);
    try {
      await createWatchlist(accessToken, { name: newName.trim() });
      setNewName("");
      setCreating(false);
      await refetch();
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "ثبت دیده‌بان انجام نشد";
      Alert.alert(fa.common.error, message);
    } finally {
      setSaving(false);
    }
  };

  if (!accessToken) {
    router.replace("/(auth)/login");
    return null;
  }

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenState state="loading" title={fa.common.loading} />
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <ScreenState state="error" title={fa.common.error} message={error.message} />
      </GradientBackground>
    );
  }

  const watchlists = data?.data || [];

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={fa.investment.watchlists}
          subtitle={`${watchlists.length} دیده‌بان`}
          onBack={() => router.back()}
          right={<GlassIconButton icon="add" onPress={() => setCreating(true)} size={40} />}
        />

        {creating ? (
          <GlassForm
            style={styles.createForm}
            footer={
              <GlassButton onPress={handleCreateWatchlist} disabled={saving}>
                {saving ? "در حال ذخیره..." : fa.common.save}
              </GlassButton>
            }
          >
            <GlassInput
              label={fa.investment.createWatchlist}
              value={newName}
              onChangeText={(value: string) => setNewName(value)}
              placeholder={fa.investment.name}
            />
          </GlassForm>
        ) : null}

        {watchlists.length === 0 && !creating ? (
          <ScreenState
            state="empty"
            message={fa.investment.noWatchlists}
            action={fa.investment.createWatchlist}
            onAction={() => setCreating(true)}
          />
        ) : (
          <View style={styles.list}>
            {watchlists.map((watchlist) => (
              <GlassListCard key={watchlist.id} level={2}>
                <View style={styles.header}>
                  <View style={styles.titleWrap}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                      {watchlist.name}
                    </Text>
                    {watchlist.description ? (
                      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {watchlist.description}
                      </Text>
                    ) : null}
                  </View>
                  <StatusPill
                    label={`${watchlist.items?.length ?? 0} نماد`}
                    tone="info"
                  />
                </View>

                {watchlist.items?.length ? (
                  <DataList>
                    {watchlist.items.map((item) => {
                      const isPositive = item.dailyChange >= 0;
                      return (
                        <DataRow
                          key={item.id}
                          label={item.asset?.symbol || "نماد"}
                          value={
                            <View style={styles.itemValue}>
                              <MoneyText size="sm">
                                {item.currentPrice
                                  ? formatCurrency(item.currentPrice, item.asset?.currency || "USD")
                                  : "-"}
                              </MoneyText>
                              <Text
                                style={[
                                  styles.change,
                                  { color: isPositive ? theme.success : theme.danger },
                                ]}
                              >
                                {isPositive ? "+" : ""}
                                {item.dailyChange.toFixed(2)}%
                              </Text>
                            </View>
                          }
                        />
                      );
                    })}
                  </DataList>
                ) : (
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    {fa.investment.noHoldings}
                  </Text>
                )}
              </GlassListCard>
            ))}
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  createForm: { marginBottom: 16 },
  list: { gap: 14 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  titleWrap: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: "800" },
  subtitle: { fontSize: 13 },
  itemValue: { alignItems: "flex-end", gap: 2 },
  change: { fontSize: 12.5, fontWeight: "700" },
  emptyText: { fontSize: 13.5, textAlign: "center" },
});
