import { useState } from "react";
import { Image, KeyboardAvoidingView, Linking, Platform, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, EmptyState, Field, Input, Screen, Txt } from "@/components/ui";
import { colors, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/utils";

export default function VehicleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { listings, users, currentUser, addInquiry } = useStore();
  const l = listings.find((x) => x.id === id);
  const [message, setMessage] = useState("Is this still available? Interested in a test drive.");
  const [contact, setContact] = useState(currentUser?.phone ?? "");
  const [sent, setSent] = useState(false);

  if (!l) {
    return (
      <Screen>
        <PageHeader title="Not found" />
        <EmptyState title="Vehicle not found" icon="car-outline" />
      </Screen>
    );
  }
  const seller = users.find((u) => u.id === l.sellerId);
  const isRental = l.meta?.listingMode === "RENTAL";

  function doSend() {
    if (!currentUser) return router.replace("/(auth)/login");
    if (!message.trim() || !contact.trim()) return;
    addInquiry(l!.id, message, contact);
    setSent(true);
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title={isRental ? "Rental" : "Vehicle"} subtitle={l.subtype ?? ""} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: l.images[0] }} style={{ width: "100%", height: 240 }} />
            <View style={{ padding: spacing.lg }}>
              <Txt size="xl" weight="800">{l.title}</Txt>
              <Txt size="display" weight="800" color={colors.brand} style={{ marginTop: 4 }}>
                {formatMoney(l.price)}{isRental ? "/day" : ""}
              </Txt>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {l.meta?.year && <Badge tone="info">{l.meta.year}</Badge>}
                {l.meta?.km && <Badge tone="neutral">{(l.meta.km as number).toLocaleString("en-IN")} km</Badge>}
                {l.meta?.fuel && <Badge tone="brand">{l.meta.fuel}</Badge>}
                {isRental && <Badge tone="warn">Rental</Badge>}
              </View>

              <Txt size="sm" muted style={{ marginTop: spacing.md }}>📍 {l.location}</Txt>
              <Txt size="md" style={{ marginTop: spacing.md, lineHeight: 22 }}>{l.description}</Txt>

              <Card style={{ marginTop: spacing.lg, flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ height: 42, width: 42, borderRadius: 21, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
                  <Txt color="#fff" weight="700">{seller?.name[0]}</Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size="sm" weight="700">{seller?.name}</Txt>
                  <Txt size="xs" muted>Listed {formatDate(l.createdAt)}</Txt>
                </View>
                {seller?.phone && (
                  <Button title="Call" variant="outline" size="sm" leftIcon="call" onPress={() => Linking.openURL(`tel:${seller.phone}`)} />
                )}
              </Card>

              {isRental && (
                <Card style={{ marginTop: spacing.md, backgroundColor: colors.warnSoft, borderWidth: 0, flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
                  <Ionicons name="shield-checkmark" size={18} color={colors.warn} />
                  <Txt size="xs" color="#8a6d2c" style={{ flex: 1 }}>
                    Rental deposits, insurance and cancellation policies are handled offline for the demo.
                  </Txt>
                </Card>
              )}

              <Txt size="lg" weight="700" style={{ marginTop: spacing.xl, marginBottom: 8 }}>
                {isRental ? "Request rental" : "Contact seller"}
              </Txt>
              {sent ? (
                <Card style={{ backgroundColor: colors.successSoft, borderWidth: 0, flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Txt size="sm" color={colors.success} weight="700">Inquiry sent.</Txt>
                </Card>
              ) : (
                <Card>
                  <Field label="Your contact">
                    <Input value={contact} onChangeText={setContact} />
                  </Field>
                  <Field label="Message">
                    <Input value={message} onChangeText={setMessage} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} />
                  </Field>
                  <Button title="Send" onPress={doSend} fullWidth leftIcon="paper-plane" />
                </Card>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}
