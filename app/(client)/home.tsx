import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order, OrderStatus } from "@/src/types";

type Tab = "proximos" | "historico" | "cancelados";

const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  draft: { bg: "#F3F4F6", color: C.textSecondary, label: "Rascunho" },
  open: { bg: "#EDE9FE", color: C.purplePrimary, label: "Aberto" },
  confirmed: { bg: C.infoBg, color: "#1D4ED8", label: "Selecionado" },
  in_progress: { bg: C.infoBg, color: "#1D4ED8", label: "Em serviço" },
  completed: { bg: C.purplePrimary, color: "#fff", label: "Concluído" },
  disputed: { bg: C.errorBg, color: C.error, label: "Em disputa" },
  cancelled: { bg: C.errorBg, color: C.error, label: "Cancelado" },
};

const TAB_STATUSES: Record<Tab, OrderStatus[]> = {
  proximos: ["open", "confirmed", "in_progress"],
  historico: ["completed"],
  cancelados: ["cancelled", "disputed"],
};

function formatPrice(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid ?? null);
  const [tab, setTab] = useState<Tab>("proximos");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    setError(false);
    const q = query(collection(db, "orders"), where("client_id", "==", user.uid), orderBy("scheduled_at", "desc"));
    return onSnapshot(
      q,
      (snap) => setOrders(snap.docs.map((d) => ({ order_id: d.id, ...d.data() } as Order)).filter((o) => o.status !== "draft")),
      () => setError(true)
    );
  }, [user]);

  const isLoading = orders === null && !error;
  const visibleOrders = (orders ?? []).filter((o) => TAB_STATUSES[tab].includes(o.status));
  const isEmpty = !isLoading && !error && orders?.length === 0;
  const showList = !isLoading && !error && (orders?.length ?? 0) > 0;

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const greetingName = profile?.name || user?.email?.split("@")[0] || "";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: space.xxl }}>
          <Text style={styles.greeting}>Oi, {greetingName}</Text>
          <Text style={styles.dateLabel}>{today.charAt(0).toUpperCase() + today.slice(1)}</Text>
        </View>

        <View style={styles.tabs}>
          {(["proximos", "historico", "cancelados"] as Tab[]).map((t) => (
            <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "proximos" ? "Próximos" : t === "historico" ? "Histórico" : "Cancelados"}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading && (
          <View style={{ alignItems: "center", paddingVertical: space.xxxl }}>
            <Spinner />
          </View>
        )}

        {error && (
          <View style={styles.stateContainer}>
            <Icon name="alert-triangle" size={48} color={C.error} />
            <Text style={styles.stateText}>Não deu pra carregar seus pedidos agora.</Text>
            <Button variant="primary" size="large" onPress={() => setError(false)}>
              Tentar de novo
            </Button>
          </View>
        )}

        {isEmpty && (
          <View style={styles.stateContainer}>
            <Svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}>
              <Rect x={3} y={7} width={18} height={13} rx={2} />
              <Path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <Path d="M3 12h18" />
              <Circle cx={9} cy={12} r={1} fill={C.border} />
              <Circle cx={15} cy={12} r={1} fill={C.border} />
            </Svg>
            <Text style={styles.stateText}>Você ainda não tem pedidos. Crie o primeiro e receba propostas em minutos.</Text>
            <Button variant="primary" size="large" onPress={() => router.push("/(client)/criar-pedido")}>
              Criar meu primeiro pedido
            </Button>
          </View>
        )}

        {showList && (
          <View style={{ gap: space.m }}>
            {visibleOrders.map((order) => {
              const s = STATUS_STYLE[order.status];
              return (
                <Pressable
                  key={order.order_id}
                  style={styles.orderCard}
                  onPress={() => router.push(`/(client)/pedido/${order.order_id}`)}
                >
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                  <View style={styles.orderHeader}>
                    <Icon name="cleaning" size={20} color={C.purplePrimary} />
                    <Text style={styles.orderTitle}>{serviceLabel(order.service.type)}</Text>
                  </View>
                  <Text style={styles.orderDate}>{formatDate(order.scheduled_at)}</Text>
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderPrice}>{formatPrice(order.pricing.net_total_client)}</Text>
                    {order.cleaner_name && (
                      <View style={styles.cleanerRow}>
                        <Avatar name={order.cleaner_name} size="small" />
                        <Text style={styles.cleanerName}>{order.cleaner_name}</Text>
                        {order.cleaner_rating != null && <Text style={styles.cleanerRating}>★ {order.cleaner_rating}</Text>}
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {!isEmpty && (
        <Pressable style={styles.fab} onPress={() => router.push("/(client)/criar-pedido")}>
          <Icon name="plus" size={24} color="#fff" strokeWidth={2.5} />
        </Pressable>
      )}
    </View>
  );
}

function serviceLabel(type: Order["service"]["type"]) {
  if (type === "standard") return "Limpeza Padrão";
  if (type === "heavy") return "Limpeza Pesada";
  return "Lavanderia";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  scrollContent: { padding: space.xxl },
  greeting: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: 4 },
  dateLabel: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: radius.l,
    padding: 4,
    gap: 4,
    marginBottom: space.l,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: radius.m },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: { fontFamily: font.medium, fontSize: font.bodySm, color: C.textSecondary },
  tabTextActive: { color: C.purplePrimary },
  stateContainer: { alignItems: "center", paddingVertical: space.xxxxl, paddingHorizontal: space.l, gap: space.xxl },
  stateText: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", lineHeight: 22 },
  orderCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: radius.l,
    padding: space.l,
  },
  badge: {
    position: "absolute",
    top: space.l,
    right: space.l,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.xl,
  },
  badgeText: { fontFamily: font.bold, fontSize: 11 },
  orderHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, paddingRight: 100 },
  orderTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum },
  orderDate: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary, marginBottom: space.m },
  orderFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  orderPrice: { fontFamily: font.medium, fontSize: font.body, color: C.purplePrimary },
  cleanerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cleanerName: { fontFamily: font.medium, fontSize: font.bodySm, color: C.textMaximum },
  cleanerRating: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary },
  fab: {
    position: "absolute",
    right: space.xxl,
    bottom: space.xxl,
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: C.purplePrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
