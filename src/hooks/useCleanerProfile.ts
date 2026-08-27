import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/src/services/firebase";

export type DocStatus = { storage_url: string; submitted_at: string; verified: boolean };

export type CleanerProfile = {
  cleaner_id: string;
  approval_status: "pending" | "approved" | "rejected" | "rejected_can_retry";
  approval_rejection_reason: string | null;
  documents?: Partial<Record<"id_document" | "cpf_document" | "selfie" | "address_proof", DocStatus>>;
  service_radius_km: number;
  pix?: { key_type: string; key_value: string };
};

export function useCleanerProfile(uid: string | null) {
  const [profile, setProfile] = useState<CleanerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(doc(db, "cleaners", uid), (snap) => {
      setProfile(snap.exists() ? ({ cleaner_id: snap.id, ...snap.data() } as CleanerProfile) : null);
      setLoading(false);
    });
  }, [uid]);

  return { profile, loading };
}
