import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { Rating } from "@/src/components/ui/Rating";
import { Spinner } from "@/src/components/ui/Spinner";
import { db } from "@/src/services/firebase";
import { C, font, space } from "@/src/theme";
import type { Order } from "@/src/types";

export default function AguardandoConfirmacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "orders", id), (snap) => setOrder(snap.exists() ? ({ order_id: snap.id, ...snap.data() } as Order) : null));
  }, [id]);

  useEffect(() => {
    if (order?.status === "completed") {
      const t = setTimeout(() => router.replace(`/(cleaner)/pedido/${id}/avaliacao`), 1200);
      return () => clearTimeout(t);
    }
    if (order?.status === "disputed") {
      router.replace(`/(cleaner)/pedido/${id}/disputa`);
    }
  }, [order?.status]);

  useEffect(() => {
    if (!order?.confirm_deadline_at) return;
    const deadlineMs = order.confirm_deadline_at.seconds * 1000;
    const tick = () => setRemaining(Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order?.confirm_deadline_at]);

  if (!order) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  const isDone = order.status === "completed";
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: isDone ? C.successBg : C.successBg }]}>
        <Icon name="check-circle" size={44} color={C.success} />
      </View>

      <Text style={styles.title}>{isDone ? "Cliente confirmou!" : "Serviço concluído!"}</Text>
      <Text style={styles.subtitle}>
        {isDone ? "Tudo certo. Redirecionando para avaliação..." : "Aguardando confirmação do cliente. Você tem até 24h para responder a uma disputa se abrir."}
      </Text>

      {!isDone && (
        <>
          <View style={styles.countdownBox}>
            <Text style={styles.countdownText}>Prazo de 24h termina em: {h}h {m}min</Text>
          </View>

          <View style={styles.clientCard}>
            <Avatar name="Cliente" size="medium" />
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{order.address.neighborhood}</Text>
              <Rating value={5} readonly size="small" />
            </View>
          </View>
        </>
      )}

      {!isDone && (
        <Button variant="secondary" size="large" onPress={() => router.push("/(cleaner)/agenda")} style={{ width: "100%", marginTop: space.xl }}>
          Voltar para agenda
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl, alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.white },
  iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginTop: space.xl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginTop: space.xl, textAlign: "center" },
  subtitle: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", marginTop: space.s, maxWidth: 300, lineHeight: 20 },
  countdownBox: { marginTop: space.xl, paddingVertical: space.s, paddingHorizontal: space.l, backgroundColor: C.errorBg, borderRadius: 8 },
  countdownText: { fontFamily: font.medium, fontSize: font.body, color: C.error },
  clientCard: { width: "100%", marginTop: space.xxl, backgroundColor: C.surface, borderRadius: 8, padding: space.l, flexDirection: "row", alignItems: "center", gap: space.m },
  clientName: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum },
});
