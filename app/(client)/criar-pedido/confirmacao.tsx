import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { C, font, radius, space } from "@/src/theme";

export default function ConfirmacaoScreen() {
  const router = useRouter();
  const { orderId, total } = useLocalSearchParams<{ orderId: string; total: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name="check-circle" size={48} color={C.success} strokeWidth={2.5} />
      </View>

      <Text style={styles.title}>Pedido criado com sucesso!</Text>
      <Text style={styles.subtitle}>Você será avisado assim que uma faxineira se candidatar. Pagamento será feito na véspera do serviço.</Text>

      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValueBold}>R$ {total?.replace(".", ",")}</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button variant="primary" size="large" onPress={() => router.replace(`/(client)/pedido/${orderId}`)} style={{ flex: 1 }}>
          Ver detalhes
        </Button>
        <Button variant="secondary" size="large" onPress={() => router.replace("/(client)/home")} style={{ flex: 1 }}>
          Voltar para Home
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, alignItems: "center", padding: space.xxl },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 9999,
    backgroundColor: C.successBg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: space.xxxxl,
    marginBottom: space.xxl,
  },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, textAlign: "center", marginBottom: space.m },
  subtitle: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: space.xxl },
  summaryBox: { width: "100%", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.l, marginBottom: space.l },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontFamily: font.medium, fontSize: font.labelSm, color: C.textMaximum },
  summaryValueBold: { fontFamily: font.bold, fontSize: font.labelSm, color: C.textMaximum },
  buttons: { flexDirection: "row", gap: space.m, width: "100%", marginTop: space.s },
});
