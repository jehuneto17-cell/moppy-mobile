import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { C, font, radius, space } from "@/src/theme";

const SIZE_LABEL: Record<string, string> = { studio: "Studio", "1q": "1 quarto", "2q": "2 quartos", "3q": "3 quartos", "4q+": "4+ quartos" };
const TYPE_LABEL: Record<string, string> = { standard: "Limpeza Padrão", heavy: "Limpeza Pesada", laundry: "Passar Roupas" };

function formatDateTime(date?: string, time?: string) {
  if (!date || !time) return "-";
  const [, month, day] = date.split("-");
  return `${day}/${month}, ${time.replace(":", "h")}`;
}

export default function ConfirmacaoScreen() {
  const router = useRouter();
  const { orderId, total, serviceType, size, scheduledDate, scheduledTime } = useLocalSearchParams<{
    orderId: string;
    total: string;
    serviceType?: string;
    size?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }>();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name="check-circle" size={48} color={C.success} strokeWidth={2.5} />
      </View>

      <Text style={styles.title}>Pedido criado com sucesso!</Text>
      <Text style={styles.subtitle}>Você será avisado assim que uma faxineira se candidatar. Pagamento será feito na véspera do serviço.</Text>

      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelMuted}>Tipo</Text>
          <Text style={styles.summaryValue}>{TYPE_LABEL[serviceType ?? ""] ?? "-"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelMuted}>Tamanho</Text>
          <Text style={styles.summaryValue}>{SIZE_LABEL[size ?? ""] ?? "-"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelMuted}>Data/hora</Text>
          <Text style={styles.summaryValue}>{formatDateTime(scheduledDate, scheduledTime)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValueBold}>R$ {total?.replace(".", ",")}</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button variant="primary" size="large" onPress={() => router.replace(`/(client)/pedido/${orderId}`)} style={{ flex: 1 }}>
          Ver detalhes do pedido
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
  summaryBox: { width: "100%", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.l, gap: space.s, marginBottom: space.l },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryTotalRow: { paddingTop: space.s, borderTopWidth: 1, borderTopColor: C.border },
  summaryLabelMuted: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  summaryValue: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textMaximum },
  summaryLabel: { fontFamily: font.medium, fontSize: font.labelSm, color: C.textMaximum },
  summaryValueBold: { fontFamily: font.bold, fontSize: font.labelSm, color: C.textMaximum },
  buttons: { flexDirection: "row", gap: space.m, width: "100%", marginTop: space.s },
});
