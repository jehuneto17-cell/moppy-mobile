import { Image, StyleSheet, Text, View } from "react-native";

import { C, font } from "@/src/theme";

type Size = "small" | "medium" | "large" | "xlarge";
const SIZES: Record<Size, number> = { small: 32, medium: 48, large: 64, xlarge: 80 };

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "medium",
  status,
}: {
  src?: string;
  name?: string;
  size?: Size;
  status?: "online" | "offline";
}) {
  const px = SIZES[size];

  return (
    <View style={{ width: px, height: px }}>
      {src ? (
        <Image source={{ uri: src }} style={[styles.circle, { width: px, height: px, borderWidth: 1, borderColor: C.border }]} />
      ) : (
        <View
          style={[
            styles.circle,
            styles.placeholder,
            { width: px, height: px, borderWidth: 1, borderColor: C.border },
          ]}
        >
          <Text style={{ fontFamily: font.medium, fontSize: Math.max(10, px * 0.32), color: C.purpleVeryDark }}>
            {initials(name)}
          </Text>
        </View>
      )}
      {status && (
        <View
          style={[
            styles.statusDot,
            {
              width: px * 0.28,
              height: px * 0.28,
              backgroundColor: status === "online" ? C.success : C.textSecondary,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { borderRadius: 9999 },
  placeholder: { backgroundColor: "#E9D5FF", alignItems: "center", justifyContent: "center" },
  statusDot: { position: "absolute", bottom: 0, right: 0, borderRadius: 9999, borderWidth: 2, borderColor: "#fff" },
});
