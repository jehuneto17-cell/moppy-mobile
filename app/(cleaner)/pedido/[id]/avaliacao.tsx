import { useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { ReviewScreen } from "@/src/components/review/ReviewScreen";
import { Spinner } from "@/src/components/ui/Spinner";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { db } from "@/src/services/firebase";
import { C } from "@/src/theme";
import type { Order } from "@/src/types";

export default function CleanerAvaliacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const { profile: clientProfile } = useUserProfile(order?.client_id ?? null);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "orders", id), (snap) => setOrder(snap.exists() ? ({ order_id: snap.id, ...snap.data() } as Order) : null));
  }, [id]);

  if (!order) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.white }}>
        <Spinner />
      </View>
    );
  }

  return <ReviewScreen orderId={order.order_id} toUserId={order.client_id} toUserName={clientProfile?.name ?? ""} />;
}
