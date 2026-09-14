import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/ui/Card";
import { Icon } from "@/src/components/ui/Icon";
import { WizardShell } from "@/src/components/wizard/WizardShell";
import { useCreateOrderStore } from "@/src/store/createOrderStore";
import { C, font, space } from "@/src/theme";

const OPTIONS = [
  { id: "standard" as const, title: "Limpeza Padrão", desc: "Dusting, varrer, mopar, banheiros", icon: "cleaning" as const },
  { id: "heavy" as const, title: "Limpeza Pesada", desc: "Paredes, armários, fundo de tudo", icon: "heavy-clean" as const },
  { id: "laundry" as const, title: "Passar Roupas", desc: "Pela metragem da casa", icon: "iron" as const },
];

export default function TipoScreen() {
  const router = useRouter();
  const { setServiceType } = useCreateOrderStore();

  function handleSelect(id: (typeof OPTIONS)[number]["id"]) {
    setServiceType(id);
    router.push("/(client)/criar-pedido/tamanho");
  }

  return (
    <WizardShell step={2}>
      <Text style={styles.title}>Qual é o tipo de limpeza?</Text>

      <View style={{ gap: space.m }}>
        {OPTIONS.map((opt) => (
          <Card key={opt.id} onPress={() => handleSelect(opt.id)}>
            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Icon name={opt.icon} size={28} color={C.purplePrimary} />
              </View>
              <View>
                <Text style={styles.optTitle}>{opt.title}</Text>
                <Text style={styles.optDesc}>{opt.desc}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  iconCircle: { width: 48, height: 48, borderRadius: 9999, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center" },
  optTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum },
  optDesc: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary, marginTop: 2 },
});
