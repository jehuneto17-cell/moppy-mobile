import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { C, font } from "@/src/theme";

type Size = "small" | "medium" | "large";
const SIZES: Record<Size, "small" | "large"> = { small: "small", medium: "small", large: "large" };

export function Spinner({ size = "medium", label }: { size?: Size; label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={SIZES[size]} color={C.purplePrimary} />
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 8 },
  label: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary },
});
