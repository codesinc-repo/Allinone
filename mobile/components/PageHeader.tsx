import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Txt } from "./ui";
import { colors, spacing } from "@/lib/theme";

export function PageHeader({
  title,
  subtitle,
  back = true,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, flexDirection: "row", alignItems: "center", gap: 12 }}>
      {back && (
        <Pressable
          onPress={() => router.back()}
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Txt size="xl" weight="700">{title}</Txt>
        {subtitle ? <Txt size="sm" muted style={{ marginTop: 2 }}>{subtitle}</Txt> : null}
      </View>
      {right}
    </View>
  );
}
