import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/src/services/firebase";

export type MyApplication = {
  order_id: string;
  status: "pending" | "selected" | "declined";
  order_service_type: string;
  order_service_size: string;
  order_scheduled_at: string;
  order_neighborhood: string;
};

// Lê os ponteiros em cleaners/{uid}/my_applications e, pra cada um, o documento
// real em orders/{orderId}/applications/{uid} (evita collectionGroup — ver
// nota em firestore.rules).
export function useMyApplications(uid: string | null) {
  const [applications, setApplications] = useState<MyApplication[] | null>(null);

  useEffect(() => {
    if (!uid) {
      setApplications(null);
      return;
    }

    const unsubDocs = new Map<string, () => void>();

    const unsubPointers = onSnapshot(collection(db, "cleaners", uid, "my_applications"), (pointerSnap) => {
      const orderIds = pointerSnap.docs.map((d) => d.id);

      for (const [orderId, unsub] of unsubDocs) {
        if (!orderIds.includes(orderId)) {
          unsub();
          unsubDocs.delete(orderId);
        }
      }

      if (orderIds.length === 0) {
        setApplications([]);
        return;
      }

      const results = new Map<string, MyApplication>();
      orderIds.forEach((orderId) => {
        if (unsubDocs.has(orderId)) return;
        const unsub = onSnapshot(doc(db, "orders", orderId, "applications", uid), (appSnap) => {
          if (appSnap.exists()) {
            results.set(orderId, { order_id: orderId, ...appSnap.data() } as MyApplication);
          } else {
            results.delete(orderId);
          }
          setApplications(Array.from(results.values()));
        });
        unsubDocs.set(orderId, unsub);
      });
    });

    return () => {
      unsubPointers();
      unsubDocs.forEach((unsub) => unsub());
    };
  }, [uid]);

  return applications;
}
