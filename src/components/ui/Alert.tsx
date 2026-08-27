import { StyleSheet, Text, View } from "react-native";

import { C, font, radius } from "@/src/theme";
import { Icon } from "./Icon";

type Variant = "info" | "error" | "success" | "warning";

const VARIANTS: Record<Variant, { bg: string; border: string; color: string; icon: "info" | "alert-triangle" | "check-circle" }> = {
  info: { bg: C.infoBg, border: C.info, color: C.infoDark, icon: "info" },
  error: { bg: C.errorBg, border: C.error, color: C.errorDarkest, icon: "alert-triangle" },
  success: { bg: C.successBg, border: C.success, color: C.successDark, icon: "check-circle" },
  warning: { bg: C.warningBg, border: C.warning, color: C.warningDark, icon: "alert-triangle" },
};

export function Alert({ variant = "info", children }: { variant?: Variant; children: string }) {
  const v = VARIANTS[variant];
  return (
    <View style={[styles.base, { backgroundColor: v.bg, borderLeftColor: v.border }]}>
      <Icon name={v.icon} size={16} color={v.border} />
      <Text style={[styles.text, { color: v.color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.s,
    borderLeftWidth: 3,
  },
  text: { flex: 1, fontFamily: font.regular, fontSize: font.bodySm },
});
