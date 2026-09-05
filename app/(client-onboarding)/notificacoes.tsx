import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { C, font, space } from "@/src/theme";

export default function OnboardingNotificacoesScreen() {
  const router = useRouter();

  function goHome() {
    router.replace("/(client)/home");
  }

  async function handleEnable() {
    await Notifications.requestPermissionsAsync();
    goHome();
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name="bell" size={40} color={C.purpleStrong} />
      </View>

      <Text style={styles.title}>Fique por dentro</Text>
      <Text style={styles.subtitle}>Avise-me quando uma faxineira aceitar meu pedido e quando o serviço estiver perto de terminar</Text>

      <View style={styles.buttons}>
        <Button variant="primary" size="large" onPress={handleEnable} style={{ width: "100%" }}>
          Ativar notificações
        </Button>
        <Button variant="ghost" size="large" onPress={goHome} style={{ width: "100%" }}>
          Talvez depois
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, alignItems: "center", justifyContent: "center", padding: space.xxl },
  iconCircle: { width: 112, height: 112, borderRadius: 9999, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center", marginBottom: space.xxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, textAlign: "center", marginBottom: space.m },
  subtitle: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", lineHeight: 22, maxWidth: 300, marginBottom: space.xxxl },
  buttons: { gap: space.m, width: "100%" },
});
