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
  // Encolher a fonte pra "MASTERCARD"/"HIPERCARD" caberem em 52px de largura
  // fixa cortava a palavra mesmo assim (testado ao vivo). Mais confiável
  // alargar o cartão pra nomes compridos do que arriscar estimativa de fonte.
  const long = brand.length > 6;
  const width = long ? 68 : 52;
  const fontSize = long ? 7 : 8;

  return (
    <View style={[styles.card, { backgroundColor, width }]}>
      <View style={styles.chip} />
      <Text style={[styles.brandText, { fontSize }]} numberOfLines={1}>
        {brand.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 34, borderRadius: 6, padding: 5, justifyContent: "space-between" },
  chip: { width: 14, height: 10, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)" },
  brandText: { fontFamily: font.bold, letterSpacing: 0.2, color: "#FFFFFF" },
});
