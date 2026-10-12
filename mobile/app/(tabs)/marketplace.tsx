import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Card, EmptyState, Screen, Txt } from "@/components/ui";
import { colors, radii, shadow, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/utils";

export default function MarketplaceTab() {
  const router = useRouter();
  const { listings, categories } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [cond, setCond] = useState<string | null>(null);

  const products = useMemo(() => {
    return listings.filter((l) => {
      if (l.type !== "PRODUCT") return false;
      if (l.status === "DRAFT" || l.status === "INACTIVE") return false;
      if (cat && l.categoryId !== cat) return false;
      if (cond && l.condition !== cond) return false;
      if (q && !(l.title.toLowerCase().includes(q.toLowerCase()) || l.description.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [listings, q, cat, cond]);

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Txt size="xxl" weight="800">Marketplace</Txt>
            <Txt size="sm" muted>Buy & sell locally</Txt>
          </View>
          <Pressable
            onPress={() => router.push("/marketplace/new")}
            style={{
              height: 40,
              paddingHorizontal: 14,
              borderRadius: radii.pill,
              backgroundColor: colors.brand,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Txt color="#fff" weight="700" size="sm">Sell</Txt>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: radii.pill,
            paddingHorizontal: 14,
            marginTop: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="search" size={16} color={colors.textFaint} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search phone, chair, bike…"
            placeholderTextColor={colors.textFaint}
            style={{ flex: 1, paddingVertical: 10, marginLeft: 8, color: colors.text }}
          />
          {q ? (
            <Pressable onPress={() => setQ("")}><Ionicons name="close-circle" size={16} color={colors.textFaint} /></Pressable>
          ) : null}
        </View>
      </SafeAreaView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.md }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}
      >
        <Chip label="All" active={!cat} onPress={() => setCat(null)} />
        {categories.MARKETPLACE.map((c) => (
          <Chip key={c.id} label={`${c.icon} ${c.name}`} active={cat === c.id} onPress={() => setCat(c.id)} />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 6 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}
      >
        {["NEW", "USED", "REFURBISHED"].map((c) => (
          <Chip key={c} label={c} active={cond === c} onPress={() => setCond(cond === c ? null : c)} tone="info" />
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {products.length === 0 ? (
          <EmptyState title="No listings match" subtitle="Try different filters or post the first one." icon="basket-outline" />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {products.map((l) => (
              <Pressable key={l.id} onPress={() => router.push(`/marketplace/${l.id}`)} style={{ width: "48%" }}>
                <View style={{ borderRadius: radii.lg, backgroundColor: colors.surface, overflow: "hidden", ...shadow.card }}>
                  <Image source={{ uri: l.images[0] }} style={{ width: "100%", height: 130 }} />
                  <View style={{ padding: 10 }}>
                    <Txt size="sm" weight="600" numberOfLines={2}>{l.title}</Txt>
                    <Txt size="xs" muted style={{ marginTop: 2 }} numberOfLines={1}>
                      {l.condition} · {l.location}
                    </Txt>
                    <Txt size="md" weight="800" color={colors.brand} style={{ marginTop: 6 }}>
                      {formatMoney(l.price)}
                    </Txt>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function Chip({ label, active, onPress, tone = "brand" }: { label: string; active?: boolean; onPress: () => void; tone?: "brand" | "info" }) {
  const accent = tone === "brand" ? colors.brand : colors.info;
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radii.pill,
        backgroundColor: active ? accent : colors.surface,
        borderWidth: 1,
        borderColor: active ? accent : colors.border,
      }}
    >
      <Txt size="xs" weight="600" color={active ? "#fff" : colors.text}>{label}</Txt>
    </Pressable>
  );
}
