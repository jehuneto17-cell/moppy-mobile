import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { WizardShell } from "@/src/components/wizard/WizardShell";
import { useCreateOrderStore } from "@/src/store/createOrderStore";
import { C, font, space } from "@/src/theme";
import { ADDONS, computeOrderPrice } from "@/src/utils/price";

const SIZE_LABEL: Record<string, string> = { studio: "Studio", "1q": "1 quarto", "2q": "2 quartos", "3q": "3 quartos", "4q+": "4+ quartos" };
const TYPE_LABEL: Record<string, string> = { standard: "Limpeza Padrão", heavy: "Limpeza Pesada", laundry: "Passar Roupas" };

function formatPrice(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

export default function RevisaoScreen() {
  const router = useRouter();
  const { serviceType, size, addonIds } = useCreateOrderStore();

  const price = computeOrderPrice(size ?? "", addonIds, "normal");

  return (
    <WizardShell step={6} footerLabel="Próximo passo" onFooterPress={() => router.push("/(client)/criar-pedido/urgencia")}>
      <Text style={styles.title}>Revisar seu pedido</Text>

      <View style={{ gap: space.s }}>
        <View style={styles.line}>
          <Text style={styles.lineLabel}>
            Base ({TYPE_LABEL[serviceType ?? ""]}, {SIZE_LABEL[size ?? ""]})
          </Text>
          <Text style={styles.lineValue}>{formatPrice(price.basePrice)}</Text>
        </View>

        {addonIds.map((id) => {
          const addon = ADDONS.find((a) => a.id === id);
          if (!addon) return null;
          return (
            <View key={id} style={styles.line}>
              <Text style={styles.lineLabel}>+ {addon.label}</Text>
              <Text style={styles.lineValue}>{formatPrice(addon.price)}</Text>
            </View>
          );
        })}

        <View style={styles.line}>
          <Text style={styles.feeLabel}>+ Taxa de processamento (50% da taxa Asaas)</Text>
          <Text style={styles.feeValue}>{formatPrice(price.clientFeeShare)}</Text>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(price.netTotalClient)}</Text>
      </View>

      <Text style={styles.disclaimer}>Comissão de 15% é descontada do valor recebido pela faxineira, não do cliente.</Text>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  line: { flexDirection: "row", justifyContent: "space-between", gap: space.m },
  lineLabel: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  lineValue: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  feeLabel: { flex: 1, fontFamily: font.regular, fontSize: font.body, color: C.textSecondary },
  feeValue: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: space.l,
    paddingTop: space.l,
  },
  totalLabel: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  totalValue: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  disclaimer: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary, marginTop: space.l, lineHeight: 19 },
});
