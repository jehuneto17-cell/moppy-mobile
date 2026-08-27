import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { C, font, space } from "@/src/theme";

export default function CandidaturaResultadoScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status: "sucesso" | "erro" }>();
  const isSuccess = status === "sucesso";

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={[styles.iconCircle, { backgroundColor: isSuccess ? C.successBg : C.errorBg }]}>
          <Icon name={isSuccess ? "check-circle" : "alert-triangle"} size={64} color={isSuccess ? C.success : C.error} />
        </View>

        <Text style={styles.title}>{isSuccess ? "Candidatura enviada!" : "Você já tem um serviço agendado nesse horário"}</Text>
        <Text style={styles.description}>
          {isSuccess ? "Fique de olho nas notificações. Você saberá em breve se foi selecionada." : "Escolha outro pedido."}
        </Text>
      </View>

      <Button variant="primary" size="large" onPress={() => router.replace("/(cleaner)/buscar")} style={{ width: "100%" }}>
        {isSuccess ? "Voltar para o feed" : "Voltar"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl },
  iconCircle: { width: 112, height: 112, borderRadius: 9999, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, textAlign: "center", marginTop: space.xxl },
  description: { fontFamily: font.regular, fontSize: font.body, color: "#6B7280", textAlign: "center", marginTop: space.s, maxWidth: 300, lineHeight: 21 },
});
