import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/hooks/useAuth";
import { C, font, space } from "@/src/theme";

export default function ClientPerfilScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{user?.email}</Text>
      <Button variant="primary" onPress={logout}>
        Sair
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.l },
  text: { fontSize: font.bodyLg, fontFamily: font.regular, color: C.textMaximum },
});
