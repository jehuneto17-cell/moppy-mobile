import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { useMyApplications, type MyApplication } from "@/src/hooks/useMyApplications";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order } from "@/src/types";
import { computeCleanerEarnings } from "@/src/utils/price";

const GROUP_LABELS: Record<MyApplication["status"], { title: string; color: string; bg: string; opacity: number }> = {
  pending: { title: "Aguardando escolha", color: C.warning, bg: C.warningBg, opacity: 1 },
  selected: { title: "Selecionada", color: C.success, bg: C.successBg, opacity: 1 },
  declined: { title: "Não selecionada", color: C.textSecondary, bg: "#F3F4F6", opacity: 0.6 },
};

function formatPrice(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function serviceLabel(type: string) {
  if (type === "standard") return "Limpeza Padrão";
  if (type === "heavy") return "Limpeza Pesada";
  return "Passar Roupas";
}

export default function CleanerBuscarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<"feed" | "candidaturas">("feed");

  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "==", "open"), orderBy("scheduled_at", "asc"));
    return onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => ({ order_id: d.id, ...d.data() } as Order))));
  }, []);

  const applications = useMyApplications(user?.uid ?? null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trabalhos disponíveis</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab("feed")} style={styles.tabButton}>
          <Text style={[styles.tabText, tab === "feed" && styles.tabTextActive]}>Feed de pedidos</Text>
          {tab === "feed" && <View style={styles.tabIndicator} />}
        </Pressable>
        <Pressable onPress={() => setTab("candidaturas")} style={styles.tabButton}>
          <Text style={[styles.tabText, tab === "candidaturas" && styles.tabTextActive]}>Minhas candidaturas</Text>
          {tab === "candidaturas" && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tab === "feed" && (
          <>
            {orders === null && (
              <View style={styles.center}>
                <Spinner />
              </View>
            )}
            {orders?.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="settings" size={32} color={C.purplePrimary} />
                </View>
                <Text style={styles.emptyText}>Nenhum pedido na sua região agora. Volte mais tarde.</Text>
              </View>
            )}
            {orders && orders.length > 0 && (
              <View style={{ gap: space.m }}>
                {orders.map((order) => {
                  const earnings = computeCleanerEarnings(order.pricing.base_price + order.pricing.extras_price);
                  return (
                    <Pressable key={order.order_id} style={styles.orderCard} onPress={() => router.push(`/(cleaner)/pedido/${order.order_id}`)}>
                      <View style={styles.orderCardTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.orderTitle}>
                            {serviceLabel(order.service.type)} · {order.service.size}
                          </Text>
                          <Text style={styles.orderSub}>
                            {order.address.neighborhood} · {formatWhen(order.scheduled_at)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.orderPriceRow}>
                        <Text style={styles.orderGross}>{formatPrice(order.pricing.gross_total)}</Text>
                        <Icon name="chevron-right" size={14} color={C.textSecondary} />
                        <Text style={styles.orderNet}>{formatPrice(earnings.cleanerNet)} líquido</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

        {tab === "candidaturas" && (
          <>
            {applications === null && (
              <View style={styles.center}>
                <Spinner />
              </View>
            )}
            {applications?.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="list" size={32} color={C.textSecondary} />
                <Text style={styles.emptyText}>Você ainda não se candidatou a nenhum pedido.</Text>
              </View>
            )}
            {applications && applications.length > 0 && (
              <View style={{ gap: space.xl }}>
                {(["pending", "selected", "declined"] as const).map((status) => {
                  const items = applications.filter((a) => a.status === status);
                  if (items.length === 0) return null;
                  const g = GROUP_LABELS[status];
                  return (
                    <View key={status}>
                      <Text style={styles.groupTitle}>
                        {g.title} <Text style={{ color: C.textSecondary }}>({items.length})</Text>
                      </Text>
                      <View style={{ gap: space.m }}>
                        {items.map((a) => (
                          <View key={a.order_id} style={[styles.applicationCard, { opacity: g.opacity }]}>
                            <View style={styles.orderCardTop}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.orderTitle}>{serviceLabel(a.order_service_type)}</Text>
                                <Text style={styles.orderSub}>{formatWhen(a.order_scheduled_at)}</Text>
                              </View>
                              <View style={[styles.badge, { backgroundColor: g.bg }]}>
                                <Text style={[styles.badgeText, { color: g.color }]}>{g.title}</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  header: { paddingHorizontal: space.xxl, paddingTop: space.xxl },
  headerTitle: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  tabs: { flexDirection: "row", gap: space.xxl, marginTop: space.l, borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: space.xxl },
  tabButton: { paddingBottom: space.m },
  tabText: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary },
  tabTextActive: { fontFamily: font.bold, color: C.purplePrimary },
  tabIndicator: { height: 2, backgroundColor: C.purplePrimary, marginTop: space.m, borderRadius: 1 },
  scrollContent: { padding: space.xxl },
  center: { alignItems: "center", paddingVertical: space.xxxl },
  emptyState: { alignItems: "center", paddingTop: space.xxxxl, gap: space.l },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 9999, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: font.regular, fontSize: font.body, color: "#6B7280", textAlign: "center", maxWidth: 260, lineHeight: 21 },
  orderCard: { backgroundColor: C.surface, borderRadius: radius.l, padding: space.l, gap: space.s },
  orderCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: space.s },
  orderTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, lineHeight: 25 },
  orderSub: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary, marginTop: 2 },
  orderPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  orderGross: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  orderNet: { fontFamily: font.regular, fontSize: font.labelSm, color: C.purplePrimary },
  applicationCard: { backgroundColor: C.surface, borderRadius: radius.l, padding: space.l },
  groupTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginBottom: space.m },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.xl },
  badgeText: { fontFamily: font.medium, fontSize: 11 },
});
