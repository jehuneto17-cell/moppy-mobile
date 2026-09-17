import { useRouter } from "expo-router";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { AccordionSection } from "@/src/components/ui/AccordionSection";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import type { IconName } from "@/src/components/ui/Icon";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { ProfileFooterActions } from "@/src/components/ui/ProfileFooterActions";
import { ProfileHeader } from "@/src/components/ui/ProfileHeader";
import { RoleGuardScreen } from "@/src/components/ui/RoleGuardScreen";
import { useAuth } from "@/src/hooks/useAuth";
import { useCleanerProfile } from "@/src/hooks/useCleanerProfile";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";

type SectionId = "personal" | "documents" | "radius" | "pix" | "notifications" | "more";

const SECTIONS: { id: SectionId; title: string; icon: IconName }[] = [
  { id: "personal", title: "Dados Pessoais", icon: "user" },
  { id: "documents", title: "Documentos", icon: "file-text" },
  { id: "radius", title: "Raio de Atuação", icon: "navigation" },
  { id: "pix", title: "Chave PIX", icon: "send" },
  { id: "notifications", title: "Notificações", icon: "bell" },
  { id: "more", title: "Mais", icon: "info" },
];

const RADIUS_OPTIONS = [5, 10, 15, 20];

const PIX_KEY_TYPES = [
  { key: "cpf", label: "CPF" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefone" },
  { key: "random", label: "Aleatória" },
] as const;
type PixKeyType = (typeof PIX_KEY_TYPES)[number]["key"];

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
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>(
    (PIX_KEY_TYPES.find((t) => t.key === cleanerProfile?.pix?.key_type)?.key as PixKeyType) ?? "cpf"
  );
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  // profile/cleanerProfile chegam assíncronos (onSnapshot) — os useState acima já
  // rodaram com eles ainda nulos na 1ª renderização, então os campos ficavam
  // sempre em branco mesmo com o dado salvo. Sincroniza assim que carregam.
  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone((profile as any).phone ?? "");
  }, [profile]);

  useEffect(() => {
    if (!cleanerProfile) return;
    setPixKey(cleanerProfile.pix?.key_value ?? "");
    if (PIX_KEY_TYPES.some((t) => t.key === cleanerProfile.pix?.key_type)) {
      setPixKeyType(cleanerProfile.pix!.key_type as PixKeyType);
    }
  }, [cleanerProfile]);

  async function handleSavePersonal() {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), { name, phone, updated_at: serverTimestamp() });
    setSaving(false);
  }

  async function handleSaveRadius(km: number) {
    if (!user) return;
    // setDoc+merge em vez de updateDoc: evita "No document to update" se o
    // cadastro de faxineira ainda não existir (com o guard de rota isso não
    // deveria acontecer mais, mas não custa não quebrar se acontecer).
    await setDoc(doc(db, "cleaners", user.uid), { service_radius_km: km, updated_at: serverTimestamp() }, { merge: true });
  }

  async function handleSavePix() {
    if (!user) return;
    setSaving(true);
    await setDoc(doc(db, "cleaners", user.uid), { pix: { key_type: pixKeyType, key_value: pixKey }, updated_at: serverTimestamp() }, { merge: true });
    setSaving(false);
  }

  return (
    <RoleGuardScreen required="cleaner">
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl }}>
      <ProfileHeader
        name={name || profile?.name}
        email={user?.email ?? undefined}
        subtitle={cleanerProfile ? `${cleanerProfile.service_radius_km ?? 10} km de raio de atuação` : undefined}
      />

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

              {section.id === "documents" && (
                <>
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
                </>
              )}

              {section.id === "radius" && (
                <>
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
                </>
              )}

              {section.id === "pix" && (
                <>
                  <Text style={styles.radiusText}>Tipo de chave</Text>
                  <View style={{ flexDirection: "row", gap: space.s }}>
                    {PIX_KEY_TYPES.map((t) => {
                      const active = pixKeyType === t.key;
                      return (
                        <Pressable key={t.key} onPress={() => setPixKeyType(t.key)} style={[styles.radiusChip, active && styles.radiusChipActive]}>
                          <Text style={[styles.radiusChipText, active && { color: C.purplePrimary }]}>{t.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <LabeledInput label="Chave PIX" value={pixKey} onChangeText={setPixKey} />
                  <Button variant="primary" loading={saving} onPress={handleSavePix}>
                    Salvar
                  </Button>
                </>
              )}

              {section.id === "notifications" && (
                <>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Notificações push</Text>
                    <Toggle on={pushEnabled} onToggle={() => setPushEnabled((s) => !s)} />
                  </View>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Notificações por e-mail</Text>
                    <Toggle on={emailEnabled} onToggle={() => setEmailEnabled((s) => !s)} />
                  </View>
                </>
              )}

              {section.id === "more" && (
                <>
                  <Pressable onPress={() => router.push("/(cleaner)/historico")}>
                    <Text style={styles.linkText}>Histórico de Serviços</Text>
                  </Pressable>
                  <Pressable onPress={() => router.push("/(cleaner)/termos-uso")}>
                    <Text style={styles.linkText}>Termos</Text>
                  </Pressable>
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
});

const toggleStyles = StyleSheet.create({
  track: { width: 40, height: 22, borderRadius: 999, backgroundColor: C.border, padding: 2, justifyContent: "center" },
  trackOn: { backgroundColor: C.purplePrimary, alignItems: "flex-end" },
  handle: { width: 18, height: 18, borderRadius: 9999, backgroundColor: "#fff" },
});
