import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { C, font, radius, shadowCard, space } from "@/src/theme";

export function ProfileFooterActions({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.box}>
      <Pressable
        style={styles.row}
        onPress={() =>
          Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: "destructive", onPress: onLogout },
          ])
        }
      >
        <Icon name="log-out" size={18} color={C.textMaximum} />
        <Text style={styles.rowText}>Sair</Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        style={styles.row}
        onPress={() =>
          Alert.alert(
            "Excluir conta",
            "Essa opção ainda não está disponível por aqui. Fale com o suporte do Moppy pra excluir sua conta."
          )
        }
      >
        <Icon name="trash-2" size={18} color={C.error} />
        <Text style={[styles.rowText, { color: C.error }]}>Excluir conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#fff", borderRadius: radius.l, ...shadowCard, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: space.m, padding: space.l },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: space.l },
  rowText: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
});
