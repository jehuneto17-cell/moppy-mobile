import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const cardStyle = [
    styles.base,
    {
      backgroundColor: isSelected ? C.purpleLight : "#fff",
      borderColor: isSelected ? C.purplePrimary : C.border,
      opacity: isDisabled ? 0.5 : 1,
    },
  ];

  if (!onPress) {
    return <View style={[...cardStyle, style]}>{children}</View>;
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={
          isDisabled
            ? undefined
            : () => {
                Haptics.selectionAsync();
                onPress();
              }
        }
        onPressIn={() => {
          if (isDisabled) return;
          scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        style={cardStyle}
      >
        {children}
      </Pressable>
    </Animated.View>
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
