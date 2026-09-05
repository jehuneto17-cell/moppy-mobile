import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AddressMapPreview } from "@/src/components/ui/AddressMapPreview";
import { Button } from "@/src/components/ui/Button";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { useAddresses } from "@/src/hooks/useAddresses";
import { useAuth } from "@/src/hooks/useAuth";
import { geocodeAddress } from "@/src/services/mapbox";
import { C, font, space } from "@/src/theme";

export default function OnboardingEnderecoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addAddress } = useAddresses(user?.uid ?? null);
  const [form, setForm] = useState({ street: "", number: "", complement: "", neighborhood: "", city: "", state: "", postal_code: "" });
  const [saving, setSaving] = useState(false);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);

  const requiredFilled = form.street && form.number && form.neighborhood && form.city && form.state && form.postal_code;

  // Geocodifica com debounce enquanto o cliente digita, só pra atualizar o preview do pin.
  useEffect(() => {
    if (!requiredFilled) {
      setPin(null);
      return;
    }
    const timer = setTimeout(async () => {
      const coords = await geocodeAddress(form);
      setPin(coords.lat != null && coords.lng != null ? { lat: coords.lat, lng: coords.lng } : null);
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.street, form.number, form.neighborhood, form.city, form.state, form.postal_code]);

  async function handleContinue() {
    if (!user || !requiredFilled) return;
    setSaving(true);
    await addAddress(user.uid, form);
    setSaving(false);
    router.replace("/(client-onboarding)/cartao");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl, paddingBottom: 96 }}>
      <Text style={styles.title}>Onde fica sua casa?</Text>

      <View style={{ gap: space.m }}>
        <LabeledInput label="Rua" placeholder="Nome da rua" value={form.street} onChangeText={(v) => setForm({ ...form, street: v })} />
        <LabeledInput label="Número" placeholder="Ex: 123" value={form.number} onChangeText={(v) => setForm({ ...form, number: v })} keyboardType="numeric" />
        <LabeledInput label="Complemento" placeholder="Apto, bloco... (opcional)" value={form.complement} onChangeText={(v) => setForm({ ...form, complement: v })} />
        <LabeledInput label="Bairro" placeholder="Nome do bairro" value={form.neighborhood} onChangeText={(v) => setForm({ ...form, neighborhood: v })} />
        <LabeledInput label="Cidade" placeholder="Nome da cidade" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
        <LabeledInput label="UF" placeholder="Ex: SP" value={form.state} onChangeText={(v) => setForm({ ...form, state: v })} maxLength={2} autoCapitalize="characters" />
        <LabeledInput label="CEP" placeholder="00000-000" value={form.postal_code} onChangeText={(v) => setForm({ ...form, postal_code: v })} keyboardType="numeric" />
        <AddressMapPreview lat={pin?.lat} lng={pin?.lng} />
      </View>

      <Button variant="primary" size="large" disabled={!requiredFilled} loading={saving} onPress={handleContinue} style={{ marginTop: space.xxl }}>
        Salvar endereço
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
});
