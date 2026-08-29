import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { Rating } from "@/src/components/ui/Rating";
import { Spinner } from "@/src/components/ui/Spinner";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order } from "@/src/types";

const CONFIRM_WINDOW_HOURS = 24;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function ServicoAndamentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "orders", id), (snap) => setOrder(snap.exists() ? ({ order_id: snap.id, ...snap.data() } as Order) : null));
  }, [id]);

  useEffect(() => {
    if (!order?.arrived_at) return;
    const startedMs = order.arrived_at.seconds * 1000;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedMs) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order?.arrived_at]);

  async function handleFinishingSoon() {
    if (!id) return;
    setFinishing(true);
    await updateDoc(doc(db, "orders", id), { service_finishing_soon_at: serverTimestamp() });
    setFinishing(false);
  }

  async function handleComplete() {
    if (!id) return;
    setCompleting(true);
    await updateDoc(doc(db, "orders", id), {
      cleaner_completed_at: serverTimestamp(),
      confirm_deadline_at: Timestamp.fromMillis(Date.now() + CONFIRM_WINDOW_HOURS * 60 * 60 * 1000),
      updated_at: serverTimestamp(),
    });
    router.replace(`/(cleaner)/pedido/${id}/aguardando`);
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  return (
    <View style={styles.container}>
      <View style={styles.timerBlock}>
        <Text style={styles.timerLabel}>Serviço em andamento</Text>
        <Text style={styles.timerValue}>{pad(h)}:{pad(m)}:{pad(s)}</Text>
      </View>

      <View style={styles.clientCard}>
        <Avatar name="Cliente" size="medium" />
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>{order.address.street}, {order.address.number}</Text>
          <Rating value={5} readonly size="small" />
        </View>
        <Pressable style={styles.chatButton} onPress={() => router.push(`/(cleaner)/pedido/${id}/chat`)}>
          <Icon name="message-circle" size={20} color={C.purplePrimary} />
        </Pressable>
      </View>

      <Text style={styles.question}>Como está tudo indo?</Text>
      <View style={styles.buttonRow}>
        <Button variant="secondary" size="large" loading={finishing} onPress={handleFinishingSoon} style={{ flex: 1, backgroundColor: C.warningBg }}>
          Estou terminando agora
        </Button>
        <Button variant="primary" size="large" loading={completing} onPress={handleComplete} style={{ flex: 1 }}>
          Concluído
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.white },
  timerBlock: { alignItems: "center", paddingVertical: space.xxl },
  timerLabel: { fontFamily: font.medium, fontSize: font.labelSm, color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  timerValue: { fontFamily: font.bold, fontSize: 40, color: C.purplePrimary, marginTop: space.s },
  clientCard: { flexDirection: "row", alignItems: "center", gap: space.m, backgroundColor: C.surface, borderRadius: radius.l, padding: space.l },
  clientName: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum },
  chatButton: { width: 40, height: 40, borderRadius: radius.l, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  question: { fontFamily: font.bold, fontSize: font.body, color: C.textMaximum, marginTop: space.xxl, marginBottom: space.l },
  buttonRow: { flexDirection: "row", gap: space.s },
});
