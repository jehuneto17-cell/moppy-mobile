import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/ui/Card";
import { Icon } from "@/src/components/ui/Icon";
import { WizardShell } from "@/src/components/wizard/WizardShell";
import { useCreateOrderStore } from "@/src/store/createOrderStore";
import { C, font, radius, space } from "@/src/theme";

const TIERS = [
  { id: "normal" as const, name: "Normal", description: "Sem custo adicional" },
  { id: "baixa" as const, name: "Urgência Baixa", description: "+R$ 3,50 · destaca por 6h" },
  { id: "alta" as const, name: "Urgência Alta", description: "+R$ 5,50 · destaca por 24h" },
];

export default function UrgenciaScreen() {
  const router = useRouter();
  const { setUrgencyTier } = useCreateOrderStore();
  const [selected, setSelected] = useState<(typeof TIERS)[number]["id"]>("normal");

  function handleContinue() {
    setUrgencyTier(selected);
    router.push("/(client)/criar-pedido/pagamento");
  }

  return (
    <WizardShell step={7} footerLabel="Continuar para pagamento" onFooterPress={handleContinue}>
      <Text style={styles.title}>Quer aumentar sua visibilidade?</Text>
      <Text style={styles.subtitle}>
        Destaque seu pedido para receber propostas mais rápido. Essa taxa não é reembolsável, mesmo se ninguém aceitar o pedido.
      </Text>

      <View style={{ gap: space.m }}>
        {TIERS.map((tier) => (
          <Card key={tier.id} state={selected === tier.id ? "selected" : "normal"} onPress={() => setSelected(tier.id)}>
            <View style={styles.row}>
              <View>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierDesc}>{tier.description}</Text>
              </View>
              {selected === tier.id && <Icon name="check-circle" size={20} color={C.purplePrimary} />}
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.warningBox}>
        <Icon name="alert-triangle" size={16} color={C.warning} />
        <Text style={styles.warningText}>Valor não reembolsável, mesmo que ninguém aceite o pedido.</Text>
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.m },
  subtitle: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, lineHeight: 22, marginBottom: space.xxl },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tierName: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  tierDesc: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary, marginTop: 2 },
  warningBox: {
    flexDirection: "row",
    gap: space.s,
    alignItems: "flex-start",
    backgroundColor: C.warningBg,
    borderRadius: radius.l,
    padding: space.m,
    marginTop: space.xl,
  },
  warningText: { flex: 1, fontFamily: font.regular, fontSize: font.labelSm, color: C.warningDark, lineHeight: 18 },
});
