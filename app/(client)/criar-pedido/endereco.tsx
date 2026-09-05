import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { AddressMapPreview } from "@/src/components/ui/AddressMapPreview";
import { Card } from "@/src/components/ui/Card";
import { Icon } from "@/src/components/ui/Icon";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { Button } from "@/src/components/ui/Button";
import { WizardShell } from "@/src/components/wizard/WizardShell";
import { useAddresses, type Address } from "@/src/hooks/useAddresses";
import { useAuth } from "@/src/hooks/useAuth";
import { geocodeAddress } from "@/src/services/mapbox";
import { useCreateOrderStore } from "@/src/store/createOrderStore";
import { C, font, space } from "@/src/theme";

export default function EnderecoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addresses, addAddress } = useAddresses(user?.uid ?? null);
  const { address, setAddress, notes, setNotes } = useCreateOrderStore();
  const [selectedId, setSelectedId] = useState<string | null>(address?.address_id ?? null);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [showError, setShowError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ street: "", number: "", complement: "", neighborhood: "", city: "", state: "", postal_code: "" });
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);

  const formFilled = form.street && form.number && form.neighborhood && form.city && form.state && form.postal_code;

  // Geocodifica com debounce enquanto o cliente digita o endereço novo, só pra atualizar o preview do pin.
  useEffect(() => {
    if (!formFilled) {
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

  async function handleSaveAddress() {
    if (!user) return;
    setSaving(true);
    await addAddress(user.uid, form);
    setSaving(false);
    setShowForm(false);
  }

  function handleContinue() {
    const selected = addresses.find((a) => a.address_id === selectedId);
    if (!selected) {
      setShowError(true);
      return;
    }
    setAddress(selected);
    router.push("/(client)/criar-pedido/tipo");
  }

  return (
    <WizardShell step={1} footerLabel="Continuar" onFooterPress={handleContinue}>
      <Text style={styles.title}>Onde limpamos?</Text>

      <View style={{ gap: space.m }}>
        {addresses.map((addr) => (
          <Card key={addr.address_id} state={selectedId === addr.address_id ? "selected" : "normal"} onPress={() => setSelectedId(addr.address_id)}>
            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Icon name="home" size={20} color={C.purplePrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addrPrimary}>
                  {addr.street}, {addr.number}
                </Text>
                <Text style={styles.addrSecondary}>{addr.neighborhood}</Text>
              </View>
              {selectedId === addr.address_id && <Icon name="check-circle" size={22} color={C.purplePrimary} />}
            </View>
          </Card>
        ))}
      </View>

      {!showForm && (
        <Pressable onPress={() => setShowForm(true)}>
          <Text style={styles.addLink}>+ Adicionar novo endereço</Text>
        </Pressable>
      )}

      {showForm && (
        <View style={{ gap: space.m, marginTop: space.l }}>
          <LabeledInput label="Rua" value={form.street} onChangeText={(v) => setForm({ ...form, street: v })} />
          <LabeledInput label="Número" value={form.number} onChangeText={(v) => setForm({ ...form, number: v })} />
          <LabeledInput label="Complemento (opcional)" value={form.complement} onChangeText={(v) => setForm({ ...form, complement: v })} />
          <LabeledInput label="Bairro" value={form.neighborhood} onChangeText={(v) => setForm({ ...form, neighborhood: v })} />
          <LabeledInput label="Cidade" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
          <LabeledInput label="UF" value={form.state} onChangeText={(v) => setForm({ ...form, state: v })} maxLength={2} autoCapitalize="characters" />
          <LabeledInput label="CEP" value={form.postal_code} onChangeText={(v) => setForm({ ...form, postal_code: v })} keyboardType="numeric" />
          <AddressMapPreview lat={pin?.lat} lng={pin?.lng} />
          <Button variant="secondary" loading={saving} onPress={handleSaveAddress}>
            Salvar endereço
          </Button>
        </View>
      )}

      {showError && (
        <View style={{ marginTop: space.xl }}>
          <Alert variant="error">Selecione um endereço para continuar.</Alert>
        </View>
      )}

      <View style={{ marginTop: space.xl }}>
        <LabeledInput
          label="Observações (opcional)"
          placeholder="Ex: portão azul, cachorro no quintal, interfone quebrado..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ height: 72, textAlignVertical: "top" }}
        />
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  iconCircle: { width: 40, height: 40, borderRadius: 9999, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center" },
  addrPrimary: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  addrSecondary: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary },
  addLink: { fontFamily: font.medium, fontSize: font.body, color: C.purplePrimary, marginTop: space.l },
});
