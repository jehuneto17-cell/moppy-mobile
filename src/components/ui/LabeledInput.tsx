import { StyleSheet, Text, TextInputProps, View } from "react-native";

import { C, font } from "@/src/theme";
import { Input } from "./Input";

export function LabeledInput({
  label,
  required,
  helper,
  error,
  ...inputProps
}: TextInputProps & { label?: string; required?: boolean; helper?: string; error?: string; state?: "normal" | "error" | "success" | "disabled" }) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: C.error }}> *</Text>}
        </Text>
      )}
      <Input state={error ? "error" : inputProps.state} {...inputProps} />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  label: { fontFamily: font.medium, fontSize: font.bodySm, color: C.textPrimary },
  errorText: { fontFamily: font.regular, fontSize: font.caption, color: C.error },
  helperText: { fontFamily: font.regular, fontSize: font.caption, color: C.textSecondary },
});
