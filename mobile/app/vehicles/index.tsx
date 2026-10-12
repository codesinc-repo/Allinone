import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PageHeader } from "@/components/PageHeader";
import { EmptyState, Screen, Txt } from "@/components/ui";
import { colors, radii, shadow, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/utils";

const SUBTYPES = ["CAR", "BIKE", "COMMERCIAL"] as const;

export default function VehiclesIndex() {
  const router = useRouter();
  const { listings } = useStore();
  const [mode, setMode] = useState<"SALE" | "RENTAL">("SALE");
  const [subtype, setSubtype] = useState<string | null>(null);

  const items = useMemo(
    () =>
      listings.filter(
        (l) =>
          l.type === "VEHICLE" &&
          ((l.meta?.listingMode ?? "SALE") === mode) &&
          (subtype ? l.subtype === subtype : true),
      ),
    [listings, mode, subtype],
  );

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader
          title="Vehicles"
          subtitle="Buy, sell or rent"
          right={
            <Pressable
              onPress={() => router.push("/vehicles/new")}
              style={{
                height: 36,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: colors.brand,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Ionicons name="add" size={14} color="#fff" />
              <Txt size="xs" weight="700" color="#fff">List</Txt>
            </Pressable>
          }
        />

        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: spacing.lg }}>
          {(["SALE", "RENTAL"] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: radii.md,
                backgroundColor: mode === m ? colors.brand : colors.surface,
                borderWidth: 1,
                borderColor: mode === m ? colors.brand : colors.border,
                alignItems: "center",
              }}
            >
              <Txt size="sm" weight="700" color={mode === m ? "#fff" : colors.text}>{m === "SALE" ? "For sale" : "For rent"}</Txt>
            </Pressable>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
          <Pill label="All" active={!subtype} onPress={() => setSubtype(null)} />
          {SUBTYPES.map((s) => (
            <Pill key={s} label={s} active={subtype === s} onPress={() => setSubtype(s)} />
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md }} showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <EmptyState title={`No ${mode === "SALE" ? "listings" : "rentals"} found`} icon="car-outline" />
          ) : (
            <View style={{ gap: 12 }}>
              {items.map((l) => (
                <Pressable key={l.id} onPress={() => router.push(`/vehicles/${l.id}`)}>
                  <View style={{ borderRadius: radii.lg, backgroundColor: colors.surface, overflow: "hidden", ...shadow.card }}>
                    <Image source={{ uri: l.images[0] }} style={{ width: "100%", height: 160 }} />
                    <View style={{ padding: 14 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Txt size="md" weight="700" style={{ flex: 1, paddingRight: 8 }} numberOfLines={1}>{l.title}</Txt>
                        <Txt size="md" weight="800" color={colors.brand}>
                          {formatMoney(l.price)}{mode === "RENTAL" ? "/day" : ""}
                        </Txt>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        {l.meta?.year && <Pill label={String(l.meta.year)} compact />}
                        {l.meta?.km && <Pill label={`${(l.meta.km as number).toLocaleString("en-IN")} km`} compact />}
                        {l.meta?.fuel && <Pill label={l.meta.fuel} compact />}
                      </View>
                      <Txt size="xs" muted style={{ marginTop: 6 }}>📍 {l.location}</Txt>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function Pill({ label, active, onPress, compact }: { label: string; active?: boolean; onPress?: () => void; compact?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        paddingHorizontal: compact ? 10 : 14,
        paddingVertical: compact ? 4 : 8,
        borderRadius: 999,
        backgroundColor: active ? colors.brand : colors.surfaceAlt,
      }}
    >
      <Txt size="xs" weight="700" color={active ? "#fff" : colors.textMuted}>{label}</Txt>
    </Pressable>
  );
}
