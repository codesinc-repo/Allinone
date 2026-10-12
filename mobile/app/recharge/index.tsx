import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { PageHeader } from "@/components/PageHeader";
import { Card, Screen, Txt } from "@/components/ui";
import { colors, radii, shadow, spacing } from "@/lib/theme";

const SERVICES = [
  { type: "mobile", title: "Mobile", desc: "Prepaid & postpaid", icon: "phone-portrait", gradient: ["#FDE68A", "#F59E0B"] as const },
  { type: "dth", title: "DTH / Dish", desc: "TV recharge", icon: "tv", gradient: ["#C7D2FE", "#6366F1"] as const },
  { type: "fastag", title: "FASTag", desc: "Highway toll tag", icon: "car", gradient: ["#BAE6FD", "#0EA5E9"] as const },
  { type: "electricity", title: "Electricity", desc: "Pay power bills", icon: "flash", gradient: ["#FBCFE8", "#EC4899"] as const },
  { type: "loan", title: "Loan EMI", desc: "Loan repayment", icon: "business", gradient: ["#A7F3D0", "#10B981"] as const },
  { type: "credit-card", title: "Credit Card", desc: "Pay card bills", icon: "card", gradient: ["#DDD6FE", "#8B5CF6"] as const },
];

export default function RechargeHome() {
  const router = useRouter();
  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="Recharge & Bills" subtitle="All your bill payments" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {SERVICES.map((s) => (
              <Pressable
                key={s.type}
                onPress={() => router.push(`/recharge/${s.type}`)}
                style={{ width: "48%" }}
              >
                <View style={{ borderRadius: radii.lg, backgroundColor: colors.surface, overflow: "hidden", ...shadow.card }}>
                  <LinearGradient
                    colors={s.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ height: 72, padding: 14, flexDirection: "row", alignItems: "center" }}
                  >
                    <View
                      style={{
                        height: 42,
                        width: 42,
                        borderRadius: 12,
                        backgroundColor: "rgba(255,255,255,0.3)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name={s.icon as any} size={22} color="#fff" />
                    </View>
                  </LinearGradient>
                  <View style={{ padding: 12 }}>
                    <Txt size="md" weight="700">{s.title}</Txt>
                    <Txt size="xs" muted style={{ marginTop: 2 }}>{s.desc}</Txt>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
          <Card style={{ marginTop: spacing.lg, backgroundColor: colors.warnSoft, borderWidth: 0 }}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Ionicons name="information-circle" size={20} color={colors.warn} />
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="700" color={colors.warn}>Demo mode</Txt>
                <Txt size="xs" style={{ marginTop: 2 }} color="#8a6d2c">
                  Payments route through a mock aggregator so flows are testable end to end.
                  Try reference ending in <Txt size="xs" weight="700">0000</Txt> to see a failure.
                </Txt>
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
