import * as Haptics from "expo-haptics";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { C, font, radius } from "@/src/theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "small" | "medium" | "large";

const VARIANTS: Record<Variant, { bg: string; bgPressed: string; color: string; border?: string }> = {
  primary: { bg: C.purplePrimary, bgPressed: C.purpleDark, color: "#fff" },
  secondary: { bg: "#F3F4F6", bgPressed: "#E5E7EB", color: C.textMaximum, border: C.borderStrong },
  danger: { bg: C.error, bgPressed: C.errorDark, color: "#fff" },
  ghost: { bg: "transparent", bgPressed: C.purpleLight, color: C.purplePrimary },
};

const SIZES: Record<Size, { paddingV: number; paddingH: number; fontSize: number; height?: number }> = {
  small: { paddingV: 8, paddingH: 12, fontSize: font.bodySm },
  medium: { paddingV: 12, paddingH: 16, fontSize: font.label },
  large: { paddingV: 14, paddingH: 20, fontSize: font.label, height: 44 },
};

export function Button({
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  onPress,
  children,
  style,
}: {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  children: string;
  style?: object;
}) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={
          isDisabled
            ? undefined
            : () => {
                Haptics.impactAsync(
                  variant === "danger"
                    ? Haptics.ImpactFeedbackStyle.Medium
                    : Haptics.ImpactFeedbackStyle.Light
                );
                onPress?.();
              }
        }
        onPressIn={() => {
          if (isDisabled) return;
          setPressed(true);
          scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          setPressed(false);
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        disabled={isDisabled}
        style={[
          styles.base,
          {
            backgroundColor: pressed && !isDisabled ? v.bgPressed : v.bg,
            borderWidth: v.border ? 1 : 0,
            borderColor: v.border,
            paddingVertical: s.paddingV,
            paddingHorizontal: s.paddingH,
            height: s.height,
            opacity: isDisabled && !loading ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.color} size="small" />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text style={[styles.label, { color: v.color, fontSize: s.fontSize }]}>{children}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.l,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: font.medium,
  },
});
