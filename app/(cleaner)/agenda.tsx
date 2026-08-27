import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order } from "@/src/types";
import { computeCleanerEarnings } from "@/src/utils/price";

function serviceLabel(type: string) {
  if (type === "standard") return "Limpeza Padrão";
  if (type === "heavy") return "Limpeza Pesada";
  return "Passar Roupas";
}

function badgeFor(order: Order) {
  const now = new Date();
  const scheduled = new Date(order.scheduled_at);
  if (order.status === "completed") return { label: "Passado", color: C.textSecondary, bg: "#F3F4F6" };
  if (scheduled.toDateString() === now.toDateString()) return { label: "Hoje", color: C.purplePrimary, bg: "#F3E8FF" };
  return { label: "Confirmado", color: C.success, bg: C.successBg };
}

export default function CleanerAgendaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("cleaner_id", "==", user.uid),
      orderBy("scheduled_at", "desc")
    );
    return onSnapshot(q, (snap) =>
      setOrders(snap.docs.map((d) => ({ order_id: d.id, ...d.data() } as Order)).filter((o) => ["confirmed", "in_progress", "completed"].includes(o.status)))
    );
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sua agenda</Text>

      <ScrollView contentContainerStyle={{ padding: space.xxl, paddingTop: space.l }}>
        {orders === null && (
          <View style={styles.center}>
            <Spinner />
          </View>
        )}

        {orders?.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="home" size={32} color={C.textSecondary} />
            <Text style={styles.emptyText}>Nenhum serviço confirmado ainda. Candidate-se a um pedido no Feed.</Text>
          </View>
        )}

        {orders && orders.length > 0 && (
          <View style={{ gap: space.m }}>
            {orders.map((order) => {
              const badge = badgeFor(order);
              const earnings = computeCleanerEarnings(order.pricing.base_price + order.pricing.extras_price);
              return (
                <Pressable key={order.order_id} style={styles.card} onPress={() => router.push(`/(cleaner)/pedido/${order.order_id}`)}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardWhen}>{new Date(order.scheduled_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSub}>
                    {serviceLabel(order.service.type)} · {order.address.neighborhood}
                  </Text>
                  <Text style={styles.cardNet}>R$ {earnings.cleanerNet.toFixed(2).replace(".", ",")} líquido</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, paddingHorizontal: space.xxl, paddingTop: space.xxl },
  center: { alignItems: "center", paddingVertical: space.xxxl },
  emptyState: { alignItems: "center", paddingTop: space.xxxxl, gap: space.l },
  emptyText: { fontFamily: font.regular, fontSize: font.body, color: "#6B7280", textAlign: "center", maxWidth: 260, lineHeight: 21 },
  card: { backgroundColor: C.surface, borderRadius: radius.l, padding: space.l, gap: space.s },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardWhen: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.xl },
  badgeText: { fontFamily: font.medium, fontSize: 11 },
  cardSub: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  cardNet: { fontFamily: font.medium, fontSize: font.body, color: C.info },
});
