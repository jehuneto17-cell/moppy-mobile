import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { CancelOrderSheet } from "@/src/components/order/CancelOrderSheet";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order } from "@/src/types";

const CANCELABLE_STATUSES = ["open", "confirmed", "in_progress"];

type PaymentTone = "neutral" | "warning" | "error" | "success";

const PAYMENT_LABELS: Record<string, { label: string; tone: PaymentTone }> = {
  pending: { label: "Aguardando cobrança", tone: "neutral" },
  charge_pending: { label: "Cobrança em processamento", tone: "neutral" },
  charge_success: { label: "Pagamento confirmado", tone: "success" },
  charge_retry_1: { label: "Não conseguimos cobrar seu cartão — tentando de novo automaticamente", tone: "warning" },
  charge_retry_2: { label: "Não conseguimos cobrar seu cartão — tentando de novo automaticamente", tone: "warning" },
  charge_failed: { label: "Cobrança falhou. Atualize o cartão no seu perfil.", tone: "error" },
  cancelled_no_payment: { label: "Pedido cancelado por falta de pagamento", tone: "error" },
  refund_pending: { label: "Estorno em processamento", tone: "neutral" },
  refunded: { label: "Valor estornado", tone: "neutral" },
  partial_refund: { label: "Valor parcialmente estornado", tone: "neutral" },
  chargeback_requested: { label: "Contestação de pagamento em análise", tone: "warning" },
  disputa_aberta: { label: "Pagamento retido até a disputa ser resolvida", tone: "warning" },
  cancelled_free: { label: "Pedido cancelado sem cobrança", tone: "neutral" },
};

const PAYMENT_TONE_STYLE: Record<PaymentTone, { bg: string; color: string }> = {
  neutral: { bg: C.surface, color: C.textSecondary },
  warning: { bg: C.warningBg, color: C.warningDark },
  error: { bg: C.errorBg, color: C.error },
  success: { bg: C.successBg, color: C.successDark },
};

type Application = {
  application_id: string;
  cleaner_id: string;
  cleaner_name: string;
  cleaner_rating: number;
  cleaner_distance_km: number;
  status: string;
};

type Stage = "confirmado" | "em_servico" | "concluido";

function deriveStage(order: Order): Stage {
  if (!order.arrived_at) return "confirmado";
  if (!order.cleaner_completed_at) return "em_servico";
  return "concluido";
}

const STAGE_LABEL: Record<Stage, string> = {
  confirmado: "Pedido confirmado",
  em_servico: "Em serviço",
  concluido: "Pendente de confirmação",
};

function buildTimeline(stage: Stage) {
  const order: Stage[] = ["confirmado", "em_servico", "concluido"];
  const idx = order.indexOf(stage);
  const items = [
    { key: "confirmado", title: "Pedido confirmado" },
    { key: "chegando", title: "Faxineira chegando" },
    { key: "em_servico", title: "Em serviço" },
    { key: "concluido", title: "Pendente de confirmação" },
  ];
  // "confirmado" e "chegando" viram completos juntos: não há um timestamp separado de
  // "saiu a caminho" no schema, só arrived_at (que já move o stage pra em_servico).
  const stepIdx = idx === 0 ? 0 : idx + 1;
  return items.map((item, i) => ({
    ...item,
    complete: i < stepIdx,
    active: i === stepIdx,
    showConnector: i < items.length - 1,
  }));
}

