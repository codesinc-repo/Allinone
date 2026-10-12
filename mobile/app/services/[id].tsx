import { useState } from "react";
import { Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, EmptyState, Field, Input, Screen, StatusBadge, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { providers, categories, reviews, users, serviceRequests, currentUser, addRequest, addReview } = useStore();
  const p = providers.find((x) => x.id === id);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [preferredTime, setPreferredTime] = useState("Weekend morning");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [requested, setRequested] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  if (!p) {
    return (
      <Screen>
        <PageHeader title="Not found" />
        <EmptyState title="Provider not found" icon="construct-outline" />
      </Screen>
    );
  }
  const category = categories.SERVICES.find((c) => c.id === p.categoryId);
  const providerReviews = reviews.filter((r) => r.providerId === p.id);
  const myRequests = serviceRequests.filter((r) => r.providerId === p.id && r.userId === currentUser?.id);

  function doRequest() {
    if (!currentUser) return router.replace("/(auth)/login");
    if (!description.trim() || !location.trim()) return;
    addRequest(p!.id, description, location, preferredTime);
    setRequested(true);
    setDescription("");
    setLocation("");
  }

  function doReview() {
    if (!currentUser) return router.replace("/(auth)/login");
    if (!reviewText.trim()) return;
    addReview(p!.id, rating, reviewText);
    setReviewText("");
    setReviewed(true);
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="Provider" subtitle={category?.name} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 4, paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
            <Card style={{ padding: spacing.lg, alignItems: "center" }}>
              <Image source={{ uri: p.avatar }} style={{ width: 90, height: 90, borderRadius: 45 }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
                <Txt size="xl" weight="800">{p.name}</Txt>
                {p.verified && <Ionicons name="checkmark-circle" size={18} color={colors.info} />}
              </View>
              <Txt size="sm" muted>{category?.name} · {p.serviceArea}</Txt>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10, alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="star" size={14} color={colors.warn} />
                  <Txt weight="700">{p.rating.toFixed(1)}</Txt>
                  <Txt size="xs" muted>({p.reviewCount})</Txt>
                </View>
                <Badge tone="info">{p.availability}</Badge>
              </View>
              <Txt size="sm" style={{ marginTop: 12, textAlign: "center" }}>{p.bio}</Txt>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                <Button
                  title="Call"
                  variant="outline"
                  leftIcon="call"
                  onPress={() => Linking.openURL(`tel:${p.phone}`)}
                />
                <Button
                  title="Message"
                  variant="outline"
                  leftIcon="chatbubble"
                  onPress={() => Linking.openURL(`sms:${p.phone}`)}
                />
              </View>
            </Card>

            <Txt size="lg" weight="700" style={{ marginTop: spacing.xl, marginBottom: 8 }}>Request service</Txt>
            {requested ? (
              <Card style={{ backgroundColor: colors.successSoft, borderWidth: 0, flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Txt size="sm" color={colors.success} weight="700">Request sent</Txt>
                  <Txt size="xs" style={{ marginTop: 2 }} color={colors.success}>The provider will reach out shortly.</Txt>
                </View>
                <Button title="Send another" variant="ghost" size="sm" onPress={() => setRequested(false)} />
              </Card>
            ) : (
              <Card>
                <Field label="What needs doing?">
                  <Input value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} placeholder="e.g. Leaking bathroom tap" />
                </Field>
                <Field label="Your location">
                  <Input value={location} onChangeText={setLocation} placeholder="Area, landmark" />
                </Field>
                <Field label="Preferred time">
                  <Input value={preferredTime} onChangeText={setPreferredTime} />
                </Field>
                <Button title="Send request" onPress={doRequest} fullWidth leftIcon="send" />
              </Card>
            )}

            {myRequests.length > 0 && (
              <Card style={{ marginTop: spacing.md }}>
                <Txt size="sm" weight="700" style={{ marginBottom: 8 }}>My requests to this provider</Txt>
                {myRequests.map((r) => (
                  <View key={r.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
                    <Txt size="xs" muted>{formatDate(r.createdAt)}</Txt>
                    <StatusBadge status={r.status} />
                  </View>
                ))}
              </Card>
            )}

            <Txt size="lg" weight="700" style={{ marginTop: spacing.xl, marginBottom: 8 }}>Reviews</Txt>
            {providerReviews.length === 0 ? (
              <Card>
                <Txt size="sm" muted>No reviews yet. Be the first to leave feedback.</Txt>
              </Card>
            ) : (
              <View style={{ gap: 8 }}>
                {providerReviews.map((r) => {
                  const u = users.find((uu) => uu.id === r.userId);
                  return (
                    <Card key={r.id}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Txt size="sm" weight="700">{u?.name ?? "User"}</Txt>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                          <Ionicons name="star" size={12} color={colors.warn} />
                          <Txt size="xs" weight="700">{r.rating}</Txt>
                        </View>
                      </View>
                      <Txt size="xs" muted style={{ marginTop: 2 }}>{formatDate(r.createdAt)}</Txt>
                      <Txt size="sm" style={{ marginTop: 6 }}>{r.comment}</Txt>
                    </Card>
                  );
                })}
              </View>
            )}

            <Txt size="lg" weight="700" style={{ marginTop: spacing.xl, marginBottom: 8 }}>Leave a review</Txt>
            {reviewed ? (
              <Card style={{ backgroundColor: colors.successSoft, borderWidth: 0 }}>
                <Txt size="sm" color={colors.success} weight="700">Thanks for the review!</Txt>
              </Card>
            ) : (
              <Card>
                <Field label="Rating">
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable key={n} onPress={() => setRating(n)}>
                        <Ionicons name={rating >= n ? "star" : "star-outline"} size={28} color={colors.warn} />
                      </Pressable>
                    ))}
                  </View>
                </Field>
                <Field label="Comment">
                  <Input value={reviewText} onChangeText={setReviewText} multiline numberOfLines={2} style={{ minHeight: 70, textAlignVertical: "top" }} placeholder="Share your experience" />
                </Field>
                <Button title="Submit review" variant="outline" onPress={doReview} fullWidth />
              </Card>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}
