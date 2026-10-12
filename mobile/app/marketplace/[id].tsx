import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, EmptyState, Field, Input, Screen, StatusBadge, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/utils";

export default function MarketplaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { listings, users, currentUser, addInquiry, updateListingStatus, categories } = useStore();
  const l = listings.find((x) => x.id === id);
  const [message, setMessage] = useState("Hi, is this still available?");
  const [contact, setContact] = useState(currentUser?.phone ?? "");
  const [sent, setSent] = useState(false);

  if (!l) {
    return (
      <Screen>
        <PageHeader title="Not found" />
        <EmptyState title="Listing not found" icon="basket-outline" />
      </Screen>
    );
  }
  const seller = users.find((u) => u.id === l.sellerId);
  const category = categories.MARKETPLACE.find((c) => c.id === l.categoryId);
  const isMine = currentUser?.id === l.sellerId;

  function doSend() {
    if (!currentUser) return router.replace("/(auth)/login");
    if (!message.trim() || !contact.trim()) return;
    addInquiry(l!.id, message, contact);
    setSent(true);
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="Listing" subtitle={category?.name} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: l.images[0] }} style={{ width: "100%", height: 260 }} />

            <View style={{ padding: spacing.lg }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Txt size="xl" weight="800" style={{ flex: 1, paddingRight: 8 }}>{l.title}</Txt>
                <StatusBadge status={l.status ?? "ACTIVE"} />
              </View>
              <Txt size="display" weight="800" color={colors.brand} style={{ marginTop: 6 }}>
                {formatMoney(l.price)}
              </Txt>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
                <Badge tone="info">{l.condition ?? "—"}</Badge>
                {category && <Badge tone="brand">{category.icon} {category.name}</Badge>}
              </View>

              <Txt size="sm" muted style={{ marginTop: spacing.md }}>{l.location}</Txt>
              <Txt size="md" style={{ marginTop: spacing.md, lineHeight: 22 }}>{l.description}</Txt>

              <Card style={{ marginTop: spacing.lg, flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ height: 42, width: 42, borderRadius: 21, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
                  <Txt color="#fff" weight="700">{seller?.name[0]}</Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size="sm" weight="700">{seller?.name}</Txt>
                  <Txt size="xs" muted>Listed {formatDate(l.createdAt)}</Txt>
                </View>
              </Card>

              {isMine ? (
                <Card style={{ marginTop: spacing.md }}>
                  <Txt size="sm" weight="700" style={{ marginBottom: 8 }}>Manage listing</Txt>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {(["ACTIVE", "INACTIVE", "DRAFT"] as const).map((st) => (
                      <Pressable
                        key={st}
                        onPress={() => updateListingStatus(l.id, st)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: radii.md,
                          backgroundColor: (l.status ?? "ACTIVE") === st ? colors.brand : colors.surfaceAlt,
                        }}
                      >
                        <Txt size="xs" weight="700" color={(l.status ?? "ACTIVE") === st ? "#fff" : colors.text}>{st}</Txt>
                      </Pressable>
                    ))}
                  </View>
                </Card>
              ) : (
                <>
                  <Txt size="lg" weight="700" style={{ marginTop: spacing.xl, marginBottom: 8 }}>Contact seller</Txt>
                  {sent ? (
                    <Card style={{ backgroundColor: colors.successSoft, borderWidth: 0, flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                      <Txt size="sm" color={colors.success} weight="700">Inquiry sent to the seller.</Txt>
                    </Card>
                  ) : (
                    <Card>
                      <Field label="Your contact">
                        <Input value={contact} onChangeText={setContact} placeholder="Phone or email" />
                      </Field>
                      <Field label="Message">
                        <Input value={message} onChangeText={setMessage} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} />
                      </Field>
                      <Button title="Send inquiry" onPress={doSend} fullWidth leftIcon="paper-plane" />
                    </Card>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}
