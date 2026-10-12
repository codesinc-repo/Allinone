import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Card, EmptyState, Screen, StatusBadge, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatMoney, shortDate } from "@/lib/utils";

export default function HistoryTab() {
  const router = useRouter();
  const { transactions, currentUser, operators } = useStore();
  const [filter, setFilter] = useState<string | null>(null);

  const myTxns = transactions
    .filter((t) => t.userId === currentUser?.id)
    .filter((t) => (filter ? t.status === filter : true));

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
        <Txt size="xxl" weight="800">Transaction history</Txt>
        <Txt size="sm" muted>Every payment with a traceable reference</Txt>
      </SafeAreaView>

      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
        {(["SUCCESS", "PENDING", "FAILED"] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setFilter(filter === s ? null : s)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: radii.pill,
              backgroundColor: filter === s ? colors.brand : colors.surface,
              borderWidth: 1,
              borderColor: filter === s ? colors.brand : colors.border,
            }}
          >
            <Txt size="xs" weight="600" color={filter === s ? "#fff" : colors.text}>{s}</Txt>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md }} showsVerticalScrollIndicator={false}>
        {myTxns.length === 0 ? (
          <EmptyState title="No transactions yet" subtitle="Try a recharge or bill payment to see history here." icon="receipt-outline" />
        ) : (
          <Card style={{ padding: 0 }}>
            {myTxns.map((t, i) => {
              const op = operators.find((o) => o.id === t.operatorId);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => router.push(`/transactions/${t.id}`)}
                  style={{
                    padding: 14,
                    borderBottomWidth: i === myTxns.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: 12,
                      backgroundColor: colors.brandSoft,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Txt size="md">{op?.icon ?? "⚡"}</Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt size="sm" weight="700">{op?.name ?? t.type}</Txt>
                    <Txt size="xs" muted style={{ marginTop: 2 }}>Ref {t.reference}</Txt>
                    <Txt size="xs" muted>{shortDate(t.createdAt)}</Txt>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Txt size="md" weight="700">{formatMoney(t.amount)}</Txt>
                    <StatusBadge status={t.status} />
                  </View>
                </Pressable>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
