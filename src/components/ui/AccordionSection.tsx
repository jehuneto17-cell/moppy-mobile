import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Icon, type IconName } from "@/src/components/ui/Icon";
import { C, font, radius, shadowCard, space } from "@/src/theme";

export function AccordionSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: IconName;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const rotation = useSharedValue(isOpen ? 180 : 0);
  const progress = useSharedValue(isOpen ? 1 : 0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    rotation.value = withTiming(isOpen ? 180 : 0, { duration: 200 });
    progress.value = withTiming(isOpen ? 1 : 0, { duration: 220 });
  }, [isOpen]);

  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  // Anima altura de verdade (não entra/sai de repente) — mais confiável em
  // web do que entering/exiting do reanimated, que depende do motor CSS do
  // navegador e às vezes só troca instantaneamente sem transição.
  const bodyWrapperStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight,
    opacity: progress.value,
  }));

  return (
    <Animated.View layout={LinearTransition.duration(220)} style={styles.box}>
      <Pressable style={styles.header} onPress={onToggle}>
        <View style={styles.iconBox}>
          <Icon name={icon} size={18} color={C.purplePrimary} />
        </View>
        <Text style={[styles.title, isOpen && { color: C.purplePrimary }]}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <Icon name="chevron-down" size={18} color={isOpen ? C.purplePrimary : C.textSecondary} />
        </Animated.View>
      </Pressable>

      <Animated.View style={[{ overflow: "hidden" }, bodyWrapperStyle]}>
        <View style={styles.body} onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#fff", borderRadius: radius.l, ...shadowCard, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", gap: space.m, padding: space.l },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.m,
    backgroundColor: C.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum },
  body: { paddingHorizontal: space.l, paddingBottom: space.l, gap: space.m },
});
