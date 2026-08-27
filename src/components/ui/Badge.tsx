import { StyleSheet, Text, View } from "react-native";

import { C, font, radius } from "@/src/theme";

type Variant = "default" | "info" | "success" | "warning" | "danger";

const VARIANTS: Record<Variant, { bg: string; color: string }> = {
  default: { bg: C.purpleLight, color: C.purpleVeryDark },
  info: { bg: C.infoBg, color: C.infoDark },
  success: { bg: C.successBg, color: C.successDark },
  warning: { bg: C.warningBg, color: C.warningDark },
  danger: { bg: C.errorBg, color: C.errorDarkest },
};

export function Badge({ variant = "default", children, style }: { variant?: Variant; children: string; style?: object }) {
  const v = VARIANTS[variant];
  return (
    <View style={[styles.base, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
  },
  text: { fontFamily: font.medium, fontSize: font.labelSm },
});
