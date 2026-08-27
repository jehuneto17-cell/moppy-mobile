import { StyleSheet, Text, View } from "react-native";

import { C, font } from "@/src/theme";

export default function ClientHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Cliente</Text>
      <Text style={styles.subtext}>Pedidos e criar novo pedido chegam no Bloco 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  text: { fontSize: 18, fontFamily: font.bold, color: C.textMaximum },
  subtext: { fontSize: 13, fontFamily: font.regular, color: C.textSecondary },
});
