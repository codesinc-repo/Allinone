import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Card, EmptyState, Screen, Txt } from "@/components/ui";
import { colors, radii, shadow, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";

export default function ServicesTab() {
  const router = useRouter();
  const { providers, categories } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = providers.filter((p) => {
      if (cat && p.categoryId !== cat) return false;
      if (q) {
        const ql = q.toLowerCase();
        if (!(p.name.toLowerCase().includes(ql) || p.serviceArea.toLowerCase().includes(ql) || p.bio.toLowerCase().includes(ql))) return false;
      }
      return true;
    });
    return list.sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating);
  }, [providers, q, cat]);

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
        <Txt size="xxl" weight="800">Home Services</Txt>
        <Txt size="sm" muted>Electricians, plumbers, masons, and more</Txt>
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
            placeholder="Search providers or area…"
            placeholderTextColor={colors.textFaint}
            style={{ flex: 1, paddingVertical: 10, marginLeft: 8, color: colors.text }}
          />
        </View>
      </SafeAreaView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.md }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}
      >
        <Pressable
          onPress={() => setCat(null)}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: radii.pill,
            backgroundColor: !cat ? colors.brand : colors.surface,
            borderWidth: 1,
            borderColor: !cat ? colors.brand : colors.border,
          }}
        >
          <Txt size="xs" weight="600" color={!cat ? "#fff" : colors.text}>All</Txt>
        </Pressable>
        {categories.SERVICES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCat(c.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: radii.pill,
              backgroundColor: cat === c.id ? colors.brand : colors.surface,
              borderWidth: 1,
              borderColor: cat === c.id ? colors.brand : colors.border,
            }}
          >
            <Txt size="xs" weight="600" color={cat === c.id ? "#fff" : colors.text}>{c.icon} {c.name}</Txt>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <EmptyState title="No providers match" subtitle="Try a different search or category." icon="construct-outline" />
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((p) => {
              const category = categories.SERVICES.find((c) => c.id === p.categoryId);
              return (
                <Pressable key={p.id} onPress={() => router.push(`/services/${p.id}`)}>
                  <Card style={{ padding: 12, flexDirection: "row", gap: 12 }}>
                    <Image source={{ uri: p.avatar }} style={{ width: 54, height: 54, borderRadius: 27 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Txt size="md" weight="700">{p.name}</Txt>
                        {p.verified && <Ionicons name="checkmark-circle" size={14} color={colors.info} />}
                      </View>
                      <Txt size="xs" muted>{category?.name} · {p.serviceArea}</Txt>
                      <Txt size="xs" muted style={{ marginTop: 2 }}>{p.availability}</Txt>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Ionicons name="star" size={12} color={colors.warn} />
                        <Txt size="sm" weight="700">{p.rating.toFixed(1)}</Txt>
                      </View>
                      <Txt size="xs" muted>({p.reviewCount})</Txt>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
