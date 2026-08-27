import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order, OrderStatus } from "@/src/types";
import { computeCleanerEarnings } from "@/src/utils/price";

type Filter = "tudo" | "completed" | "cancelled" | "disputed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "tudo", label: "Tudo" },
  { key: "completed", label: "Concluído" },
  { key: "cancelled", label: "Cancelado" },
  { key: "disputed", label: "Pendente" },
];

const BADGE: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Rascunho", color: C.textSecondary, bg: "#F3F4F6" },
  open: { label: "Aberto", color: C.purplePrimary, bg: "#F3E8FF" },
  confirmed: { label: "Confirmado", color: C.info, bg: C.infoBg },
  in_progress: { label: "Em serviço", color: C.info, bg: C.infoBg },
  completed: { label: "Concluído", color: C.success, bg: C.successBg },
  disputed: { label: "Pendente", color: C.warning, bg: C.warningBg },
  cancelled: { label: "Cancelado", color: C.error, bg: C.errorBg },
};

function serviceLabel(type: string) {
  if (type === "standard") return "Limpeza Padrão";
  if (type === "heavy") return "Limpeza Pesada";
  return "Passar Roupas";
}

export default function HistoricoScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<Filter>("tudo");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("cleaner_id", "==", user.uid), orderBy("scheduled_at", "desc"));
    return onSnapshot(q, (snap) =>
      setOrders(snap.docs.map((d) => ({ order_id: d.id, ...d.data() } as Order)).filter((o) => ["completed", "cancelled", "disputed"].includes(o.status)))
    );
  }, [user]);

  const filtered = orders?.filter((o) => filter === "tudo" || o.status === filter) ?? [];
  const totalEarned = filtered.filter((o) => o.status === "completed").reduce((sum, o) => sum + computeCleanerEarnings(o.pricing.base_price + o.pricing.extras_price).cleanerNet, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de serviços</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.s, marginTop: space.l }}>
          {FILTERS.map((f) => (
            <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterChip, filter === f.key && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.xxl }}>
        {orders === null && (
          <View style={styles.center}>
            <Spinner />
          </View>
        )}

        {orders !== null && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="list" size={32} color={C.textSecondary} />
            <Text style={styles.emptyText}>Nenhum serviço encontrado neste filtro.</Text>
          </View>
        )}

        {filtered.length > 0 && (
          <View style={{ gap: space.m }}>
            {filtered.map((order) => {
              const badge = BADGE[order.status];
              const earnings = computeCleanerEarnings(order.pricing.base_price + order.pricing.extras_price);
              return (
                <View key={order.order_id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardWhen}>{new Date(order.scheduled_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle}>{serviceLabel(order.service.type)}</Text>
                  <Text style={styles.cardSub}>{order.address.neighborhood}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardClient}>★ 5.0</Text>
                    <Text style={[styles.cardValue, { color: order.status === "completed" ? C.success : C.textSecondary }]}>
                      R$ {(order.status === "completed" ? earnings.cleanerNet : 0).toFixed(2).replace(".", ",")}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerCount}>Total de {filtered.length} serviços</Text>
        <Text style={styles.footerEarned}>Ganho total: R$ {totalEarned.toFixed(2).replace(".", ",")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  header: { paddingHorizontal: space.xxl, paddingTop: space.xxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  filterChip: { paddingVertical: space.s, paddingHorizontal: space.l, borderRadius: 999, borderWidth: 1, borderColor: C.border, backgroundColor: C.white },
  filterChipActive: { backgroundColor: "#F3E8FF", borderColor: C.purplePrimary },
  filterChipText: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  filterChipTextActive: { color: C.purplePrimary },
  center: { alignItems: "center", paddingVertical: space.xxxl },
  emptyState: { alignItems: "center", paddingTop: space.xxxl, gap: space.l },
  emptyText: { fontFamily: font.regular, fontSize: font.body, color: "#6B7280", textAlign: "center", maxWidth: 260, lineHeight: 21 },
  card: { backgroundColor: C.surface, borderRadius: radius.l, padding: space.l, gap: 6 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardWhen: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.xl },
  badgeText: { fontFamily: font.medium, fontSize: 11 },
  cardTitle: { fontFamily: font.bold, fontSize: font.body, color: C.textMaximum },
  cardSub: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  cardClient: { fontFamily: font.regular, fontSize: font.labelSm, color: "#6B7280" },
  cardValue: { fontFamily: font.bold, fontSize: font.body },
  footer: { padding: space.l, paddingHorizontal: space.xxl, borderTopWidth: 1, borderTopColor: C.border },
  footerCount: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, textAlign: "center" },
  footerEarned: { fontFamily: font.regular, fontSize: font.body, color: C.success, textAlign: "center", marginTop: 4 },
});
