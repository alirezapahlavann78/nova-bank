import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  DataList,
  DataRow,
  GlassButton,
  GlassListCard,
  GradientBackground,
  MoneyText,
  ScreenHeader,
  ScreenState,
  StatusPill,
} from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useLoanProducts } from "../../hooks/useLoanProducts";
import { useTheme } from "../../theme";
import { fa } from "../../localization";
import { formatCurrency } from "../../utils/format";

export default function LoanProductsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { data: products, isLoading } = useLoanProducts(accessToken || "");

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

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={fa.lending.loanProducts}
          subtitle="شرایط و مبلغ وام را مقایسه کنید"
          onBack={() => router.back()}
        />

        {products.length === 0 ? (
          <ScreenState state="empty" message="محصول وامی در دسترس نیست" />
        ) : (
          <View style={styles.list}>
            {products.map((product) => (
              <GlassListCard key={product.id} level={2}>
                <View style={styles.header}>
                  <View style={styles.titleWrap}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                      {product.name}
                    </Text>
                    {product.description ? (
                      <Text style={[styles.description, { color: theme.textSecondary }]}>
                        {product.description}
                      </Text>
                    ) : null}
                  </View>
                  <StatusPill
                    label={product.isActive ? fa.lending.active : fa.lending.draft}
                    tone={product.isActive ? "positive" : "neutral"}
                  />
                </View>

                <DataList style={styles.data}>
                  <DataRow
                    label={fa.lending.interestRate}
                    value={<MoneyText size="sm">{`${product.interestRate}%`}</MoneyText>}
                  />
                  <DataRow
                    label={fa.lending.loanAmount}
                    value={
                      <MoneyText size="sm">
                        {`${formatCurrency(product.minAmount, product.currency)} - ${formatCurrency(
                          product.maxAmount,
                          product.currency,
                        )}`}
                      </MoneyText>
                    }
                  />
                  <DataRow
                    label={fa.lending.duration}
                    value={
                      <Text style={[styles.value, { color: theme.textPrimary }]}>
                        {product.durationMonths} ماه
                      </Text>
                    }
                  />
                  {product.requiredScoreBand ? (
                    <DataRow
                      label={`${fa.lending.score} مورد نیاز`}
                      value={
                        <Text style={[styles.value, { color: theme.textPrimary }]}>
                          {product.requiredScoreBand}
                        </Text>
                      }
                    />
                  ) : null}
                </DataList>

                <GlassButton
                  onPress={() => router.push(`/lending/application/new?productId=${product.id}`)}
                  variant="primary"
                >
                  {fa.lending.newApplication}
                </GlassButton>
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
  list: { gap: 14 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  titleWrap: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: "800" },
  description: { fontSize: 13, lineHeight: 20 },
  data: { marginBottom: 16 },
  value: { fontSize: 13.5, fontWeight: "700" },
});
