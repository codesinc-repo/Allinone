import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Field, Input, Screen, Txt } from "@/components/ui";
import { colors, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr("");
    if (!name || !email || password.length < 6) {
      setErr("Enter name, email and a 6+ character password.");
      return;
    }
    setBusy(true);
    try {
      await signUp(name, email, password, phone);
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e.message ?? "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Txt size="xxl" weight="800">Create your account</Txt>
        <Txt size="sm" muted style={{ marginTop: 4 }}>One account across every service.</Txt>
      </SafeAreaView>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
          <Card>
            {err ? (
              <View style={{ padding: 10, borderRadius: 10, backgroundColor: colors.dangerSoft, marginBottom: spacing.md }}>
                <Txt color={colors.danger} size="sm">{err}</Txt>
              </View>
            ) : null}
            <Field label="Full name"><Input value={name} onChangeText={setName} /></Field>
            <Field label="Email"><Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /></Field>
            <Field label="Phone"><Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></Field>
            <Field label="Password"><Input value={password} onChangeText={setPassword} secureTextEntry /></Field>
            <Button title={busy ? "Creating…" : "Create account"} onPress={submit} fullWidth disabled={busy} />
            <Button
              title="I already have an account"
              variant="ghost"
              onPress={() => router.replace("/(auth)/login")}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
