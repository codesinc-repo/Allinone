import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { PageHeader } from "@/components/PageHeader";
import { Button, Card, Field, Input, Screen, Txt } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";

const SUBTYPES = ["CAR", "BIKE", "COMMERCIAL"] as const;
const FUELS = ["Petrol", "Diesel", "CNG", "Electric"] as const;

export default function NewVehicle() {
  const router = useRouter();
  const { addListing, currentUser } = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [subtype, setSubtype] = useState<(typeof SUBTYPES)[number]>("CAR");
  const [mode, setMode] = useState<"SALE" | "RENTAL">("SALE");
  const [year, setYear] = useState("2022");
  const [km, setKm] = useState("");
  const [fuel, setFuel] = useState<(typeof FUELS)[number]>("Petrol");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&q=70");
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (!currentUser) return router.replace("/(auth)/login");
    if (!title.trim() || !description.trim() || !location.trim() || !Number(price)) {
      setErr("Fill all fields with a valid price.");
      return;
    }
    const l = addListing({
      type: "VEHICLE",
      subtype,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      location: location.trim(),
      images: [image.trim()],
      meta: {
        year: Number(year) || undefined,
        km: Number(km) || undefined,
        fuel,
        listingMode: mode,
      },
    });
    if (l) router.replace(`/vehicles/${l.id}`);
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <PageHeader title="List a vehicle" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 4 }} keyboardShouldPersistTaps="handled">
            {err ? (
              <Card style={{ backgroundColor: colors.dangerSoft, borderWidth: 0, marginBottom: spacing.md }}>
                <Txt color={colors.danger} size="sm">{err}</Txt>
              </Card>
            ) : null}
            <Card>
              <Field label="Title">
                <Input value={title} onChangeText={setTitle} placeholder="2019 Honda City VX" />
              </Field>
              <Field label="Listing mode">
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(["SALE", "RENTAL"] as const).map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setMode(m)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: radii.pill,
                        backgroundColor: mode === m ? colors.brand : colors.surface,
                        borderWidth: 1,
                        borderColor: mode === m ? colors.brand : colors.border,
                      }}
                    >
                      <Txt size="xs" weight="700" color={mode === m ? "#fff" : colors.text}>{m === "SALE" ? "For sale" : "For rent/day"}</Txt>
                    </Pressable>
                  ))}
                </View>
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
              <Field label="Year">
                <Input value={year} onChangeText={setYear} keyboardType="number-pad" />
              </Field>
              <Field label="Kilometres">
                <Input value={km} onChangeText={setKm} keyboardType="number-pad" />
              </Field>
              <Field label="Fuel">
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {FUELS.map((f) => (
                    <Pressable
                      key={f}
                      onPress={() => setFuel(f)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: radii.pill,
                        backgroundColor: fuel === f ? colors.brand : colors.surface,
                        borderWidth: 1,
                        borderColor: fuel === f ? colors.brand : colors.border,
                      }}
                    >
                      <Txt size="xs" weight="700" color={fuel === f ? "#fff" : colors.text}>{f}</Txt>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Location">
                <Input value={location} onChangeText={setLocation} />
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
