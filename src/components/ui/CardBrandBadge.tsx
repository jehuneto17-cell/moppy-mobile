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
  // "MASTERCARD"/"HIPERCARD" não cabem em 8px numa linha só — encolhe a fonte
  // pros nomes compridos em vez de deixar quebrar em duas linhas.
  const fontSize = brand.length > 6 ? 6 : 8;

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.chip} />
      <Text style={[styles.brandText, { fontSize }]} numberOfLines={1}>
        {brand.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 52, height: 34, borderRadius: 6, padding: 5, justifyContent: "space-between" },
  chip: { width: 14, height: 10, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)" },
  brandText: { fontFamily: font.bold, letterSpacing: 0.2, color: "#FFFFFF" },
});
