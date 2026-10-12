import { Pressable, ScrollView, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, Screen, StatusBadge, Txt } from "@/components/ui";
import { colors, radii, shadow, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatMoney, shortDate } from "@/lib/utils";

const MODULES = [
  { key: "recharge", label: "Recharge", icon: "flash", href: "/recharge", gradient: ["#FDE68A", "#F59E0B"] as const },
  { key: "shop", label: "Marketplace", icon: "cart", href: "/(tabs)/marketplace", gradient: ["#FBCFE8", "#EC4899"] as const },
  { key: "services", label: "Home Services", icon: "construct", href: "/(tabs)/services", gradient: ["#A7F3D0", "#10B981"] as const },
  { key: "property", label: "Property", icon: "home", href: "/property", gradient: ["#C7D2FE", "#6366F1"] as const },
  { key: "vehicles", label: "Vehicles", icon: "car-sport", href: "/vehicles", gradient: ["#BAE6FD", "#0EA5E9"] as const },
  { key: "echallan", label: "E-challan", icon: "receipt", href: "/echallan", gradient: ["#DDD6FE", "#8B5CF6"] as const },
  { key: "directory", label: "Find Here", icon: "location", href: "/find-here", gradient: ["#FECACA", "#F43F5E"] as const },
  { key: "profile", label: "Profile", icon: "person-circle", href: "/(tabs)/profile", gradient: ["#E5E7EB", "#6B7280"] as const },
] as const;

export default function HomeTab() {
  const router = useRouter();
  const { currentUser, transactions, listings, providers } = useStore();
  const myTxns = transactions.filter((t) => t.userId === currentUser?.id).slice(0, 3);
  const featuredListings = listings.filter((l) => l.type === "PRODUCT").slice(0, 6);
  const topProviders = [...providers].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero */}
        <LinearGradient
          colors={[colors.brand, colors.brandDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: 70, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <SafeAreaView edges={["top"]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Txt color="rgba(255,255,255,0.75)" size="xs">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </Txt>
                <Txt color="#fff" size="xl" weight="700" style={{ marginTop: 2 }}>
                  Hi, {currentUser?.name.split(" ")[0] ?? "there"} 👋
                </Txt>
              </View>
              <Pressable
                onPress={() => router.push("/(tabs)/profile")}
                style={{
                  height: 42,
                  width: 42,
                  borderRadius: 21,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="person" size={20} color="#fff" />
              </Pressable>
            </View>
            <Txt color="#fff" size="xxl" weight="800" style={{ marginTop: 18 }}>
              Everything you need{"\n"}in one app
            </Txt>
            <Txt color="rgba(255,255,255,0.85)" size="sm" style={{ marginTop: 6 }}>
              Pay bills, buy & sell, book trusted services.
            </Txt>
          </SafeAreaView>
        </LinearGradient>

        {/* Quick actions floating card */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: -40 }}>
          <Card style={{ padding: 12 }}>
            <View style={{ flexDirection: "row" }}>
              {[
                { icon: "flash", label: "Recharge", href: "/recharge", color: colors.warn },
                { icon: "receipt", label: "Pay bill", href: "/recharge/electricity", color: colors.info },
                { icon: "car-sport", label: "Challan", href: "/echallan", color: colors.accent },
                { icon: "add-circle", label: "Sell", href: "/marketplace/new", color: colors.success },
              ].map((a) => (
                <Pressable
                  key={a.label}
                  onPress={() => router.push(a.href as any)}
                  style={{ flex: 1, alignItems: "center", paddingVertical: 6 }}
                >
                  <View style={{ height: 44, width: 44, borderRadius: 14, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={a.icon as any} size={22} color={a.color} />
                  </View>
                  <Txt size="xs" style={{ marginTop: 6 }} weight="600">
                    {a.label}
                  </Txt>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        {/* Modules grid */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
            <Txt size="lg" weight="700">All services</Txt>
            <Txt size="xs" muted>Everything in one place</Txt>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {MODULES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => router.push(m.href as any)}
                style={{ width: "22.4%" }}
              >
                <LinearGradient
                  colors={m.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    aspectRatio: 1,
                    borderRadius: radii.lg,
                    alignItems: "center",
                    justifyContent: "center",
                    ...shadow.card,
                  }}
                >
                  <Ionicons name={m.icon as any} size={24} color="#fff" />
                </LinearGradient>
                <Txt size="xs" weight="600" style={{ textAlign: "center", marginTop: 6 }}>
                  {m.label}
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent transactions */}
        {myTxns.length > 0 && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
              <Txt size="lg" weight="700">Recent transactions</Txt>
              <Pressable onPress={() => router.push("/(tabs)/history")}>
                <Txt size="xs" color={colors.brand} weight="700">See all</Txt>
              </Pressable>
            </View>
            <Card style={{ padding: 0 }}>
              {myTxns.map((t, i) => (
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
                      height: 38,
                      width: 38,
                      borderRadius: 10,
                      backgroundColor: colors.brandSoft,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="flash" size={18} color={colors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt size="sm" weight="600">{t.type} · {t.reference}</Txt>
                    <Txt size="xs" muted style={{ marginTop: 2 }}>{shortDate(t.createdAt)}</Txt>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Txt size="sm" weight="700">{formatMoney(t.amount)}</Txt>
                    <StatusBadge status={t.status} />
                  </View>
                </Pressable>
              ))}
            </Card>
          </View>
        )}

        {/* Featured listings */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
            <Txt size="lg" weight="700">Fresh in marketplace</Txt>
            <Pressable onPress={() => router.push("/(tabs)/marketplace")}>
              <Txt size="xs" color={colors.brand} weight="700">See all</Txt>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 12 }}>
            {featuredListings.map((l) => (
              <Pressable key={l.id} onPress={() => router.push(`/marketplace/${l.id}`)} style={{ width: 180 }}>
                <View style={{ borderRadius: radii.lg, overflow: "hidden", backgroundColor: colors.surface, ...shadow.card }}>
                  <Image source={{ uri: l.images[0] }} style={{ width: "100%", height: 110 }} />
                  <View style={{ padding: 10 }}>
                    <Txt size="sm" weight="600" numberOfLines={1}>{l.title}</Txt>
                    <Txt size="xs" muted numberOfLines={1} style={{ marginTop: 2 }}>{l.location}</Txt>
                    <Txt size="sm" weight="700" color={colors.brand} style={{ marginTop: 6 }}>
                      {formatMoney(l.price)}
                    </Txt>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Top providers */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
            <Txt size="lg" weight="700">Trusted providers</Txt>
            <Pressable onPress={() => router.push("/(tabs)/services")}>
              <Txt size="xs" color={colors.brand} weight="700">See all</Txt>
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            {topProviders.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/services/${p.id}`)}>
                <Card style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Image source={{ uri: p.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Txt size="md" weight="700">{p.name}</Txt>
                      {p.verified && <Ionicons name="checkmark-circle" size={14} color={colors.info} />}
                    </View>
                    <Txt size="xs" muted style={{ marginTop: 2 }}>{p.serviceArea}</Txt>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                      <Ionicons name="star" size={12} color={colors.warn} />
                      <Txt size="xs" weight="700">{p.rating.toFixed(1)}</Txt>
                    </View>
                    <Txt size="xs" muted>{p.reviewCount} reviews</Txt>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
