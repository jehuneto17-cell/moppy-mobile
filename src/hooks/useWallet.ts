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
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setBalance(null);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubWallet = onSnapshot(doc(db, "wallets", uid), (snap) => {
      setBalance(snap.exists() ? snap.data().balance : { total: 0, pending_release: 0, available: 0 });
      setLoading(false);
    });
    const unsubTx = onSnapshot(query(collection(db, "wallets", uid, "transactions"), orderBy("timestamp", "desc")), (snap) => {
      setTransactions(snap.docs.map((d) => ({ transaction_id: d.id, ...d.data() } as WalletTransaction)));
    });
    return () => {
      unsubWallet();
      unsubTx();
    };
  }, [uid]);

  return { balance, transactions, loading };
}
