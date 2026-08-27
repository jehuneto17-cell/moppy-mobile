import { StyleSheet, View } from "react-native";

import { C, radius } from "@/src/theme";

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    width: "100%",
    backgroundColor: C.border,
    borderRadius: radius.s,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: C.purplePrimary,
    borderRadius: radius.s,
  },
});
