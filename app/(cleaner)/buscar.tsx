import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { useMyApplications, type MyApplication } from "@/src/hooks/useMyApplications";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order } from "@/src/types";
import { distanceKm } from "@/src/utils/geo";
import { computeCleanerEarnings } from "@/src/utils/price";

// Melhor-esforço: sem permissão ou fora de um dispositivo com GPS, a distância simplesmente não aparece no card.
function useCleanerPosition() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({});
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // sem GPS/permissão — feed segue funcionando sem o badge de distância
      }
    })();
  }, []);

  return position;
}

const CLEAN_TYPES = [
  { key: "standard", label: "Padrão" },
  { key: "heavy", label: "Pesada" },
  { key: "laundry", label: "Passar Roupa" },
] as const;

const SIZES = [
  { key: "studio", label: "Studio" },
  { key: "1q", label: "1 quarto" },
  { key: "2q", label: "2 quartos" },
  { key: "3q", label: "3 quartos" },
  { key: "4q+", label: "4+ quartos" },
] as const;

const DATE_OPTIONS = [
  { key: "hoje", label: "Hoje" },
  { key: "3dias", label: "Próx. 3 dias" },
  { key: "semana", label: "Próx. semana" },
] as const;

function withinDateOption(scheduledAt: string, option: (typeof DATE_OPTIONS)[number]["key"]) {
  const days = option === "hoje" ? 1 : option === "3dias" ? 3 : 7;
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return new Date(scheduledAt) <= limit;
}

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
  const cleanerPosition = useCleanerPosition();

  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "==", "open"), orderBy("scheduled_at", "asc"));
    return onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => ({ order_id: d.id, ...d.data() } as Order))));
  }, []);

  const applications = useMyApplications(user?.uid ?? null);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [dateOption, setDateOption] = useState<(typeof DATE_OPTIONS)[number]["key"] | null>(null);

  const filteredOrders = useMemo(() => {
    if (!orders) return orders;
    return orders.filter((o) => {
      if (selectedTypes.size > 0 && !selectedTypes.has(o.service.type)) return false;
      if (selectedSizes.size > 0 && !selectedSizes.has(o.service.size)) return false;
      if (dateOption && !withinDateOption(o.scheduled_at, dateOption)) return false;
      return true;
    });
  }, [orders, selectedTypes, selectedSizes, dateOption]);

  const activeFilterCount = selectedTypes.size + selectedSizes.size + (dateOption ? 1 : 0);

  function toggleSet(set: Set<string>, setter: (s: Set<string>) => void, key: string) {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    setter(next);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trabalhos disponíveis</Text>
        <Pressable style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Icon name="settings" size={16} color={C.purplePrimary} />
          <Text style={styles.filterButtonText}>Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</Text>
        </Pressable>
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
            {filteredOrders === null && (
              <View style={styles.center}>
                <Spinner />
              </View>
            )}
            {filteredOrders?.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="settings" size={32} color={C.purplePrimary} />
                </View>
                <Text style={styles.emptyText}>
                  {activeFilterCount > 0 ? "Nenhum pedido bate com esses filtros." : "Nenhum pedido na sua região agora. Volte mais tarde."}
                </Text>
              </View>
            )}
            {filteredOrders && filteredOrders.length > 0 && (
              <View style={{ gap: space.m }}>
                {filteredOrders.map((order) => {
                  const earnings = computeCleanerEarnings(order.pricing.base_price + order.pricing.extras_price);
                  const distance =
                    cleanerPosition && order.address.lat != null && order.address.lng != null
                      ? distanceKm(cleanerPosition, { lat: order.address.lat, lng: order.address.lng })
                      : null;
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
                        {distance != null && (
                          <View style={styles.distanceBadge}>
                            <Text style={styles.distanceBadgeText}>{distance.toFixed(1)} km</Text>
                          </View>
                        )}
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

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView contentContainerStyle={{ paddingBottom: space.l }}>
              <Text style={styles.modalTitle}>Filtros</Text>

              <Text style={styles.filterSectionLabel}>Tipo de limpeza</Text>
              <View style={{ gap: space.m, marginBottom: space.l }}>
                {CLEAN_TYPES.map((t) => (
                  <Checkbox key={t.key} label={t.label} checked={selectedTypes.has(t.key)} onChange={() => toggleSet(selectedTypes, setSelectedTypes, t.key)} />
                ))}
              </View>

              <Text style={styles.filterSectionLabel}>Tamanho</Text>
              <View style={{ gap: space.m, marginBottom: space.l }}>
                {SIZES.map((s) => (
                  <Checkbox key={s.key} label={s.label} checked={selectedSizes.has(s.key)} onChange={() => toggleSet(selectedSizes, setSelectedSizes, s.key)} />
                ))}
              </View>

              <Text style={styles.filterSectionLabel}>Data</Text>
              <View style={{ flexDirection: "row", gap: space.s, flexWrap: "wrap" }}>
                {DATE_OPTIONS.map((d) => (
                  <Pressable
                    key={d.key}
                    onPress={() => setDateOption(dateOption === d.key ? null : d.key)}
                    style={[styles.dateChip, dateOption === d.key && styles.dateChipActive]}
                  >
                    <Text style={[styles.dateChipText, dateOption === d.key && styles.dateChipTextActive]}>{d.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.resultsCount}>{filteredOrders?.length ?? 0} pedidos encontrados</Text>
              <View style={{ flexDirection: "row", gap: space.s }}>
                <Button
                  variant="ghost"
                  size="large"
                  style={{ flex: 1 }}
                  onPress={() => {
                    setSelectedTypes(new Set());
                    setSelectedSizes(new Set());
                    setDateOption(null);
                  }}
                >
                  Limpar
                </Button>
                <Button variant="primary" size="large" style={{ flex: 1 }} onPress={() => setShowFilters(false)}>
                  Aplicar filtros
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.xxl, paddingTop: space.xxl },
  headerTitle: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  filterButton: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: C.border, borderRadius: radius.m, paddingVertical: space.s, paddingHorizontal: space.m },
  filterButtonText: { fontFamily: font.medium, fontSize: font.labelSm, color: C.purplePrimary },
  modalOverlay: { flex: 1, backgroundColor: "#1F2937AA", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xxl, maxHeight: "75%" },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.borderStrong, alignSelf: "center", marginBottom: space.l },
  modalTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginBottom: space.l },
  filterSectionLabel: { fontFamily: font.bold, fontSize: font.body, color: C.textMaximum, marginBottom: space.m },
  dateChip: { paddingVertical: space.s, paddingHorizontal: space.l, borderRadius: 999, borderWidth: 1, borderColor: C.border },
  dateChipActive: { backgroundColor: C.purpleLight, borderColor: C.purplePrimary },
  dateChipText: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  dateChipTextActive: { color: C.purplePrimary },
  modalFooter: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: space.l },
  resultsCount: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary, textAlign: "center", marginBottom: space.m },
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
  distanceBadge: { backgroundColor: "#F3E8FF", borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: space.s, flexShrink: 0 },
  distanceBadgeText: { fontFamily: font.medium, fontSize: font.labelSm, color: C.purpleStrong },
  orderPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  orderGross: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  orderNet: { fontFamily: font.regular, fontSize: font.labelSm, color: C.purplePrimary },
  applicationCard: { backgroundColor: C.surface, borderRadius: radius.l, padding: space.l },
  groupTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginBottom: space.m },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.xl },
  badgeText: { fontFamily: font.medium, fontSize: 11 },
});
