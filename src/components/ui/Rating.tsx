import { Pressable, View } from "react-native";

import { C } from "@/src/theme";
import { Icon } from "./Icon";

type Size = "small" | "medium" | "large";
const SIZES: Record<Size, number> = { small: 16, medium: 24, large: 32 };

export function Rating({
  value = 0,
  max = 5,
  size = "medium",
  readonly = false,
  onChange,
}: {
  value?: number;
  max?: number;
  size?: Size;
  readonly?: boolean;
  onChange?: (value: number) => void;
}) {
  const px = SIZES[size];

  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <Pressable key={i} onPress={() => !readonly && onChange?.(i + 1)} disabled={readonly}>
            <Icon name="star" size={px} color={filled ? C.warning : C.borderStrong} fill={filled ? C.warning : C.borderStrong} strokeWidth={0} />
          </Pressable>
        );
      })}
    </View>
  );
}
