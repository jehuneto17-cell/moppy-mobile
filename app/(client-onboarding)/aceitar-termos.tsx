import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { useAuth } from "@/src/hooks/useAuth";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";

export default function OnboardingTermosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!user || !agreed) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), {
      client_terms_accepted: true,
      updated_at: serverTimestamp(),
    });
    setSaving(false);
    router.replace("/(client-onboarding)/notificacoes");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl, paddingBottom: 96 }}>
      <Text style={styles.title}>Últimos detalhes</Text>

      <View style={styles.termsBox}>
        <ScrollView style={{ maxHeight: 340 }}>
          <Text style={styles.termsHeading}>Termos de Uso</Text>
          <Text style={styles.termsBody}>
            Ao usar o Moppy, você contrata diretamente as faxineiras cadastradas na plataforma. O Moppy atua como intermediário entre clientes e
            profissionais, processando pagamentos e fornecendo suporte durante o agendamento.
          </Text>
          <Text style={styles.termsBody}>
            Cancelamentos com menos de 4 horas de antecedência podem gerar cobrança parcial. Avaliações são obrigatórias após cada serviço concluído
            para manter a qualidade da plataforma.
          </Text>
          <Text style={styles.termsHeading}>Política de Privacidade</Text>
          <Text style={styles.termsBody}>
            Coletamos dados de endereço, pagamento e histórico de pedidos para operar o serviço. Seus dados não são vendidos a terceiros e são
            armazenados de acordo com a Lei Geral de Proteção de Dados (LGPD).
          </Text>
          <Text style={styles.termsBody}>Você pode solicitar a exclusão da sua conta e dos seus dados a qualquer momento pelas Configurações.</Text>
        </ScrollView>

        <View style={styles.checkboxRow}>
          <Checkbox checked={agreed} onChange={setAgreed} label="Li e concordo com os Termos de Uso e a Política de Privacidade" />
        </View>
      </View>

      <Button variant={agreed ? "primary" : "secondary"} size="large" disabled={!agreed} loading={saving} onPress={handleContinue} style={{ marginTop: space.xxl }}>
        Continuar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  termsBox: { borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.l },
  termsHeading: { fontFamily: font.medium, fontSize: font.bodySm, color: "#6B7280", marginBottom: space.s, marginTop: space.s },
  termsBody: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary, lineHeight: 19, marginBottom: space.s },
  checkboxRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: space.m, marginTop: space.s },
});
