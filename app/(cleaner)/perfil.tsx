import { useRouter } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { useAuth } from "@/src/hooks/useAuth";
import { useCleanerProfile } from "@/src/hooks/useCleanerProfile";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";

type SectionId = "personal" | "documents" | "radius" | "pix" | "notifications" | "more";

const SECTIONS: { id: SectionId; title: string }[] = [
  { id: "personal", title: "Dados Pessoais" },
  { id: "documents", title: "Documentos" },
  { id: "radius", title: "Raio de Atuação" },
  { id: "pix", title: "Chave PIX" },
  { id: "notifications", title: "Notificações" },
  { id: "more", title: "Mais" },
];

const RADIUS_OPTIONS = [5, 10, 15, 20];

const DOC_LABELS: Record<string, string> = {
  id_document: "RG",
  cpf_document: "CPF",
  selfie: "Selfie",
  address_proof: "Comprovante de endereço",
};

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={[toggleStyles.track, on && toggleStyles.trackOn]}>
      <View style={toggleStyles.handle} />
    </Pressable>
  );
}

export default function CleanerPerfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile } = useUserProfile(user?.uid ?? null);
  const { profile: cleanerProfile } = useCleanerProfile(user?.uid ?? null);

  const [open, setOpen] = useState<SectionId | null>("personal");
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState((profile as any)?.phone ?? "");
  const [pixKey, setPixKey] = useState(cleanerProfile?.pix?.key_value ?? "");
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  async function handleSavePersonal() {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), { name, phone, updated_at: serverTimestamp() });
    setSaving(false);
  }

  async function handleSaveRadius(km: number) {
    if (!user) return;
    await updateDoc(doc(db, "cleaners", user.uid), { service_radius_km: km, updated_at: serverTimestamp() });
  }

  async function handleSavePix() {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "cleaners", user.uid), { pix: { key_type: "auto", key_value: pixKey }, updated_at: serverTimestamp() });
    setSaving(false);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl }}>
      <Text style={styles.title}>Perfil e Configurações</Text>

      <View style={{ gap: space.m }}>
        {SECTIONS.map((section) => {
          const isOpen = open === section.id;
          return (
            <View key={section.id} style={styles.sectionBox}>
              <Pressable style={styles.sectionHeader} onPress={() => setOpen(isOpen ? null : section.id)}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Icon name="chevron-down" size={18} color={C.textSecondary} />
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

              {isOpen && section.id === "documents" && (
                <View style={styles.sectionBody}>
                  {Object.entries(DOC_LABELS).map(([key, label]) => {
                    const doc = cleanerProfile?.documents?.[key as "id_document" | "cpf_document" | "selfie" | "address_proof"];
                    const badge = !doc
                      ? { label: "Pendente", bg: C.warningBg, color: C.warningDark }
                      : doc.verified
                        ? { label: "Aprovado", bg: C.successBg, color: C.successDark }
                        : { label: "Em análise", bg: C.warningBg, color: C.warningDark };
                    return (
                      <View key={key} style={styles.docRow}>
                        <Text style={styles.docLabel}>{label}</Text>
                        <View style={[styles.docBadge, { backgroundColor: badge.bg }]}>
                          <Text style={{ fontFamily: font.regular, fontSize: font.labelSm, color: badge.color }}>{badge.label}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {isOpen && section.id === "radius" && (
                <View style={styles.sectionBody}>
                  <Text style={styles.radiusText}>
                    Até <Text style={{ fontFamily: font.bold }}>{cleanerProfile?.service_radius_km ?? 10} km</Text> de distância
                  </Text>
                  <View style={{ flexDirection: "row", gap: space.s }}>
                    {RADIUS_OPTIONS.map((km) => {
                      const active = (cleanerProfile?.service_radius_km ?? 10) === km;
                      return (
                        <Pressable key={km} onPress={() => handleSaveRadius(km)} style={[styles.radiusChip, active && styles.radiusChipActive]}>
                          <Text style={[styles.radiusChipText, active && { color: C.purplePrimary }]}>{km} km</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {isOpen && section.id === "pix" && (
                <View style={styles.sectionBody}>
                  <LabeledInput label="Chave PIX" value={pixKey} onChangeText={setPixKey} />
                  <Button variant="primary" loading={saving} onPress={handleSavePix}>
                    Salvar
                  </Button>
                </View>
              )}

              {isOpen && section.id === "notifications" && (
                <View style={styles.sectionBody}>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Notificações push</Text>
                    <Toggle on={pushEnabled} onToggle={() => setPushEnabled((s) => !s)} />
                  </View>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Notificações por e-mail</Text>
                    <Toggle on={emailEnabled} onToggle={() => setEmailEnabled((s) => !s)} />
                  </View>
                </View>
              )}

              {isOpen && section.id === "more" && (
                <View style={styles.sectionBody}>
                  <Pressable onPress={() => router.push("/(cleaner)/historico")}>
                    <Text style={styles.linkText}>Histórico de Serviços</Text>
                  </Pressable>
                  <Text style={styles.linkText}>Termos</Text>
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
  docRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  docLabel: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  docBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.xl },
  radiusText: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  radiusChip: { flex: 1, paddingVertical: space.s, alignItems: "center", borderRadius: radius.l, borderWidth: 1, borderColor: C.border },
  radiusChipActive: { backgroundColor: C.purpleLight, borderColor: C.purplePrimary },
  radiusChipText: { fontFamily: font.medium, fontSize: font.labelSm, color: C.textMaximum },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  linkText: { fontFamily: font.regular, fontSize: font.body, color: C.purplePrimary },
  linkTextDanger: { fontFamily: font.regular, fontSize: font.body, color: C.error },
});

const toggleStyles = StyleSheet.create({
  track: { width: 40, height: 22, borderRadius: 999, backgroundColor: C.border, padding: 2, justifyContent: "center" },
  trackOn: { backgroundColor: C.purplePrimary, alignItems: "flex-end" },
  handle: { width: 18, height: 18, borderRadius: 9999, backgroundColor: "#fff" },
});
