import { useRouter } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { useAddresses } from "@/src/hooks/useAddresses";
import { useAuth } from "@/src/hooks/useAuth";
import { useCards } from "@/src/hooks/useCards";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";

type SectionId = "personal" | "addresses" | "cards" | "notifications" | "more";

const SECTIONS: { id: SectionId; title: string }[] = [
  { id: "personal", title: "Dados Pessoais" },
  { id: "addresses", title: "Endereços" },
  { id: "cards", title: "Cartões" },
  { id: "notifications", title: "Notificações" },
  { id: "more", title: "Mais" },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={[styles.track, on && styles.trackOn]}>
      <View style={styles.handle} />
    </Pressable>
  );
}

export default function ClientPerfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile } = useUserProfile(user?.uid ?? null);
  const { addresses, addAddress } = useAddresses(user?.uid ?? null);
  const { cards } = useCards(user?.uid ?? null);

  const [open, setOpen] = useState<SectionId | null>("personal");
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState((profile as any)?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState((profile as any)?.notifications_push_enabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState((profile as any)?.notifications_email_enabled ?? false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: "", number: "", complement: "", neighborhood: "", city: "", state: "", postal_code: "" });

  async function handleSaveAddress() {
    if (!user) return;
    setSavingAddress(true);
    await addAddress(user.uid, addressForm);
    setSavingAddress(false);
    setShowAddressForm(false);
    setAddressForm({ street: "", number: "", complement: "", neighborhood: "", city: "", state: "", postal_code: "" });
  }

  async function handleSavePersonal() {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), { name, phone, updated_at: serverTimestamp() });
    setSaving(false);
  }

  async function handleTogglePush() {
    if (!user) return;
    const next = !pushEnabled;
    setPushEnabled(next);
    await updateDoc(doc(db, "users", user.uid), { notifications_push_enabled: next, updated_at: serverTimestamp() });
  }

  async function handleToggleEmail() {
    if (!user) return;
    const next = !emailEnabled;
    setEmailEnabled(next);
    await updateDoc(doc(db, "users", user.uid), { notifications_email_enabled: next, updated_at: serverTimestamp() });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl }}>
      <Text style={styles.title}>Seu Perfil</Text>

      <View style={{ gap: space.m }}>
        {SECTIONS.map((section) => {
          const isOpen = open === section.id;
          return (
            <View key={section.id} style={styles.sectionBox}>
              <Pressable style={styles.sectionHeader} onPress={() => setOpen(isOpen ? null : section.id)}>
                <Text style={[styles.sectionTitle, isOpen && { color: C.purplePrimary }]}>{section.title}</Text>
                <Icon name="chevron-down" size={18} color={isOpen ? C.purplePrimary : C.textSecondary} />
              </Pressable>

              {isOpen && section.id === "personal" && (
                <View style={styles.sectionBody}>
                  <LabeledInput label="Nome" value={name} onChangeText={setName} />
                  <LabeledInput label="E-mail" value={user?.email ?? ""} state="disabled" />
                  <LabeledInput label="Telefone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                  <Button variant="primary" loading={saving} onPress={handleSavePersonal}>
                    Salvar
                  </Button>
                </View>
              )}

              {isOpen && section.id === "addresses" && (
                <View style={styles.sectionBody}>
                  {addresses.map((a) => (
                    <View key={a.address_id} style={styles.listItem}>
                      <Icon name="home" size={20} color={C.purplePrimary} />
                      <Text style={styles.listItemText}>
                        {a.street}, {a.number} · {a.neighborhood}
                      </Text>
                    </View>
                  ))}
                  {addresses.length === 0 && <Text style={styles.emptyText}>Nenhum endereço salvo ainda.</Text>}

                  {!showAddressForm && (
                    <Pressable onPress={() => setShowAddressForm(true)}>
                      <Text style={styles.addLink}>+ Adicionar novo</Text>
                    </Pressable>
                  )}

                  {showAddressForm && (
                    <View style={{ gap: space.m, marginTop: space.s }}>
                      <LabeledInput label="Rua" value={addressForm.street} onChangeText={(v) => setAddressForm({ ...addressForm, street: v })} />
                      <LabeledInput label="Número" value={addressForm.number} onChangeText={(v) => setAddressForm({ ...addressForm, number: v })} />
                      <LabeledInput label="Complemento (opcional)" value={addressForm.complement} onChangeText={(v) => setAddressForm({ ...addressForm, complement: v })} />
                      <LabeledInput label="Bairro" value={addressForm.neighborhood} onChangeText={(v) => setAddressForm({ ...addressForm, neighborhood: v })} />
                      <LabeledInput label="Cidade" value={addressForm.city} onChangeText={(v) => setAddressForm({ ...addressForm, city: v })} />
                      <LabeledInput label="UF" value={addressForm.state} onChangeText={(v) => setAddressForm({ ...addressForm, state: v })} maxLength={2} autoCapitalize="characters" />
                      <LabeledInput label="CEP" value={addressForm.postal_code} onChangeText={(v) => setAddressForm({ ...addressForm, postal_code: v })} keyboardType="numeric" />
                      <Button variant="secondary" loading={savingAddress} onPress={handleSaveAddress}>
                        Salvar endereço
                      </Button>
                    </View>
                  )}
                </View>
              )}

              {isOpen && section.id === "cards" && (
                <View style={styles.sectionBody}>
                  {cards.map((c) => (
                    <View key={c.card_id} style={styles.listItem}>
                      <Icon name="credit-card" size={20} color={C.purplePrimary} />
                      <Text style={styles.listItemText}>
                        •••• {c.last_four} · {c.holder_name}
                      </Text>
                    </View>
                  ))}
                  {cards.length === 0 && <Text style={styles.emptyText}>Nenhum cartão salvo ainda.</Text>}

                  <Pressable onPress={() => router.push("/(client)/criar-pedido/novo-cartao")}>
                    <Text style={styles.addLink}>+ Novo cartão</Text>
                  </Pressable>
                </View>
              )}

              {isOpen && section.id === "notifications" && (
                <View style={styles.sectionBody}>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Notificações push</Text>
                    <Toggle on={pushEnabled} onToggle={handleTogglePush} />
                  </View>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Email</Text>
                    <Toggle on={emailEnabled} onToggle={handleToggleEmail} />
                  </View>
                </View>
              )}

              {isOpen && section.id === "more" && (
                <View style={styles.sectionBody}>
                  <Text style={styles.linkText}>Termos de Uso</Text>
                  <Text style={styles.linkText}>Política de Privacidade</Text>
                  <Pressable onPress={logout}>
                    <Text style={styles.linkText}>Sair</Text>
                  </Pressable>
                  <Text style={styles.linkTextDanger}>Deletar conta</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  sectionBox: { borderWidth: 1, borderColor: C.border, borderRadius: radius.l, overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: space.l },
  sectionTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum },
  sectionBody: { paddingHorizontal: space.l, paddingBottom: space.l, gap: space.m },
  listItem: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.m },
  listItemText: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum, flex: 1 },
  emptyText: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary },
  addLink: { fontFamily: font.medium, fontSize: font.body, color: C.purplePrimary, marginTop: space.xs },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  track: { width: 40, height: 22, borderRadius: 999, backgroundColor: C.border, padding: 2, justifyContent: "center" },
  trackOn: { backgroundColor: C.purplePrimary, alignItems: "flex-end" },
  handle: { width: 18, height: 18, borderRadius: 9999, backgroundColor: "#fff" },
  linkText: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  linkTextDanger: { fontFamily: font.regular, fontSize: font.body, color: C.error },
});
