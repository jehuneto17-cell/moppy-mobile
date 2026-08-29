import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { db } from "@/src/services/firebase";
import { C, font, space } from "@/src/theme";
import type { Order } from "@/src/types";

export default function ConfirmacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "orders", id), (snap) => setOrder(snap.exists() ? ({ order_id: snap.id, ...snap.data() } as Order) : null));
  }, [id]);

  async function handleConfirmOk() {
    if (!user || !order) return;
    setProcessing(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders/${order.order_id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao confirmar");
      router.replace(`/(client)/pedido/${order.order_id}/avaliacao`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao confirmar");
      setProcessing(false);
    }
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (processing) {
    return (
      <View style={styles.center}>
        <Spinner label="Processando pagamento…" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cleanerCard}>
        <Avatar name={order.cleaner_name ?? "Faxineira"} size="medium" />
        <View>
          <Text style={styles.cleanerName}>{order.cleaner_name}</Text>
          <Text style={styles.cleanerRating}>★ {order.cleaner_rating ?? 5} · Faxineira</Text>
        </View>
      </View>

      <Text style={styles.title}>Está tudo certo com o trabalho de {order.cleaner_name?.split(" ")[0] ?? "sua faxineira"}?</Text>
      <Text style={styles.subtitle}>Confirme aqui para liberar o pagamento. Tem algum problema? Abra uma disputa.</Text>

      {error && <Alert variant="error">{error}</Alert>}

      <View style={styles.buttonRow}>
        <Button variant="primary" size="large" style={{ flex: 1 }} onPress={handleConfirmOk}>
          Sim, está tudo certo
        </Button>
        <Button variant="danger" size="large" style={{ flex: 1 }} onPress={() => router.push(`/(client)/pedido/${order.order_id}/disputa`)}>
          Tive um problema
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.white },
  cleanerCard: { flexDirection: "row", alignItems: "center", gap: space.m, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: space.l, width: "100%", marginBottom: space.xxl },
  cleanerName: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  cleanerRating: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, textAlign: "center" },
  subtitle: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", marginTop: space.m, marginBottom: space.xxl, lineHeight: 20 },
  buttonRow: { flexDirection: "row", gap: space.m, width: "100%" },
});
