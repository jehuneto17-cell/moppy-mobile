import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order } from "@/src/types";
import { computeCleanerEarnings } from "@/src/utils/price";

function formatPrice(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function serviceLabel(type: string) {
  if (type === "standard") return "Limpeza Padrão";
  if (type === "heavy") return "Limpeza Pesada";
  return "Passar Roupas";
}

export default function CleanerPedidoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid ?? null);
  const [order, setOrder] = useState<Order | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "orders", id), (snap) => setOrder(snap.exists() ? ({ order_id: snap.id, ...snap.data() } as Order) : null));
  }, [id]);

  const isMine = !!order && !!user && order.cleaner_id === user.uid;

  useEffect(() => {
    if (!id || !user || isMine) return;
    getDocs(query(collection(db, "orders", id, "applications"), where("cleaner_id", "==", user.uid))).then((snap) => setAlreadyApplied(!snap.empty));
  }, [id, user, isMine]);

  // Dia do serviço: leva pro fluxo certo conforme o estado (F11 chegada -> F12 andamento -> F13 aguardando -> F14 disputa).
  useEffect(() => {
    if (!order || !isMine) return;
    if (order.status === "in_progress" && !order.cleaner_completed_at) {
      router.replace(`/(cleaner)/pedido/${order.order_id}/andamento`);
    } else if (order.status === "in_progress" && order.cleaner_completed_at && !order.client_confirmed_at) {
      router.replace(`/(cleaner)/pedido/${order.order_id}/aguardando`);
    } else if (order.status === "disputed") {
      router.replace(`/(cleaner)/pedido/${order.order_id}/disputa`);
    }
  }, [order, isMine]);

  async function handleApply() {
    if (!user || !order || alreadyApplied) return;
    setApplying(true);

    const conflictQuery = query(
      collection(db, "orders"),
      where("cleaner_id", "==", user.uid),
      where("scheduled_at", "==", order.scheduled_at)
    );
    const conflictSnap = await getDocs(conflictQuery);
    if (!conflictSnap.empty) {
      setApplying(false);
      router.push({ pathname: "/(cleaner)/candidatura-resultado", params: { status: "erro" } });
      return;
    }

    const appliedAt = serverTimestamp();
    await setDoc(doc(db, "orders", order.order_id, "applications", user.uid), {
      cleaner_id: user.uid,
      cleaner_name: profile?.name || user.email?.split("@")[0] || "Faxineira",
      cleaner_rating: 5,
      cleaner_distance_km: Number((Math.random() * 4 + 0.5).toFixed(1)),
      applied_at: appliedAt,
      status: "pending",
      order_service_type: order.service.type,
      order_service_size: order.service.size,
      order_scheduled_at: order.scheduled_at,
      order_neighborhood: order.address.neighborhood,
    });

    // Ponteiro em cleaners/{uid}/my_applications — "Minhas candidaturas" lê daqui
    // em vez de um collectionGroup (ver nota em firestore.rules).
    await setDoc(doc(db, "cleaners", user.uid, "my_applications", order.order_id), {
      order_id: order.order_id,
      applied_at: appliedAt,
    });

    setApplying(false);
    router.push({ pathname: "/(cleaner)/candidatura-resultado", params: { status: "sucesso" } });
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  const earnings = computeCleanerEarnings(order.pricing.base_price + order.pricing.extras_price);

  if (isMine && order.status === "confirmed") {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: space.xxl, paddingBottom: 112 }}>
          <Text style={styles.title}>
            {serviceLabel(order.service.type)} · {order.service.size}
          </Text>
          <Text style={styles.sub}>{new Date(order.scheduled_at).toLocaleString("pt-BR")}</Text>
          <Text style={styles.sub}>{order.address.street}, {order.address.number} — {order.address.neighborhood}</Text>
          <Text style={styles.confirmedNote}>Serviço confirmado. No dia, confirme sua chegada aqui.</Text>
        </ScrollView>
        <View style={styles.footer}>
          <Button variant="primary" size="large" onPress={() => router.push(`/(cleaner)/pedido/${order.order_id}/chegada`)} style={{ width: "100%" }}>
            Confirmar chegada
          </Button>
        </View>
      </View>
    );
  }

  if (isMine && order.status === "completed") {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: space.xxl, paddingBottom: 112 }}>
          <Text style={styles.title}>
            {serviceLabel(order.service.type)} · {order.service.size}
          </Text>
          <Text style={styles.sub}>{new Date(order.scheduled_at).toLocaleString("pt-BR")}</Text>
          <View style={styles.breakdown}>
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Você recebeu</Text>
              <Text style={styles.totalValue}>{formatPrice(earnings.cleanerNet)}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button variant="secondary" size="large" onPress={() => router.push(`/(cleaner)/pedido/${order.order_id}/avaliacao`)} style={{ width: "100%" }}>
            Avaliar cliente
          </Button>
        </View>
      </View>
    );
  }

  if (isMine) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: space.xxl, paddingBottom: 112 }}>
        <Text style={styles.title}>
          {serviceLabel(order.service.type)} · {order.service.size}
        </Text>
        <Text style={styles.sub}>{new Date(order.scheduled_at).toLocaleString("pt-BR")}</Text>
        <Text style={styles.sub}>{order.address.neighborhood}</Text>

        {order.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Sobre o pedido</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        <View style={styles.breakdown}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Valor do serviço</Text>
            <Text style={styles.rowValue}>{formatPrice(order.pricing.base_price + order.pricing.extras_price)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Comissão Moppy (15%)</Text>
            <Text style={styles.rowValue}>− {formatPrice(earnings.commission)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Taxa de processamento (50%)</Text>
            <Text style={styles.rowValue}>− {formatPrice(earnings.cleanerFeeShare)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Você receberá</Text>
            <Text style={styles.totalValue}>{formatPrice(earnings.cleanerNet)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" size="large" disabled={alreadyApplied} loading={applying} onPress={handleApply} style={{ width: "100%" }}>
          {alreadyApplied ? "Você já se candidatou" : "Me candidatar"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, lineHeight: 30 },
  sub: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, marginTop: space.s },
  confirmedNote: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum, marginTop: space.xl, backgroundColor: C.surface, borderRadius: radius.l, padding: space.l },
  notesBox: { marginTop: space.l, backgroundColor: C.surface, borderRadius: radius.l, padding: space.l },
  notesLabel: { fontFamily: font.medium, fontSize: font.bodySm, color: C.textSecondary, marginBottom: space.xs },
  notesText: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum, lineHeight: 20 },
  breakdown: { marginTop: space.l, backgroundColor: C.surface, borderRadius: radius.l, padding: space.l },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: space.s },
  rowLabel: { fontFamily: font.regular, fontSize: font.body, color: "#6B7280" },
  rowValue: { fontFamily: font.regular, fontSize: font.body, color: "#6B7280" },
  divider: { height: 1, backgroundColor: C.border, marginVertical: space.m },
  totalLabel: { fontFamily: font.bold, fontSize: font.bodyLg, color: C.textMaximum },
  totalValue: { fontFamily: font.bold, fontSize: font.h3, color: C.purplePrimary },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: space.l, paddingHorizontal: space.xxl, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
});
