import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { useAuth } from "@/src/hooks/useAuth";
import { useCleanerProfile } from "@/src/hooks/useCleanerProfile";
import { useWallet } from "@/src/hooks/useWallet";
import { C, font, space } from "@/src/theme";

const SUGGESTIONS = [50, 100, 200];
const MIN_WITHDRAWAL = 20;

export default function SolicitarSaqueScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useCleanerProfile(user?.uid ?? null);
  const { balance } = useWallet(user?.uid ?? null);
  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const available = balance?.available ?? 0;
  const numericAmount = Number(amount.replace(",", "."));
  const validAmount = numericAmount >= MIN_WITHDRAWAL && numericAmount <= available;
  const hasPix = !!profile?.pix?.key_value;
  const canSubmit = validAmount && confirmed && hasPix && !loading;

  async function handleSubmit() {
    if (!user || !canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/wallets/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ amount: numericAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao solicitar saque");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao solicitar saque");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.center}>
        <Text style={styles.successTitle}>Solicitado!</Text>
        <Text style={styles.successText}>Cai em 1-2 dias úteis.</Text>
        <Button variant="primary" size="large" onPress={() => router.back()} style={{ marginTop: space.xxl }}>
          Voltar pra carteira
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitar saque</Text>

      <LabeledInput
        label="Valor"
        helper={`Mínimo R$ ${MIN_WITHDRAWAL} · Disponível R$ ${available.toFixed(2).replace(".", ",")}`}
        keyboardType="numeric"
        placeholder="0,00"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.chipRow}>
        {SUGGESTIONS.filter((s) => s <= available).map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => setAmount(String(s))}>
            <Text style={styles.chipText}>R$ {s}</Text>
          </Pressable>
        ))}
        {available >= MIN_WITHDRAWAL && (
          <Pressable style={styles.chip} onPress={() => setAmount(String(available))}>
            <Text style={styles.chipText}>Tudo</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.pixBox}>
        <Text style={styles.pixLabel}>Chave PIX</Text>
        <Text style={styles.pixValue}>{profile?.pix?.key_value ?? "Nenhuma cadastrada"}</Text>
        {!hasPix && <Text style={styles.pixWarning}>Cadastre uma chave PIX em Perfil antes de sacar.</Text>}
      </View>

      <Checkbox checked={confirmed} onChange={setConfirmed} label="Confirmo que a chave PIX é minha" disabled={!hasPix} />

      <Text style={styles.footerNote}>O saque cai em 1-2 dias úteis.</Text>

      {error && <Alert variant="error">{error}</Alert>}

      <Button variant="primary" size="large" disabled={!canSubmit} loading={loading} onPress={handleSubmit} style={{ marginTop: space.l }}>
        Solicitar saque
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl, gap: space.l },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  chipRow: { flexDirection: "row", gap: space.s },
  chip: { paddingVertical: space.s, paddingHorizontal: space.l, borderRadius: 999, borderWidth: 1, borderColor: C.purplePrimary, backgroundColor: C.purpleLight },
  chipText: { fontFamily: font.medium, fontSize: font.bodySm, color: C.purpleVeryDark },
  pixBox: { backgroundColor: C.surface, borderRadius: 8, padding: space.l, gap: 4 },
  pixLabel: { fontFamily: font.medium, fontSize: font.bodySm, color: C.textSecondary },
  pixValue: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  pixWarning: { fontFamily: font.regular, fontSize: font.labelSm, color: C.error, marginTop: 4 },
  footerNote: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary },
  successTitle: { fontFamily: font.bold, fontSize: font.h2, color: C.success },
  successText: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, marginTop: space.s },
});
