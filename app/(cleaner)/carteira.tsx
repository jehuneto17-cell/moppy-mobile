import { StyleSheet, Text, View } from "react-native";

import { C, font } from "@/src/theme";

export default function CleanerCarteiraScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Carteira</Text>
      <Text style={styles.subtext}>Saldo e saques chegam no Bloco 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  text: { fontSize: 18, fontFamily: font.bold, color: C.textMaximum },
  subtext: { fontSize: 13, fontFamily: font.regular, color: C.textSecondary },
});
