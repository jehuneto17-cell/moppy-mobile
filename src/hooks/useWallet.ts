import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/src/services/firebase";

export type WalletBalance = { total: number; pending_release: number; available: number };
export type WalletTransaction = {
  transaction_id: string;
  type: "credit" | "withdraw" | "refund";
  amount: number;
  order_id?: string;
  timestamp: { seconds: number } | null;
};

export function useWallet(uid: string | null) {
  // Mesma guarda de useCleanerProfile.ts/useUserProfile.ts: sem isso, quando
  // uid muda de null pra um valor real, o hook devolve balance/loading do uid
  // antigo por um render (até o useEffect rodar) — aqui não redireciona
  // ninguém, mas pisca o estado "sem saldo ainda" por uma fração de segundo.
  const [state, setState] = useState<{ uid: string | null; balance: WalletBalance | null; transactions: WalletTransaction[]; loading: boolean }>({
    uid: null,
    balance: null,
    transactions: [],
    loading: true,
  });

  useEffect(() => {
    if (!uid) {
      setState({ uid, balance: null, transactions: [], loading: false });
      return;
    }
    setState({ uid, balance: null, transactions: [], loading: true });
    const unsubWallet = onSnapshot(doc(db, "wallets", uid), (snap) => {
      setState((s) => ({
        ...s,
        balance: snap.exists() ? snap.data().balance : { total: 0, pending_release: 0, available: 0 },
        loading: false,
      }));
    });
    const unsubTx = onSnapshot(query(collection(db, "wallets", uid, "transactions"), orderBy("timestamp", "desc")), (snap) => {
      setState((s) => ({ ...s, transactions: snap.docs.map((d) => ({ transaction_id: d.id, ...d.data() } as WalletTransaction)) }));
    });
    return () => {
      unsubWallet();
      unsubTx();
    };
  }, [uid]);

  const stale = state.uid !== uid;
  return { balance: stale ? null : state.balance, transactions: stale ? [] : state.transactions, loading: stale || state.loading };
}
