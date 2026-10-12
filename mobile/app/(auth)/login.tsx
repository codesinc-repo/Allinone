import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Field, Input, Screen, Txt } from "@/components/ui";
import { colors, spacing } from "@/lib/theme";
import { useStore } from "@/lib/store";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useStore();
  const [email, setEmail] = useState("priya@superapp.test");
  const [password, setPassword] = useState("password");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr("");
    setBusy(true);
    const u = await signIn(email, password);
    setBusy(false);
    if (!u) {
      setErr("Invalid email or password");
      return;
    }
    router.replace("/(tabs)");
  }

  return (
    <Screen>
      <LinearGradient
        colors={[colors.brand, colors.brandDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 220, paddingHorizontal: spacing.lg, paddingTop: 60 }}
      >
        <SafeAreaView edges={["top"]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Txt color="#fff" weight="700">SA</Txt>
            </View>
            <View>
              <Txt color="#fff" size="lg" weight="700">Super App</Txt>
              <Txt color="rgba(255,255,255,0.75)" size="xs">All of life, in one place.</Txt>
            </View>
          </View>
          <Txt color="#fff" size="xxl" weight="800" style={{ marginTop: 24 }}>
            Welcome back
          </Txt>
          <Txt color="rgba(255,255,255,0.85)" size="sm" style={{ marginTop: 4 }}>
            Sign in to pick up where you left off.
          </Txt>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, marginTop: -40, paddingHorizontal: spacing.lg }}
      >
        <Card style={{ padding: spacing.xl }}>
          {err ? (
            <View
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: colors.dangerSoft,
                marginBottom: spacing.md,
              }}
            >
              <Txt color={colors.danger} size="sm">{err}</Txt>
            </View>
          ) : null}

          <Field label="Email">
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Field>
          <Field label="Password">
            <Input value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          </Field>
          <Button title={busy ? "Signing in…" : "Sign in"} onPress={submit} fullWidth disabled={busy} />

          <View
            style={{
              marginTop: spacing.lg,
              padding: 12,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 10,
            }}
          >
            <Txt size="xs" weight="700" style={{ marginBottom: 4 }}>Demo accounts</Txt>
            <Txt size="xs" muted>Admin  admin@superapp.test / admin1234</Txt>
            <Txt size="xs" muted>User   priya@superapp.test / password</Txt>
          </View>

          <Pressable
            style={{ alignSelf: "center", marginTop: spacing.lg }}
            onPress={() => router.push("/(auth)/register")}
          >
            <Txt size="sm" color={colors.brand} weight="600">
              Create a new account →
            </Txt>
          </Pressable>
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}
