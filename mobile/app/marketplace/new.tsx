import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { PageHeader } from "@/components/PageHeader";
import { Button, Card, Field, Input, Screen, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";

const CONDITIONS = ["NEW", "USED", "REFURBISHED"] as const;

export default function NewListing() {
  const router = useRouter();
  const { categories, addListing, currentUser } = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number]>("USED");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [image, setImage] = useState("https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&q=70");
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (!currentUser) return router.replace("/(auth)/login");
    if (!title.trim() || !description.trim() || !location.trim() || !Number(price)) {
      setErr("Fill all fields with a valid price.");
      return;
    }
    const l = addListing({
      type: "PRODUCT",
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      condition,
      location: location.trim(),
      categoryId: categoryId ?? undefined,
      images: [image.trim()],
    });
    if (l) router.replace(`/marketplace/${l.id}`);
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="Post a listing" subtitle="Reach local buyers in minutes" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 4 }} keyboardShouldPersistTaps="handled">
            {err ? (
              <Card style={{ backgroundColor: colors.dangerSoft, borderWidth: 0, marginBottom: spacing.md }}>
                <Txt color={colors.danger} size="sm">{err}</Txt>
              </Card>
            ) : null}
            <Card>
              <Field label="Title">
                <Input value={title} onChangeText={setTitle} placeholder="e.g. iPhone 13 Pro — immaculate" />
              </Field>
              <Field label="Description">
                <Input
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                />
              </Field>
              <Field label="Price (₹)">
                <Input value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="0" />
              </Field>
              <Field label="Condition">
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {CONDITIONS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setCondition(c)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: radii.pill,
                        backgroundColor: condition === c ? colors.brand : colors.surface,
                        borderWidth: 1,
                        borderColor: condition === c ? colors.brand : colors.border,
                      }}
                    >
                      <Txt size="xs" weight="700" color={condition === c ? "#fff" : colors.text}>{c}</Txt>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Category">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {categories.MARKETPLACE.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategoryId(c.id === categoryId ? null : c.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: radii.pill,
                        backgroundColor: categoryId === c.id ? colors.brand : colors.surface,
                        borderWidth: 1,
                        borderColor: categoryId === c.id ? colors.brand : colors.border,
                      }}
                    >
                      <Txt size="xs" weight="600" color={categoryId === c.id ? "#fff" : colors.text}>{c.icon} {c.name}</Txt>
                    </Pressable>
                  ))}
                </ScrollView>
              </Field>
              <Field label="Location">
                <Input value={location} onChangeText={setLocation} placeholder="City, area" />
              </Field>
              <Field label="Image URL">
                <Input value={image} onChangeText={setImage} autoCapitalize="none" />
              </Field>
              <Button title="Publish listing" onPress={submit} fullWidth leftIcon="checkmark" />
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}
