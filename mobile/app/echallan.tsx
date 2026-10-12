import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { PageHeader } from "@/components/PageHeader";
import { Button, Card, EmptyState, Field, Input, Screen, StatusBadge, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { lookupMockChallan, submitMockTransaction } from "@/lib/mock-provider";
import { useStore } from "@/lib/store";
import { formatMoney, shortDate } from "@/lib/utils";

export default function EChallan() {
  const router = useRouter();
  const { addTransaction, transactions, currentUser } = useStore();
  const [vehicle, setVehicle] = useState("GJ01AB1234");
  const [result, setResult] = useState<null | ReturnType<typeof lookupMockChallan>>(null);
  const [paid, setPaid] = useState<string | null>(null);
  const [err, setErr] = useState("");

  function search() {
    setErr("");
    setPaid(null);
    const r = lookupMockChallan(vehicle);
    if (r === null) {
      setErr("Vehicle number format invalid. Try GJ01AB1234.");
      setResult(null);
      return;
    }
    setResult(r);
  }

  function pay(c: { challanNumber: string; amount: number; description: string }) {
    if (!currentUser) return router.replace("/(auth)/login");
    const r = submitMockTransaction({ type: "ECHALLAN", amount: c.amount, reference: c.challanNumber });
    const txn = addTransaction({
      type: "ECHALLAN",
      amount: c.amount,
      reference: c.challanNumber,
      status: r.status,
      providerRef: r.providerRef,
      message: r.message,
    });
    setPaid(c.challanNumber);
    setTimeout(() => router.push(`/transactions/${txn.id}`), 400);
  }

  const myChallanTxns = transactions.filter((t) => t.userId === currentUser?.id && t.type === "ECHALLAN").slice(0, 5);

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="E-challan" subtitle="Pending traffic challans" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 4 }} keyboardShouldPersistTaps="handled">
            <LinearGradient
              colors={["#DDD6FE", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: radii.lg, padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View style={{ height: 44, width: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="car-sport" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Txt color="#fff" size="md" weight="700">Check pending challans</Txt>
                <Txt color="rgba(255,255,255,0.9)" size="xs" style={{ marginTop: 2 }}>Lookup by registration number</Txt>
              </View>
            </LinearGradient>

            <Card style={{ marginTop: spacing.md }}>
              <Field label="Vehicle number">
                <Input value={vehicle} onChangeText={setVehicle} autoCapitalize="characters" placeholder="GJ01AB1234" />
              </Field>
              {err ? <Txt size="sm" color={colors.danger} style={{ marginBottom: 8 }}>{err}</Txt> : null}
              <Button title="Check challans" onPress={search} fullWidth leftIcon="search" />
            </Card>

            {result !== null && result.length === 0 && (
              <Card style={{ marginTop: spacing.md, backgroundColor: colors.successSoft, borderWidth: 0, flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Txt size="sm" color={colors.success} weight="700">No pending challans for {vehicle}.</Txt>
              </Card>
            )}

            {result && result.length > 0 && (
              <View style={{ marginTop: spacing.md, gap: 10 }}>
                {result.map((c) => (
                  <Card key={c.challanNumber}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1 }}>
                        <Txt size="sm" weight="700">{c.description}</Txt>
                        <Txt size="xs" muted style={{ marginTop: 2 }}>Challan {c.challanNumber}</Txt>
                      </View>
                      <Txt size="md" weight="800">{formatMoney(c.amount)}</Txt>
                    </View>
                    <Button
                      title={paid === c.challanNumber ? "Processing…" : "Pay now"}
                      onPress={() => pay(c)}
                      fullWidth
                      style={{ marginTop: 10 }}
                      leftIcon="card"
                    />
                  </Card>
                ))}
              </View>
            )}

            <Card style={{ marginTop: spacing.md, backgroundColor: colors.warnSoft, borderWidth: 0, flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
              <Ionicons name="information-circle" size={18} color={colors.warn} />
              <Txt size="xs" color="#8a6d2c" style={{ flex: 1 }}>
                If no authorised API exists for a jurisdiction, production links out to the official portal instead of paying in-app.
              </Txt>
            </Card>

            {myChallanTxns.length > 0 && (
              <>
                <Txt size="lg" weight="700" style={{ marginTop: spacing.xl, marginBottom: 8 }}>Recent challan payments</Txt>
                <Card style={{ padding: 0 }}>
                  {myChallanTxns.map((t, i) => (
                    <Pressable
                      key={t.id}
                      onPress={() => router.push(`/transactions/${t.id}`)}
                      style={{ padding: 14, borderBottomWidth: i === myChallanTxns.length - 1 ? 0 : 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center" }}
                    >
                      <View style={{ flex: 1 }}>
                        <Txt size="sm" weight="700">Challan {t.reference}</Txt>
                        <Txt size="xs" muted>{shortDate(t.createdAt)}</Txt>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <Txt size="sm" weight="700">{formatMoney(t.amount)}</Txt>
                        <StatusBadge status={t.status} />
                      </View>
                    </Pressable>
                  ))}
                </Card>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}
