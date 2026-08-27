import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/hooks/useAuth";
import { db } from "@/src/services/firebase";
import { useCleanerOnboardingStore } from "@/src/store/cleanerOnboardingStore";
import { C, font, radius, space } from "@/src/theme";

const RADIUS_OPTIONS = [5, 10, 15, 20];

export default function TermosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { documents, cpfNumber, reset } = useCleanerOnboardingStore();
  const [agreed, setAgreed] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [showError, setShowError] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!agreed) {
      setShowError(true);
      return;
    }
    if (!user) return;
    setSaving(true);

    const now = new Date().toISOString();
    const docs: Record<string, any> = {};
    (Object.keys(documents) as (keyof typeof documents)[]).forEach((key) => {
      docs[key] = { storage_url: documents[key]!.storage_url, submitted_at: now, verified: false };
    });
    if (docs.cpf_document) {
      docs.cpf_document.cpf_number = cpfNumber;
    }

    await setDoc(doc(db, "cleaners", user.uid), {
      cleaner_id: user.uid,
      documents: docs,
      service_radius_km: radiusKm,
      approval_status: "pending",
      is_suspended: false,
      services_completed: 0,
      services_cancelled: 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    reset();
    setSaving(false);
    router.replace("/(cleaner-onboarding)/aguardando");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl, paddingBottom: 96 }}>
      <View style={styles.termsBox}>
        <Text style={styles.termsHeading}>Termos de Uso</Text>
        <Text style={styles.termsBody}>
          Como faxineira parceira do Moppy, você presta serviços de forma autônoma, definindo sua disponibilidade e raio de atuação. O Moppy retém uma
          comissão de 15% sobre o valor de cada serviço concluído.
        </Text>
        <Text style={styles.termsHeading}>Privacidade</Text>
        <Text style={styles.termsBody}>
          Seus dados de cadastro e documentos são usados apenas para verificação de identidade e segurança da plataforma, conforme a LGPD.
        </Text>
      </View>

      <View style={{ marginTop: space.l }}>
        <Checkbox checked={agreed} onChange={setAgreed} label="Li e concordo com os Termos e Privacidade" />
      </View>

      <Text style={styles.radiusTitle}>Qual é o seu raio de atuação?</Text>
      <Text style={styles.radiusSubtitle}>
        Você atenderá pedidos até <Text style={{ fontFamily: font.bold }}>{radiusKm} km</Text> de distância
      </Text>

      <View style={styles.radiusRow}>
        {RADIUS_OPTIONS.map((km) => (
          <Pressable key={km} onPress={() => setRadiusKm(km)} style={[styles.radiusChip, radiusKm === km && styles.radiusChipSelected]}>
            <Text style={[styles.radiusChipText, radiusKm === km && styles.radiusChipTextSelected]}>{km} km</Text>
          </Pressable>
        ))}
      </View>

      {showError && (
        <View style={{ marginTop: space.xl }}>
          <Alert variant="error">Você precisa concordar com os Termos para continuar.</Alert>
        </View>
      )}

      <Button variant="primary" size="large" disabled={!agreed} loading={saving} onPress={handleContinue} style={{ marginTop: space.xxl }}>
        Continuar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  termsBox: { borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.l, marginTop: space.l, maxHeight: 220 },
  termsHeading: { fontFamily: font.medium, fontSize: font.bodySm, color: "#6B7280", marginBottom: space.s },
  termsBody: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary, lineHeight: 19, marginBottom: space.s },
  radiusTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginTop: space.xxl, marginBottom: space.m },
  radiusSubtitle: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum, marginBottom: space.l },
  radiusRow: { flexDirection: "row", gap: space.s },
  radiusChip: {
    flex: 1,
    paddingVertical: space.m,
    alignItems: "center",
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  radiusChipSelected: { backgroundColor: C.purpleLight, borderColor: C.purplePrimary },
  radiusChipText: { fontFamily: font.medium, fontSize: font.bodySm, color: C.textMaximum },
  radiusChipTextSelected: { color: C.purplePrimary },
});
