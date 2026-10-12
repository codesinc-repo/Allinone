import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PageHeader } from "@/components/PageHeader";
import { Button, Card, EmptyState, Field, Input, Screen, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { fetchMockBill, submitMockTransaction } from "@/lib/mock-provider";
import { formatMoney } from "@/lib/utils";
import type { Operator } from "@/lib/types";

const CONFIG: Record<
  string,
  { label: string; opType: Operator["type"]; refLabel: string; helper: string; fetchBill: boolean; quickAmounts?: number[] }
> = {
  mobile: {
    label: "Mobile recharge",
    opType: "MOBILE",
    refLabel: "Mobile number",
    helper: "10-digit number",
    fetchBill: false,
    quickAmounts: [149, 199, 299, 599, 999],
  },
  dth: {
    label: "DTH / Dish recharge",
    opType: "DTH",
    refLabel: "Customer / smart-card number",
    helper: "DTH account identifier",
    fetchBill: false,
    quickAmounts: [250, 450, 999],
  },
  fastag: {
    label: "FASTag recharge",
    opType: "FASTAG",
    refLabel: "Vehicle / Tag number",
    helper: "Vehicle registration or tag ID",
    fetchBill: false,
    quickAmounts: [250, 500, 1000, 2000],
  },
  electricity: {
    label: "Electricity bill",
    opType: "ELECTRICITY",
    refLabel: "Consumer number",
    helper: "From your utility bill",
    fetchBill: true,
  },
  loan: {
    label: "Loan EMI",
    opType: "LOAN",
    refLabel: "Loan account number",
    helper: "From your loan statement",
    fetchBill: true,
  },
  "credit-card": {
    label: "Credit card bill",
    opType: "CREDIT_CARD",
    refLabel: "Last 4 digits of card",
    helper: "Payment is tokenised — card data is never stored",
    fetchBill: false,
  },
};

export default function RechargeType() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const { operators, addTransaction, currentUser } = useStore();
  const cfg = CONFIG[type ?? ""];
  const availableOps = useMemo(() => (cfg ? operators.filter((o) => o.type === cfg.opType) : []), [operators, cfg]);

  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [bill, setBill] = useState<null | { amount: number; billerName: string; dueDate: string }>(null);
  const [err, setErr] = useState("");

  if (!cfg) {
    return (
      <Screen>
        <PageHeader title="Not found" />
        <EmptyState title="Unknown recharge type" icon="help-circle-outline" />
      </Screen>
    );
  }

  function doFetchBill() {
    setErr("");
    if (!reference.trim()) {
      setErr("Enter a reference number first");
      return;
    }
    const b = fetchMockBill({ type: cfg.opType, reference });
    if (!b) {
      setErr("Provider could not find that account");
      return;
    }
    setBill(b);
    setAmount(String(b.amount));
  }

  function submit() {
    setErr("");
    if (!currentUser) {
      router.replace("/(auth)/login");
      return;
    }
    if (!operatorId) return setErr("Select an operator");
    if (!reference.trim()) return setErr("Enter a reference");
    const amt = Number(amount);
    if (!amt || amt <= 0) return setErr("Enter a valid amount");

    const result = submitMockTransaction({ type: cfg.opType, amount: amt, reference });
    const txn = addTransaction({
      operatorId,
      type: cfg.opType,
      amount: amt,
      reference,
      status: result.status,
      providerRef: result.providerRef,
      message: result.message,
    });
    router.replace(`/transactions/${txn.id}`);
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title={cfg.label} subtitle={cfg.helper} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 4 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {err ? (
              <Card style={{ backgroundColor: colors.dangerSoft, borderWidth: 0, marginBottom: spacing.md }}>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <Ionicons name="alert-circle" color={colors.danger} size={16} />
                  <Txt size="sm" color={colors.danger}>{err}</Txt>
                </View>
              </Card>
            ) : null}

            {/* Operator picker */}
            <Field label="Operator">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {availableOps.map((o) => (
                  <Pressable
                    key={o.id}
                    onPress={() => setOperatorId(o.id)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: radii.md,
                      backgroundColor: operatorId === o.id ? colors.brandSoft : colors.surface,
                      borderWidth: 1,
                      borderColor: operatorId === o.id ? colors.brand : colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Txt size="md">{o.icon}</Txt>
                    <Txt size="sm" weight="600">{o.name}</Txt>
                  </Pressable>
                ))}
              </ScrollView>
            </Field>

            <Field label={cfg.refLabel}>
              <Input value={reference} onChangeText={setReference} placeholder="e.g. 9811111111" autoCapitalize="characters" />
              <Txt size="xs" muted style={{ marginTop: 6 }}>
                Try ending with 0000 to see a mock failure.
              </Txt>
            </Field>

            {cfg.fetchBill && (
              <>
                {bill ? (
                  <Card style={{ marginBottom: spacing.md, backgroundColor: colors.brandSoft, borderWidth: 0 }}>
                    <Txt size="xs" muted>From {bill.billerName}</Txt>
                    <Txt size="xl" weight="800" style={{ marginTop: 4 }}>{formatMoney(bill.amount)}</Txt>
                    <Txt size="xs" muted style={{ marginTop: 2 }}>Due by {bill.dueDate}</Txt>
                  </Card>
                ) : (
                  <Button title="Fetch bill details" variant="outline" leftIcon="search" onPress={doFetchBill} fullWidth style={{ marginBottom: spacing.md }} />
                )}
              </>
            )}

            <Field label="Amount (₹)">
              <Input value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="0" />
              {cfg.quickAmounts && (
                <View style={{ flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {cfg.quickAmounts.map((n) => (
                    <Pressable
                      key={n}
                      onPress={() => setAmount(String(n))}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: radii.pill,
                        backgroundColor: amount === String(n) ? colors.brand : colors.surface,
                        borderWidth: 1,
                        borderColor: amount === String(n) ? colors.brand : colors.border,
                      }}
                    >
                      <Txt size="xs" weight="700" color={amount === String(n) ? "#fff" : colors.text}>
                        ₹{n}
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              )}
            </Field>

            <Button
              title={`Pay ${amount ? formatMoney(Number(amount)) : "securely"}`}
              onPress={submit}
              fullWidth
              size="lg"
              leftIcon="lock-closed"
            />
            <Txt size="xs" muted style={{ textAlign: "center", marginTop: 10 }}>
              Secure payment via mock aggregator · never stores raw card data
            </Txt>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}
