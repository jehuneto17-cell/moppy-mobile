import { Pressable, StyleSheet, View } from "react-native";

import { C, radius, shadowCard } from "@/src/theme";

type State = "normal" | "selected" | "disabled";

export function Card({
  state = "normal",
  onPress,
  children,
  style,
}: {
  state?: State;
  onPress?: () => void;
  children: React.ReactNode;
  style?: object;
}) {
  const isSelected = state === "selected";
  const isDisabled = state === "disabled";
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={isDisabled ? undefined : onPress}
      style={[
        styles.base,
        {
          backgroundColor: isSelected ? C.purpleLight : "#fff",
          borderColor: isSelected ? C.purplePrimary : C.border,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderRadius: radius.l,
    borderWidth: 1,
    ...shadowCard,
  },
});
