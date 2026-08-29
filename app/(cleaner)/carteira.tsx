import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { useWallet } from "@/src/hooks/useWallet";
import { C, font, radius, space } from "@/src/theme";

function money(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function formatDate(ts: { seconds: number } | null) {
  if (!ts) return "";
  return new Date(ts.seconds * 1000).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function CleanerCarteiraScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { balance, transactions, loading } = useWallet(user?.uid ?? null);

  if (loading) {
    return (
      <View style={styles.center}>
        <Spinner label="Carregando saldo..." />
      </View>
    );
  }

  const isEmpty = (balance?.total ?? 0) === 0 && transactions.length === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl }}>
      <Text style={styles.label}>Saldo total</Text>
      <Text style={styles.total}>{money(balance?.total ?? 0)}</Text>

      <View style={styles.breakdownRow}>
        <View style={[styles.breakdownCard, { backgroundColor: C.warningBg }]}>
          <Text style={[styles.breakdownLabel, { color: C.warningDark }]}>A liberar</Text>
          <Text style={[styles.breakdownValue, { color: C.warningDark }]}>{money(balance?.pending_release ?? 0)}</Text>
        </View>
        <Pressable
          style={[styles.breakdownCard, { backgroundColor: C.successBg }]}
          onPress={() => router.push("/(cleaner)/solicitar-saque")}
        >
          <Text style={[styles.breakdownLabel, { color: C.successDark }]}>Disponível</Text>
          <Text style={[styles.breakdownValue, { color: C.successDark }]}>{money(balance?.available ?? 0)}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Extrato</Text>

      {isEmpty && (
        <View style={styles.emptyState}>
          <Icon name="credit-card" size={32} color={C.textSecondary} />
          <Text style={styles.emptyText}>Nenhum serviço concluído ainda. Assim que você finalizar um, o valor aparece aqui.</Text>
        </View>
      )}

      {!isEmpty && (
        <View style={{ gap: space.m }}>
          {transactions.map((tx) => (
            <View key={tx.transaction_id} style={styles.txRow}>
              <View>
                <Text style={styles.txReason}>{tx.type === "withdraw" ? "Saque solicitado" : "Serviço concluído"}</Text>
                <Text style={styles.txDate}>{formatDate(tx.timestamp)}</Text>
              </View>
              <Text style={[styles.txValue, { color: tx.type === "withdraw" ? C.error : C.success }]}>
                {tx.type === "withdraw" ? "-" : "+"}
                {money(tx.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary },
  total: { fontFamily: font.bold, fontSize: font.display, color: C.textMaximum, marginTop: 4 },
  breakdownRow: { flexDirection: "row", gap: space.m, marginTop: space.xxl },
  breakdownCard: { flex: 1, borderRadius: radius.l, padding: space.l },
  breakdownLabel: { fontFamily: font.medium, fontSize: font.bodySm },
  breakdownValue: { fontFamily: font.bold, fontSize: font.h3, marginTop: 4 },
  sectionTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginTop: space.xxl, marginBottom: space.l },
  emptyState: { alignItems: "center", paddingVertical: space.xxxl, gap: space.l },
  emptyText: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", maxWidth: 260, lineHeight: 21 },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  txReason: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  txDate: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  txValue: { fontFamily: font.bold, fontSize: font.body },
});
