import { StyleSheet, Text, View } from "react-native";

import { font } from "@/src/theme";

// Mini cartão colorido por bandeira, no lugar de um texto puro "VISA"/"MASTERCARD".
// Cores próprias da marca, sem reproduzir o logo oficial de cada bandeira.
const BRAND_COLORS: Record<string, string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  amex: "#2E77BC",
  elo: "#000000",
  hipercard: "#B3131B",
};

export function CardBrandBadge({ brand }: { brand: string }) {
  const backgroundColor = BRAND_COLORS[brand.toLowerCase()] ?? "#6B7280";

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.chip} />
      <Text style={styles.brandText}>{brand.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 52, height: 34, borderRadius: 6, padding: 5, justifyContent: "space-between" },
  chip: { width: 14, height: 10, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)" },
  brandText: { fontFamily: font.bold, fontSize: 8, letterSpacing: 0.3, color: "#FFFFFF" },
});
