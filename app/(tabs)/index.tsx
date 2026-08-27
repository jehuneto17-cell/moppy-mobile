import { Redirect } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/hooks/useAuth";
import { C } from "@/src/theme";

export default function HomeScreen() {
  const { user, initializing, logout } = useAuth();

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.center}>
      <Text style={styles.text}>Logado como {user.email}</Text>
      <Pressable onPress={logout} style={styles.button}>
        <Text style={styles.buttonText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  text: { fontSize: 16, color: C.textoMaximo },
  button: {
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "500" },
});
