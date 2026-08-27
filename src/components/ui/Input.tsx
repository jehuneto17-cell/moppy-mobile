import { useState } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

import { C, font, radius } from "@/src/theme";

type State = "normal" | "error" | "success" | "disabled";

export function Input({
  state = "normal",
  style,
  editable,
  ...rest
}: TextInputProps & { state?: State }) {
  const [focused, setFocused] = useState(false);
  const isError = state === "error";
  const isSuccess = state === "success";
  const isDisabled = state === "disabled" || editable === false;

  const borderColor = isDisabled
    ? C.border
    : isError
    ? C.error
    : isSuccess
    ? C.success
    : focused
    ? C.purplePrimary
    : C.border;

  return (
    <TextInput
      editable={!isDisabled}
      placeholderTextColor={C.textSecondary}
      onFocus={(e) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
      style={[
        styles.base,
        { borderColor, backgroundColor: isDisabled ? "#F3F4F6" : "#fff" },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: font.regular,
    fontSize: font.body,
    color: C.textMaximum,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.m,
    borderWidth: 1,
    minHeight: 40,
  },
});
