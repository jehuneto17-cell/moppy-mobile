import { Pressable, StyleSheet, Text } from "react-native";

import { C, font } from "@/src/theme";

export function Radio({
  checked = false,
  disabled = false,
  label,
  onChange,
}: {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => !disabled && onChange?.(true)}
      style={[styles.row, disabled && { opacity: 0.5 }]}
    >
      <Pressable
        onPress={() => !disabled && onChange?.(true)}
        style={[styles.circle, { borderColor: checked ? C.purplePrimary : C.borderStrong }]}
      >
        {checked && <Pressable style={styles.dot} />}
      </Pressable>
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A78BFA" },
  label: { fontFamily: font.regular, fontSize: font.body, color: C.textPrimary },
});
