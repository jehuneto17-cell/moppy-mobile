import { Pressable, StyleSheet, Text } from "react-native";

import { C, font, radius } from "@/src/theme";
import { Icon } from "./Icon";

export function Checkbox({
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
      onPress={() => !disabled && onChange?.(!checked)}
      style={[styles.row, disabled && { opacity: 0.5 }]}
    >
      <Pressable
        onPress={() => !disabled && onChange?.(!checked)}
        style={[
          styles.box,
          {
            borderColor: checked ? "transparent" : C.borderStrong,
            backgroundColor: checked ? C.purplePrimary : "transparent",
          },
        ]}
      >
        {checked && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
      </Pressable>
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.s,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontFamily: font.regular, fontSize: font.body, color: C.textPrimary },
});
