import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { PageHeader } from "@/components/PageHeader";
import { Button, Card, EmptyState, Screen, StatusBadge, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/utils";

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transactions, operators } = useStore();
  const t = transactions.find((x) => x.id === id);
  const op = t ? operators.find((o) => o.id === t.operatorId) : null;

  if (!t) {
    return (
      <Screen>
        <PageHeader title="Not found" />
        <EmptyState title="Transaction not found" icon="receipt-outline" />
      </Screen>
    );
  }

  const toneColors: Record<string, [string, string]> = {
    SUCCESS: ["#34D399", "#10B981"],
    PENDING: ["#FBBF24", "#F59E0B"],
    FAILED: ["#F87171", "#EF4444"],
  };
  const grad = toneColors[t.status] ?? ["#9CA3AF", "#6B7280"];

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="Transaction" subtitle={t.providerRef} />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={grad as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: radii.lg, padding: spacing.xl, alignItems: "center" }}
          >
            <View
              style={{
                height: 60,
                width: 60,
                borderRadius: 30,
                backgroundColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons
                name={t.status === "SUCCESS" ? "checkmark" : t.status === "PENDING" ? "time" : "close"}
                size={32}
                color="#fff"
              />
            </View>
            <Txt color="rgba(255,255,255,0.9)" size="sm" weight="700">{t.status}</Txt>
            <Txt color="#fff" size="display" weight="800" style={{ marginTop: 4 }}>{formatMoney(t.amount)}</Txt>
            <Txt color="rgba(255,255,255,0.9)" size="sm" style={{ marginTop: 4 }}>{op?.name ?? t.type}</Txt>
          </LinearGradient>

          <Card style={{ marginTop: spacing.lg }}>
            <Row label="Type" value={t.type} />
            <Row label="Operator" value={op?.name ?? "—"} />
            <Row label="Reference" value={t.reference} />
            <Row label="Provider ref" value={t.providerRef} mono />
            <Row label="When" value={formatDate(t.createdAt)} />
            <Row label="Message" value={t.message} last />
          </Card>

          {t.status === "FAILED" && (
            <Card style={{ marginTop: spacing.md, backgroundColor: colors.dangerSoft, borderWidth: 0 }}>
              <Txt size="sm" color={colors.danger} weight="700">Payment failed</Txt>
              <Txt size="xs" style={{ marginTop: 2 }} color={colors.danger}>No amount was deducted. You can retry anytime.</Txt>
            </Card>
          )}
          {t.status === "PENDING" && (
            <Card style={{ marginTop: spacing.md, backgroundColor: colors.warnSoft, borderWidth: 0 }}>
              <Txt size="sm" color={colors.warn} weight="700">Awaiting provider confirmation</Txt>
              <Txt size="xs" style={{ marginTop: 2 }} color="#8a6d2c">Final status will update when the provider responds.</Txt>
            </Card>
          )}

          <Button
            title="Back to history"
            variant="outline"
            fullWidth
            style={{ marginTop: spacing.lg }}
            leftIcon="arrow-back"
            onPress={() => router.replace("/(tabs)/history")}
          />
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function Row({ label, value, mono, last }: { label: string; value?: string | null; mono?: boolean; last?: boolean }) {
  return (
    <View
      style={{
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Txt size="xs" muted weight="600">{label.toUpperCase()}</Txt>
      <Txt size="sm" weight="600" style={{ marginTop: 2, fontFamily: mono ? "monospace" : undefined }}>
        {value || "—"}
      </Txt>
    </View>
  );
}
