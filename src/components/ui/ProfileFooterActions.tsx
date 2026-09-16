import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { C, font, radius, shadowCard, space } from "@/src/theme";

// Alert.alert não mostra nada no build web (react-native-web não implementa
// o dialog nativo) — cai pro window.confirm/alert do navegador nesse caso.
function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Sair", style: "destructive", onPress: onConfirm },
  ]);
}

function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function ProfileFooterActions({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.box}>
      <Pressable style={styles.row} onPress={() => confirm("Sair da conta", "Tem certeza que deseja sair?", onLogout)}>
        <Icon name="log-out" size={18} color={C.textMaximum} />
        <Text style={styles.rowText}>Sair</Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        style={styles.row}
        onPress={() =>
          notify("Excluir conta", "Essa opção ainda não está disponível por aqui. Fale com o suporte do Moppy pra excluir sua conta.")
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
