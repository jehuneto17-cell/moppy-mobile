import { useRouter } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { AccordionSection } from "@/src/components/ui/AccordionSection";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { ProfileFooterActions } from "@/src/components/ui/ProfileFooterActions";
import { ProfileHeader } from "@/src/components/ui/ProfileHeader";
import { RoleGuardScreen } from "@/src/components/ui/RoleGuardScreen";
import { useAddresses } from "@/src/hooks/useAddresses";
import { useAuth } from "@/src/hooks/useAuth";
import { useCards } from "@/src/hooks/useCards";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { IconName } from "@/src/components/ui/Icon";

type SectionId = "personal" | "addresses" | "cards" | "notifications" | "more";

const SECTIONS: { id: SectionId; title: string; icon: IconName }[] = [
  { id: "personal", title: "Dados Pessoais", icon: "user" },
  { id: "addresses", title: "Endereços", icon: "map-pin" },
  { id: "cards", title: "Cartões", icon: "credit-card" },
  { id: "notifications", title: "Notificações", icon: "bell" },
  { id: "more", title: "Mais", icon: "info" },
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
  const { cards, deleteCard } = useCards(user?.uid ?? null);
  const [confirmingCardId, setConfirmingCardId] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState(false);

  const [open, setOpen] = useState<SectionId | null>("personal");
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState((profile as any)?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState((profile as any)?.notifications_push_enabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState((profile as any)?.notifications_email_enabled ?? false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: "", number: "", complement: "", neighborhood: "", city: "", state: "", postal_code: "" });

  // profile chega assíncrono (onSnapshot) — os useState acima já rodaram com
  // profile ainda nulo na 1ª renderização, então os campos ficavam sempre em
  // branco mesmo com o dado salvo. Sincroniza assim que o profile carrega.
  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone((profile as any).phone ?? "");
    setPushEnabled((profile as any).notifications_push_enabled ?? true);
    setEmailEnabled((profile as any).notifications_email_enabled ?? false);
  }, [profile]);

  async function handleDeleteCard(cardId: string) {
    if (!user) return;
    setDeletingCard(true);
    await deleteCard(user.uid, cardId);
    setDeletingCard(false);
    setConfirmingCardId(null);
  }

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
    <RoleGuardScreen required="client">
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl }}>
      <ProfileHeader name={name || profile?.name} email={user?.email ?? undefined} />

      <View style={{ gap: space.m }}>
        {SECTIONS.map((section) => {
          const isOpen = open === section.id;
          return (
            <AccordionSection
              key={section.id}
              title={section.title}
              icon={section.icon}
              isOpen={isOpen}
              onToggle={() => setOpen(isOpen ? null : section.id)}
            >
              {section.id === "personal" && (
                <>
                  <LabeledInput label="Nome" value={name} onChangeText={setName} />
                  <LabeledInput label="E-mail" value={user?.email ?? ""} state="disabled" />
                  <LabeledInput label="Telefone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                  <Button variant="primary" loading={saving} onPress={handleSavePersonal}>
                    Salvar
                  </Button>
                </>
              )}

              {section.id === "addresses" && (
                <>
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
                </>
              )}

              {section.id === "cards" && (
                <>
                  {cards.map((c) =>
                    confirmingCardId === c.card_id ? (
                      <View key={c.card_id} style={styles.confirmDeleteRow}>
                        <Text style={styles.confirmDeleteText}>
                          Excluir cartão •••• {c.last_four}? Se ele estiver vinculado a um pedido pendente, a cobrança pode falhar.
                        </Text>
                        <View style={{ flexDirection: "row", gap: space.s, marginTop: space.s }}>
                          <Pressable onPress={() => setConfirmingCardId(null)} disabled={deletingCard}>
                            <Text style={styles.cancelDeleteText}>Cancelar</Text>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteCard(c.card_id)} disabled={deletingCard}>
                            <Text style={styles.confirmDeleteAction}>{deletingCard ? "Excluindo..." : "Excluir"}</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View key={c.card_id} style={styles.listItem}>
                        <Icon name="credit-card" size={20} color={C.purplePrimary} />
                        <Text style={styles.listItemText}>
                          •••• {c.last_four} · {c.holder_name}
                        </Text>
                        <Pressable onPress={() => setConfirmingCardId(c.card_id)} hitSlop={8}>
                          <Icon name="trash-2" size={18} color={C.error} />
                        </Pressable>
                      </View>
                    )
                  )}
                  {cards.length === 0 && <Text style={styles.emptyText}>Nenhum cartão salvo ainda.</Text>}

                  <Pressable onPress={() => router.push("/(client)/criar-pedido/novo-cartao")}>
                    <Text style={styles.addLink}>+ Novo cartão</Text>
                  </Pressable>
                </>
              )}

              {section.id === "notifications" && (
                <>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Notificações push</Text>
                    <Toggle on={pushEnabled} onToggle={handleTogglePush} />
                  </View>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Email</Text>
                    <Toggle on={emailEnabled} onToggle={handleToggleEmail} />
                  </View>
                </>
              )}

              {section.id === "more" && (
                <>
                  <Text style={styles.linkText}>Termos de Uso</Text>
                  <Text style={styles.linkText}>Política de Privacidade</Text>
                </>
              )}
            </AccordionSection>
          );
        })}
      </View>

      <Animated.View layout={LinearTransition.duration(220)} style={{ marginTop: space.xxl }}>
        <ProfileFooterActions onLogout={logout} />
      </Animated.View>
    </ScrollView>
    </RoleGuardScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  listItem: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.m },
  listItemText: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum, flex: 1 },
  emptyText: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary },
  addLink: { fontFamily: font.medium, fontSize: font.body, color: C.purplePrimary, marginTop: space.xs },
  confirmDeleteRow: { backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.error, borderRadius: radius.l, padding: space.m },
  confirmDeleteText: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textMaximum, lineHeight: 18 },
  cancelDeleteText: { fontFamily: font.medium, fontSize: font.bodySm, color: C.textSecondary },
  confirmDeleteAction: { fontFamily: font.bold, fontSize: font.bodySm, color: C.error },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  track: { width: 40, height: 22, borderRadius: 999, backgroundColor: C.border, padding: 2, justifyContent: "center" },
  trackOn: { backgroundColor: C.purplePrimary, alignItems: "flex-end" },
  handle: { width: 18, height: 18, borderRadius: 9999, backgroundColor: "#fff" },
  linkText: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
});
