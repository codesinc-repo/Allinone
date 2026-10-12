import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { PageHeader } from "@/components/PageHeader";
import { Button, Card, Field, Input, Screen, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";

const SUBTYPES = ["PLOT", "HOUSE", "APARTMENT"] as const;

export default function NewProperty() {
  const router = useRouter();
  const { addListing, currentUser } = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [subtype, setSubtype] = useState<(typeof SUBTYPES)[number]>("HOUSE");
  const [bedrooms, setBedrooms] = useState("");
  const [area, setArea] = useState("");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1000&q=70");
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (!currentUser) return router.replace("/(auth)/login");
    if (!title.trim() || !description.trim() || !location.trim() || !Number(price)) {
      setErr("Fill all fields with a valid price.");
      return;
    }
    const l = addListing({
      type: "PROPERTY",
      subtype,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      location: location.trim(),
      images: [image.trim()],
      meta: { bedrooms: Number(bedrooms) || undefined, area: area.trim() || undefined },
    });
    if (l) router.replace(`/property/${l.id}`);
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="List a property" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 4 }} keyboardShouldPersistTaps="handled">
            {err ? (
              <Card style={{ backgroundColor: colors.dangerSoft, borderWidth: 0, marginBottom: spacing.md }}>
                <Txt color={colors.danger} size="sm">{err}</Txt>
              </Card>
            ) : null}
            <Card>
              <Field label="Title">
                <Input value={title} onChangeText={setTitle} placeholder="3BHK house in Vastrapur" />
              </Field>
              <Field label="Type">
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {SUBTYPES.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => setSubtype(s)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: radii.pill,
                        backgroundColor: subtype === s ? colors.brand : colors.surface,
                        borderWidth: 1,
                        borderColor: subtype === s ? colors.brand : colors.border,
                      }}
                    >
                      <Txt size="xs" weight="700" color={subtype === s ? "#fff" : colors.text}>{s}</Txt>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Price (₹)">
                <Input value={price} onChangeText={setPrice} keyboardType="number-pad" />
              </Field>
              <Field label="Bedrooms (optional)">
                <Input value={bedrooms} onChangeText={setBedrooms} keyboardType="number-pad" />
              </Field>
              <Field label="Area (sq ft / sq yd)">
                <Input value={area} onChangeText={setArea} placeholder="1800 sq ft" />
              </Field>
              <Field label="Location">
                <Input value={location} onChangeText={setLocation} placeholder="City, area" />
              </Field>
              <Field label="Description">
                <Input value={description} onChangeText={setDescription} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: "top" }} />
              </Field>
              <Field label="Image URL">
                <Input value={image} onChangeText={setImage} autoCapitalize="none" />
              </Field>
              <Button title="Publish" onPress={submit} fullWidth leftIcon="checkmark" />
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}
