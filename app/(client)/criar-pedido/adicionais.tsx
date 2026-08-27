import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { WizardShell } from "@/src/components/wizard/WizardShell";
import { useCreateOrderStore } from "@/src/store/createOrderStore";
import { C, font, space } from "@/src/theme";
import { ADDONS, SIZE_BASE_PRICE } from "@/src/utils/price";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={[styles.track, on && styles.trackOn]}>
      <View style={[styles.handle, on && styles.handleOn]} />
    </Pressable>
  );
}

export default function AdicionaisScreen() {
  const router = useRouter();
  const { size, addonIds, toggleAddon } = useCreateOrderStore();
  const [selected, setSelected] = useState<string[]>(addonIds);

  const basePrice = size ? SIZE_BASE_PRICE[size] : 0;
  const subtotal = basePrice + selected.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);

  function handleToggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function handleContinue() {
    selected.forEach((id) => {
      if (!addonIds.includes(id)) toggleAddon(id);
    });
    addonIds.forEach((id) => {
      if (!selected.includes(id)) toggleAddon(id);
    });
    router.push("/(client)/criar-pedido/data-hora");
  }

  return (
    <WizardShell
      step={4}
      footerLabel="Continuar"
      onFooterPress={handleContinue}
      footerExtra={
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>R$ {subtotal.toFixed(2).replace(".", ",")}</Text>
        </View>
      }
    >
      <Text style={styles.title}>Deseja adicionar algo?</Text>

      <View>
        {ADDONS.map((addon) => (
          <View key={addon.id} style={styles.addonRow}>
            <Text style={styles.addonLabel}>{addon.label}</Text>
            <Text style={styles.addonPrice}>+R$ {addon.price.toFixed(2).replace(".", ",")}</Text>
            <Toggle on={selected.includes(addon.id)} onToggle={() => handleToggle(addon.id)} />
          </View>
        ))}
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingVertical: space.m,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  addonLabel: { flex: 1, fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  addonPrice: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  track: { width: 40, height: 22, borderRadius: 999, backgroundColor: C.border, padding: 2, justifyContent: "center" },
  trackOn: { backgroundColor: C.purplePrimary, alignItems: "flex-end" },
  handle: { width: 18, height: 18, borderRadius: 9999, backgroundColor: "#fff" },
  handleOn: {},
  subtotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subtotalLabel: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  subtotalValue: { fontFamily: font.bold, fontSize: font.h3, color: C.success },
});
