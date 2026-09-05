import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { useAuth } from "@/src/hooks/useAuth";
import { useCards } from "@/src/hooks/useCards";
import { tokenizeCard } from "@/src/services/asaas";
import { C, font, space } from "@/src/theme";

export default function OnboardingCartaoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addCard } = useCards(user?.uid ?? null);
  const [form, setForm] = useState({ number: "", holderName: "", expiryMonth: "", expiryYear: "", cvv: "", cpf: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredFilled =
    form.number.length >= 16 &&
    form.expiryMonth &&
    form.expiryYear &&
    form.cvv.length >= 3 &&
    form.holderName.trim().length > 0 &&
    form.cpf.replace(/\D/g, "").length === 11 &&
    form.phone.replace(/\D/g, "").length >= 10;

  async function handleContinue() {
    if (!user || !requiredFilled) return;
    setSaving(true);
    setError(null);
    try {
      const tokenized = await tokenizeCard({
        number: form.number,
        holderName: form.holderName,
        expiryMonth: Number(form.expiryMonth),
        expiryYear: Number(form.expiryYear),
        cvv: form.cvv,
        cpf: form.cpf.replace(/\D/g, ""),
        phone: form.phone.replace(/\D/g, ""),
      });
      await addCard(user.uid, { token: tokenized.token, brand: tokenized.brand, last_four: tokenized.lastFour, holder_name: form.holderName });
      router.replace("/(client-onboarding)/aceitar-termos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao cadastrar cartão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl, paddingBottom: 96 }}>
      <Text style={styles.title}>Adicione um cartão</Text>

      <View style={{ gap: space.m }}>
        <LabeledInput
          label="Número do cartão"
          placeholder="0000 0000 0000 0000"
          keyboardType="numeric"
          value={form.number}
          onChangeText={(v) => setForm({ ...form, number: v })}
        />
        <View style={{ flexDirection: "row", gap: space.m }}>
          <View style={{ flex: 1 }}>
            <LabeledInput label="Mês" placeholder="MM" keyboardType="numeric" maxLength={2} value={form.expiryMonth} onChangeText={(v) => setForm({ ...form, expiryMonth: v })} />
          </View>
          <View style={{ flex: 1 }}>
            <LabeledInput label="Ano" placeholder="AAAA" keyboardType="numeric" maxLength={4} value={form.expiryYear} onChangeText={(v) => setForm({ ...form, expiryYear: v })} />
          </View>
          <View style={{ flex: 1 }}>
            <LabeledInput label="CVV" placeholder="000" keyboardType="numeric" maxLength={4} value={form.cvv} onChangeText={(v) => setForm({ ...form, cvv: v })} />
          </View>
        </View>
        <LabeledInput label="Nome do titular" placeholder="Como está no cartão" value={form.holderName} onChangeText={(v) => setForm({ ...form, holderName: v })} />
        <LabeledInput label="CPF" placeholder="Somente números" keyboardType="numeric" maxLength={11} value={form.cpf} onChangeText={(v) => setForm({ ...form, cpf: v.replace(/\D/g, "") })} />
        <LabeledInput label="Telefone" placeholder="DDD + número" keyboardType="numeric" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v.replace(/\D/g, "") })} />
      </View>

      {error && (
        <View style={{ marginTop: space.l }}>
          <Alert variant="error">{error}</Alert>
        </View>
      )}

      <Button variant="primary" size="large" disabled={!requiredFilled} loading={saving} onPress={handleContinue} style={{ marginTop: space.xxl }}>
        Salvar cartão
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
});
