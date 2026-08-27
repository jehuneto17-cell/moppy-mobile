import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { useAuth } from "@/src/hooks/useAuth";
import { useCards } from "@/src/hooks/useCards";
import { tokenizeCard } from "@/src/services/asaas";
import { C, font, space } from "@/src/theme";

export default function NovoCartaoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addCard } = useCards(user?.uid ?? null);
  const [form, setForm] = useState({ number: "", holderName: "", expiryMonth: "", expiryYear: "", cvv: "" });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const tokenized = await tokenizeCard({
      number: form.number,
      holderName: form.holderName,
      expiryMonth: Number(form.expiryMonth),
      expiryYear: Number(form.expiryYear),
      cvv: form.cvv,
    });
    await addCard(user.uid, { token: tokenized.token, brand: tokenized.brand, last_four: tokenized.lastFour, holder_name: form.holderName });
    setSaving(false);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar cartão</Text>

      <View style={{ gap: space.m }}>
        <LabeledInput label="Número do cartão" keyboardType="numeric" value={form.number} onChangeText={(v) => setForm({ ...form, number: v })} />
        <LabeledInput label="Nome no cartão" value={form.holderName} onChangeText={(v) => setForm({ ...form, holderName: v })} />
        <View style={{ flexDirection: "row", gap: space.m }}>
          <View style={{ flex: 1 }}>
            <LabeledInput label="Mês" keyboardType="numeric" maxLength={2} value={form.expiryMonth} onChangeText={(v) => setForm({ ...form, expiryMonth: v })} />
          </View>
          <View style={{ flex: 1 }}>
            <LabeledInput label="Ano" keyboardType="numeric" maxLength={4} value={form.expiryYear} onChangeText={(v) => setForm({ ...form, expiryYear: v })} />
          </View>
          <View style={{ flex: 1 }}>
            <LabeledInput label="CVV" keyboardType="numeric" maxLength={4} value={form.cvv} onChangeText={(v) => setForm({ ...form, cvv: v })} />
          </View>
        </View>
      </View>

      <Button variant="primary" size="large" loading={saving} onPress={handleSave} style={{ marginTop: space.xxl }}>
        Salvar cartão
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
});
