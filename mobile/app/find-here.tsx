import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, EmptyState, Screen, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";

export default function FindHere() {
  const { directory, categories } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [tone, setTone] = useState<"ALL" | "PUBLIC" | "PAID">("ALL");

  const items = useMemo(() => {
    return directory
      .filter((e) => {
        if (cat && e.categoryId !== cat) return false;
        if (tone === "PUBLIC" && e.isPaid) return false;
        if (tone === "PAID" && !e.isPaid) return false;
        if (q) {
          const ql = q.toLowerCase();
          if (!(e.name.toLowerCase().includes(ql) || e.description.toLowerCase().includes(ql) || e.address.toLowerCase().includes(ql))) return false;
        }
        return true;
      })
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  }, [directory, q, cat, tone]);

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="Find Here" subtitle="Public & private authorities directory" />
        <View style={{ paddingHorizontal: spacing.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radii.pill, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="search" size={16} color={colors.textFaint} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Hospital, RTO, bank…"
              placeholderTextColor={colors.textFaint}
              style={{ flex: 1, paddingVertical: 10, marginLeft: 8, color: colors.text }}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
          <Chip label="All" active={!cat} onPress={() => setCat(null)} />
          {categories.DIRECTORY.map((c) => (
            <Chip key={c.id} label={`${c.icon} ${c.name}`} active={cat === c.id} onPress={() => setCat(c.id)} />
          ))}
        </ScrollView>

        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: spacing.lg, marginTop: 8 }}>
          {(["ALL", "PUBLIC", "PAID"] as const).map((t) => (
            <Chip key={t} label={t === "ALL" ? "Public + Private" : t === "PUBLIC" ? "Public" : "Paid Private"} active={tone === t} onPress={() => setTone(t)} tone="info" />
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md }} showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <EmptyState title="No entries match" icon="location-outline" />
          ) : (
            <View style={{ gap: 10 }}>
              {items.map((e) => {
                const category = categories.DIRECTORY.find((c) => c.id === e.categoryId);
                return (
                  <Card key={e.id}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          <Txt size="md" weight="700">{e.name}</Txt>
                          {e.featured && <Badge tone="warn">★ Featured</Badge>}
                          {e.isPaid ? <Badge tone="brand">Paid</Badge> : <Badge tone="success">Public</Badge>}
                        </View>
                        <Txt size="xs" muted style={{ marginTop: 2 }}>{category?.name}</Txt>
                      </View>
                    </View>
                    <Txt size="sm" style={{ marginTop: 8 }}>{e.description}</Txt>
                    <View style={{ marginTop: 10, gap: 6 }}>
                      <Row icon="location" text={e.address} />
                      {e.phone && <Row icon="call" text={e.phone} onPress={() => Linking.openURL(`tel:${e.phone}`)} />}
                      {e.hours && <Row icon="time" text={e.hours} />}
                      {e.website && <Row icon="globe" text={e.website} onPress={() => Linking.openURL(e.website!)} />}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function Chip({ label, active, onPress, tone = "brand" }: { label: string; active?: boolean; onPress?: () => void; tone?: "brand" | "info" }) {
  const accent = tone === "brand" ? colors.brand : colors.info;
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? accent : colors.surface,
        borderWidth: 1,
        borderColor: active ? accent : colors.border,
      }}
    >
      <Txt size="xs" weight="600" color={active ? "#fff" : colors.text}>{label}</Txt>
    </Pressable>
  );
}

function Row({ icon, text, onPress }: { icon: any; text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Ionicons name={icon} size={14} color={colors.textFaint} />
      <Txt size="xs" muted style={{ flex: 1 }}>{text}</Txt>
    </Pressable>
  );
}
