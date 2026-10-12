import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { Button, Card, Screen, StatusBadge, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/utils";

export default function ProfileTab() {
  const router = useRouter();
  const { currentUser, signOut, listings, serviceRequests, transactions, inquiries, providers, reset } =
    useStore();

  const myListings = listings.filter((l) => l.sellerId === currentUser?.id);
  const myRequests = serviceRequests.filter((r) => r.userId === currentUser?.id);
  const myTxns = transactions.filter((t) => t.userId === currentUser?.id);
  const myInquiries = inquiries.filter((i) => i.buyerId === currentUser?.id);

  async function doSignOut() {
    await signOut();
    router.replace("/(auth)/login");
  }

  if (!currentUser) {
    return (
      <Screen>
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
          <Txt size="lg">Not signed in.</Txt>
          <Button title="Go to login" onPress={() => router.replace("/(auth)/login")} style={{ marginTop: 12 }} />
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <LinearGradient
          colors={[colors.brand, colors.brandDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: spacing.lg, paddingTop: 60, paddingBottom: 70, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <SafeAreaView edges={["top"]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View
                style={{
                  height: 64,
                  width: 64,
                  borderRadius: 32,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Txt color="#fff" size="xxl" weight="800">
                  {currentUser.name[0]}
                </Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt color="#fff" size="xl" weight="700">{currentUser.name}</Txt>
                <Txt color="rgba(255,255,255,0.8)" size="xs">{currentUser.email}</Txt>
                <View style={{ marginTop: 6, flexDirection: "row", gap: 6 }}>
                  <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                    <Txt color="#fff" size="xs" weight="700">{currentUser.role}</Txt>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={{ padding: spacing.lg, marginTop: -40 }}>
          <Card style={{ padding: 14 }}>
            <View style={{ flexDirection: "row" }}>
              <Stat label="Txns" value={myTxns.length} />
              <Stat label="Listings" value={myListings.length} />
              <Stat label="Requests" value={myRequests.length} />
              <Stat label="Inquiries" value={myInquiries.length} />
            </View>
          </Card>
        </View>

        <Section title="My listings" actionLabel="+ New" onAction={() => router.push("/marketplace/new")}>
          {myListings.length === 0 ? (
            <EmptyMini text="No listings yet." />
          ) : (
            myListings.map((l) => (
              <Pressable key={l.id} onPress={() => router.push(`/marketplace/${l.id}`)}>
                <Card style={{ padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Txt size="sm" weight="700">{l.title}</Txt>
                    <Txt size="xs" muted style={{ marginTop: 2 }}>{l.type} · {formatMoney(l.price)}</Txt>
                  </View>
                  <StatusBadge status={l.status ?? "ACTIVE"} />
                </Card>
              </Pressable>
            ))
          )}
        </Section>

        <Section title="My service requests">
          {myRequests.length === 0 ? (
            <EmptyMini text="No requests yet." />
          ) : (
            myRequests.map((r) => {
              const p = providers.find((pp) => pp.id === r.providerId);
              return (
                <Card key={r.id} style={{ padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Txt size="sm" weight="700">{p?.name ?? "Provider"}</Txt>
                    <Txt size="xs" muted style={{ marginTop: 2 }}>{formatDate(r.createdAt)} · {r.location}</Txt>
                  </View>
                  <StatusBadge status={r.status} />
                </Card>
              );
            })
          )}
        </Section>

        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md, gap: 8 }}>
          <Button title="Sign out" variant="outline" fullWidth leftIcon="log-out-outline" onPress={doSignOut} />
          <Pressable
            onPress={async () => {
              await reset();
              router.replace("/(auth)/login");
            }}
          >
            <Txt size="xs" muted style={{ textAlign: "center", marginTop: spacing.md }}>
              Reset demo data
            </Txt>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Txt size="xl" weight="800">{value}</Txt>
      <Txt size="xs" muted>{label}</Txt>
    </View>
  );
}

function Section({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Txt size="lg" weight="700">{title}</Txt>
        {actionLabel ? (
          <Pressable onPress={onAction}>
            <Txt size="xs" weight="700" color={colors.brand}>{actionLabel}</Txt>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function EmptyMini({ text }: { text: string }) {
  return (
    <View style={{ padding: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed" }}>
      <Txt size="sm" muted>{text}</Txt>
    </View>
  );
}
