import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { WizardShell } from "@/src/components/wizard/WizardShell";
import { useCreateOrderStore } from "@/src/store/createOrderStore";
import { C, font, radius, space } from "@/src/theme";
import { SIZE_BASE_PRICE } from "@/src/utils/price";

const SIZES: { id: "studio" | "1q" | "2q" | "3q" | "4q+"; label: string }[] = [
  { id: "studio", label: "Studio" },
  { id: "1q", label: "1 quarto" },
  { id: "2q", label: "2 quartos" },
  { id: "3q", label: "3 quartos" },
  { id: "4q+", label: "4+ quartos" },
];

export default function TamanhoScreen() {
  const router = useRouter();
  const { size, setSize } = useCreateOrderStore();
  const [selected, setSelected] = useState(size);

  function handleContinue() {
    if (!selected) return;
    setSize(selected);
    router.push("/(client)/criar-pedido/adicionais");
  }

  return (
    <WizardShell step={3} footerLabel="Continuar" onFooterPress={handleContinue} footerDisabled={!selected}>
      <Text style={styles.title}>Qual é o tamanho da sua casa?</Text>

      <View style={{ gap: space.s }}>
        {SIZES.map((s) => {
          const isSelected = selected === s.id;
          return (
            <Pressable key={s.id} onPress={() => setSelected(s.id)} style={[styles.chip, isSelected && styles.chipSelected]}>
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{s.label}</Text>
              <Text style={styles.chipPrice}>R$ {SIZE_BASE_PRICE[s.id].toFixed(2).replace(".", ",")}</Text>
            </Pressable>
          );
        })}
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  chip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipSelected: {
    backgroundColor: C.purpleLight,
    borderColor: C.purplePrimary,
  },
  chipLabel: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  chipLabelSelected: { color: C.purplePrimary },
  chipPrice: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textMaximum },
});
