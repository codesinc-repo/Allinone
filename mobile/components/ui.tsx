import React from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, font, radii, shadow, spacing } from "@/lib/theme";

export function Screen({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]} {...rest}>
      {children}
    </View>
  );
}

export function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          ...shadow.card,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

type TxtProps = TextProps & {
  size?: keyof typeof font;
  weight?: "400" | "500" | "600" | "700" | "800";
  color?: string;
  muted?: boolean;
};
export function Txt({ size = "md", weight = "400", color, muted, style, ...rest }: TxtProps) {
  return (
    <Text
      style={[
        {
          fontSize: font[size],
          fontWeight: weight,
          color: muted ? colors.textMuted : (color ?? colors.text),
        },
        style,
      ]}
      {...rest}
    />
  );
}

type BtnProps = Omit<PressableProps, "children"> & {
  title: string;
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  leftIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
};
export function Button({
  title,
  variant = "primary",
  size = "md",
  leftIcon,
  fullWidth,
  style,
  ...rest
}: BtnProps) {
  const palette = {
    primary: { bg: colors.brand, fg: "#fff", border: colors.brand },
    outline: { bg: "transparent", fg: colors.text, border: colors.border },
    ghost: { bg: "transparent", fg: colors.brand, border: "transparent" },
    danger: { bg: colors.danger, fg: "#fff", border: colors.danger },
  }[variant];
  const padV = size === "sm" ? 8 : size === "lg" ? 16 : 12;
  const padH = size === "sm" ? 12 : size === "lg" ? 22 : 18;
  const txtSize = size === "sm" ? font.sm : font.md;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: 1,
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderRadius: radii.md,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        typeof style === "function" ? undefined : style,
      ]}
      {...rest}
    >
      {leftIcon && <Ionicons name={leftIcon} size={16} color={palette.fg} />}
      <Text style={{ color: palette.fg, fontSize: txtSize, fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}

export function Input({ style, ...rest }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textFaint}
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: radii.md,
          fontSize: font.md,
          color: colors.text,
        },
        style,
      ]}
      {...rest}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: font.xs,
        color: colors.textMuted,
        marginBottom: 6,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      }}
    >
      {children}
    </Text>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Label>{label}</Label>
      {children}
    </View>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warn" | "danger" | "info" | "brand";
}) {
  const map: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    success: { bg: colors.successSoft, fg: colors.success },
    warn: { bg: colors.warnSoft, fg: colors.warn },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    info: { bg: colors.infoSoft, fg: colors.info },
    brand: { bg: colors.brandSoft, fg: colors.brand },
  };
  const c = map[tone];
  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radii.pill,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: c.fg, fontWeight: "600", fontSize: font.xs }}>{children as any}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "success" | "warn" | "danger" | "info" | "neutral"> = {
    SUCCESS: "success",
    PAID: "success",
    COMPLETED: "success",
    ACTIVE: "success",
    PENDING: "warn",
    NEW: "info",
    CONTACTED: "info",
    DRAFT: "neutral",
    FAILED: "danger",
    CANCELLED: "danger",
    INACTIVE: "neutral",
  };
  return <Badge tone={map[status] ?? "neutral"}>{status}</Badge>;
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }} />;
}

export function EmptyState({
  title,
  subtitle,
  icon = "sparkles-outline",
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={{ alignItems: "center", padding: spacing.xxl }}>
      <View
        style={{
          height: 60,
          width: 60,
          borderRadius: 30,
          backgroundColor: colors.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Ionicons name={icon} size={28} color={colors.textFaint} />
      </View>
      <Text style={{ fontSize: font.md, fontWeight: "600", color: colors.text }}>{title}</Text>
      {subtitle && (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: font.sm,
            marginTop: 4,
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  p16: { padding: 16 },
  flex1: { flex: 1 },
});
