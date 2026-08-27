import { useLocalSearchParams } from "expo-router";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Spinner } from "@/src/components/ui/Spinner";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";
import type { Order } from "@/src/types";

type Application = {
  application_id: string;
  cleaner_id: string;
  cleaner_name: string;
  cleaner_rating: number;
  cleaner_distance_km: number;
  status: string;
};

export default function PedidoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "orders", id), (snap) => {
      setOrder(snap.exists() ? ({ order_id: snap.id, ...snap.data() } as Order) : null);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(collection(db, "orders", id, "applications"), (snap) => {
      setApplications(snap.docs.map((d) => ({ application_id: d.id, ...d.data() } as Application)));
      setLoadingApps(false);
    });
  }, [id]);

  if (!order) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (order.status === "open") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl }}>
        <Text style={styles.title}>Faxineiras interessadas</Text>

        {loadingApps && (
          <View style={styles.center}>
            <Spinner />
          </View>
        )}

        {!loadingApps && applications.length === 0 && (
          <View style={styles.emptyState}>
            <Svg width={96} height={96} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}>
              <Path d="M20 21a8 8 0 1 0-16 0" />
              <Circle cx={12} cy={11} r={4} />
            </Svg>
            <Text style={styles.emptyText}>Ainda ninguém se candidatou. Você será avisado em breve.</Text>
          </View>
        )}

        {!loadingApps && applications.length > 0 && (
          <View style={{ gap: space.m }}>
            {applications.map((c) => (
              <View key={c.application_id} style={styles.candidateCard}>
                <Avatar name={c.cleaner_name} size="medium" />
                <View style={{ flex: 1 }}>
                  <View style={styles.candidateHeader}>
                    <Text style={styles.candidateName}>{c.cleaner_name}</Text>
                    <Text style={styles.candidateDistance}>{c.cleaner_distance_km.toFixed(1)} km</Text>
                  </View>
                  <Text style={styles.candidateRating}>★ {c.cleaner_rating}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: space.xxl }}>
      <Text style={styles.title}>Pedido</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          {order.address.street}, {order.address.number} — {order.address.neighborhood}
        </Text>
        <Text style={styles.summaryText}>{new Date(order.scheduled_at).toLocaleString("pt-BR")}</Text>
        <Text style={styles.summaryTotal}>R$ {order.pricing.net_total_client.toFixed(2).replace(".", ",")}</Text>
      </View>
      <Text style={styles.pendingNote}>Detalhes completos do acompanhamento chegam em breve.</Text>
    </ScrollView>
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
  summaryBox: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.l, gap: space.s },
  summaryText: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  summaryTotal: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginTop: space.s },
  pendingNote: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary, marginTop: space.l },
});
