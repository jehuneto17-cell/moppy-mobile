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
  // Guarda de qual uid veio o profile/loading atual — sem isso, quando uid
  // troca de null pra um valor real (ex: role carrega um instante depois de
  // montar), o useEffect ainda não rodou nesse render e o hook devolve o
  // profile/loading antigos (do uid=null: profile null, loading false), que
  // useRoleGuard lê como "perfil não existe" e redireciona pro onboarding
  // por engano, mesmo a conta já tendo perfil aprovado.
  const [state, setState] = useState<{ uid: string | null; profile: CleanerProfile | null; loading: boolean }>({
    uid: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    if (!uid) {
      setState({ uid, profile: null, loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(doc(db, "cleaners", uid), (snap) => {
      setState({ uid, profile: snap.exists() ? ({ cleaner_id: snap.id, ...snap.data() } as CleanerProfile) : null, loading: false });
    });
  }, [uid]);

  const stale = state.uid !== uid;
  return { profile: stale ? null : state.profile, loading: stale || state.loading };
}