export default function PedidoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "orders", id), (snap) => {
      setOrder(snap.exists() ? ({ order_id: snap.id, ...snap.data() } as Order) : null);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "payments", id), (snap) => setPaymentStatus(snap.exists() ? snap.data().status : null));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(collection(db, "orders", id, "applications"), (snap) => {
      setApplications(snap.docs.map((d) => ({ application_id: d.id, ...d.data() } as Application)));
      setLoadingApps(false);
    });
  }, [id]);

  // Assim que a faxineira conclui (F12), leva direto pra "Está tudo certo?" (C23).
  useEffect(() => {
    if (order && order.status === "in_progress" && order.cleaner_completed_at && !order.client_confirmed_at) {
      router.replace(`/(client)/pedido/${order.order_id}/confirmacao`);
    }
  }, [order]);

  if (!order) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (order.status === "open") {
    return (
      <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: space.xxl }}>
        <Text style={styles.title}>Faxineiras interessadas</Text>

        {loadingApps && (
          <View style={styles.center}>
            <Spinner />
          </View>
        )}

        {!loadingApps && applications.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="users" size={64} color={C.border} />
            <Text style={styles.emptyText}>Ainda ninguém se candidatou. Você será avisado em breve.</Text>
          </View>
        )}

        {!loadingApps && applications.length > 0 && (
          <View style={{ gap: space.m }}>
            {applications.map((c) => (
              <Pressable
                key={c.application_id}
                style={styles.candidateCard}
                onPress={() => router.push(`/(client)/pedido/${order.order_id}/candidata?candidateId=${c.cleaner_id}`)}
              >
                <Avatar name={c.cleaner_name} size="medium" />
                <View style={{ flex: 1 }}>
                  <View style={styles.candidateHeader}>
                    <Text style={styles.candidateName}>{c.cleaner_name}</Text>
                    <Text style={styles.candidateDistance}>{c.cleaner_distance_km.toFixed(1)} km</Text>
                  </View>
                  <Text style={styles.candidateRating}>★ {c.cleaner_rating}</Text>
                </View>
                <Icon name="chevron-right" size={18} color={C.textSecondary} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable style={styles.cancelLink} onPress={() => setShowCancel(true)}>
        <Text style={styles.cancelLinkText}>Cancelar pedido</Text>
      </Pressable>

      <CancelOrderSheet
        orderId={order.order_id}
        visible={showCancel}
        onClose={() => setShowCancel(false)}
        onCancelled={() => {
          setShowCancel(false);
          router.replace("/(client)/home");
        }}
      />
      </View>
    );
  }

  const stage = deriveStage(order);
  const timeline = buildTimeline(stage);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: space.xxl }}>
        <View style={styles.statusBadgeWrap}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {order.status === "completed" ? "Concluído" : order.status === "disputed" ? "Em disputa" : order.status === "cancelled" ? "Cancelado" : STAGE_LABEL[stage]}
            </Text>
          </View>
        </View>

        {["confirmed", "in_progress"].includes(order.status) && (
          <View style={{ marginBottom: space.xl }}>
            {timeline.map((step, i) => (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineDotCol}>
                  <View style={[styles.timelineDot, step.complete ? styles.dotComplete : step.active ? styles.dotActive : styles.dotNormal]}>
                    {step.complete && <Icon name="check" size={10} color="#fff" strokeWidth={3} />}
                  </View>
                  {step.showConnector && <View style={styles.timelineConnector} />}
                </View>
                <Text style={styles.timelineTitle}>{step.title}</Text>
              </View>
            ))}
          </View>
        )}

        {order.cleaner_id && (
          <View style={styles.cleanerCard}>
            <Avatar name={order.cleaner_name ?? "Faxineira"} size="medium" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cleanerName}>{order.cleaner_name}</Text>
              <Text style={styles.cleanerRating}>★ {order.cleaner_rating ?? 5} · Faxineira</Text>
            </View>
            <Pressable style={styles.chatButton} onPress={() => router.push(`/(client)/pedido/${order.order_id}/chat`)}>
              <Icon name="message-circle" size={16} color={C.purplePrimary} />
              <Text style={styles.chatButtonText}>Chat</Text>
            </Pressable>
          </View>
        )}

        {stage === "confirmado" && order.status === "confirmed" && (
          <Pressable style={styles.codeLink} onPress={() => setShowCode(true)}>
            <Text style={styles.codeLinkText}>Ver código de chegada</Text>
          </Pressable>
        )}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            {order.address.street}, {order.address.number} — {order.address.neighborhood}
          </Text>
          <Text style={styles.summaryText}>{new Date(order.scheduled_at).toLocaleString("pt-BR")}</Text>
          <Text style={styles.summaryTotal}>R$ {order.pricing.net_total_client.toFixed(2).replace(".", ",")}</Text>
        </View>

        {paymentStatus && PAYMENT_LABELS[paymentStatus] && (
          <View
            style={[
              styles.paymentBadge,
              { backgroundColor: PAYMENT_TONE_STYLE[PAYMENT_LABELS[paymentStatus].tone].bg },
            ]}
          >
            <Icon name="credit-card" size={16} color={PAYMENT_TONE_STYLE[PAYMENT_LABELS[paymentStatus].tone].color} />
            <Text style={[styles.paymentBadgeText, { color: PAYMENT_TONE_STYLE[PAYMENT_LABELS[paymentStatus].tone].color }]}>
              {PAYMENT_LABELS[paymentStatus].label}
            </Text>
          </View>
        )}

        {CANCELABLE_STATUSES.includes(order.status) && (
          <Pressable style={styles.cancelLink} onPress={() => setShowCancel(true)}>
            <Text style={styles.cancelLinkText}>Cancelar pedido</Text>
          </Pressable>
        )}
      </ScrollView>

      <CancelOrderSheet
        orderId={order.order_id}
        visible={showCancel}
        onClose={() => setShowCancel(false)}
        onCancelled={() => {
          setShowCancel(false);
          router.replace("/(client)/home");
        }}
      />

      <Modal visible={showCode} transparent animationType="slide" onRequestClose={() => setShowCode(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Pressable style={styles.modalClose} onPress={() => setShowCode(false)}>
              <Icon name="x" size={22} color={C.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>Código de chegada</Text>
            <Text style={styles.modalSubtitle}>Passe este código para a faxineira confirmar que chegou</Text>
            <Text style={styles.modalCode}>{(order.arrival_code ?? "----").split("").join(" ")}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: space.xxxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  emptyState: { alignItems: "center", paddingVertical: space.xxxl, gap: space.xxl },
  emptyText: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", lineHeight: 22, maxWidth: 280 },
  candidateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: radius.l,
    padding: space.l,
  },
  candidateHeader: { flexDirection: "row", justifyContent: "space-between" },
  candidateName: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum },
  candidateDistance: { fontFamily: font.medium, fontSize: font.body, color: C.purplePrimary },
  candidateRating: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textMaximum, marginTop: 2 },
  statusBadgeWrap: { alignItems: "center", marginBottom: space.xxl },
  statusBadge: { backgroundColor: C.purpleLight, borderRadius: radius.xl, paddingVertical: space.s, paddingHorizontal: space.xl },
  statusBadgeText: { fontFamily: font.medium, fontSize: font.body, color: C.purpleVeryDark },
  timelineRow: { flexDirection: "row", gap: space.l },
  timelineDotCol: { alignItems: "center" },
  timelineDot: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  dotComplete: { backgroundColor: C.purplePrimary, borderColor: C.purplePrimary },
  dotActive: { backgroundColor: C.purpleLight, borderColor: C.purplePrimary },
  dotNormal: { backgroundColor: "#fff", borderColor: C.border },
  timelineConnector: { width: 2, flex: 1, minHeight: 24, backgroundColor: C.border },
  timelineTitle: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum, paddingBottom: space.xl },
  cleanerCard: { flexDirection: "row", alignItems: "center", gap: space.m, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.l, marginTop: space.s },
  cleanerName: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  cleanerRating: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  chatButton: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: C.border, borderRadius: radius.m, paddingVertical: space.s, paddingHorizontal: space.m },
  chatButtonText: { fontFamily: font.medium, fontSize: font.bodySm, color: C.purplePrimary },
  codeLink: { alignItems: "center", marginTop: space.l },
  codeLinkText: { fontFamily: font.medium, fontSize: font.body, color: C.purplePrimary },
  summaryBox: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.l, gap: space.s, marginTop: space.xl },
  paymentBadge: { flexDirection: "row", alignItems: "center", gap: space.s, borderRadius: radius.l, padding: space.m, marginTop: space.m },
  paymentBadgeText: { fontFamily: font.medium, fontSize: font.bodySm, flex: 1, lineHeight: 18 },
  summaryText: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  summaryTotal: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginTop: space.s },
  cancelLink: { alignItems: "center", marginTop: space.xl },
  cancelLinkText: { fontFamily: font.medium, fontSize: font.body, color: C.error },
  modalOverlay: { flex: 1, backgroundColor: "#1F2937AA", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xxl, alignItems: "center", minHeight: "40%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: space.l },
  modalClose: { position: "absolute", top: space.l, right: space.l },
  modalTitle: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginTop: space.l },
  modalSubtitle: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", marginTop: space.s, maxWidth: 280 },
  modalCode: { fontFamily: font.bold, fontSize: 40, color: C.textMaximum, letterSpacing: 8, marginTop: space.xxxl },
});
