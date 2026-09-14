import { useRouter } from "expo-router";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Card } from "@/src/components/ui/Card";
import { CardBrandBadge } from "@/src/components/ui/CardBrandBadge";
import { Icon } from "@/src/components/ui/Icon";
import { WizardShell } from "@/src/components/wizard/WizardShell";
import { useAuth } from "@/src/hooks/useAuth";
import { useCards } from "@/src/hooks/useCards";
import { db } from "@/src/services/firebase";
import { useCreateOrderStore } from "@/src/store/createOrderStore";
import { C, font, space } from "@/src/theme";
import { computeOrderPrice } from "@/src/utils/price";

export default function PagamentoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cards } = useCards(user?.uid ?? null);
  const { address, serviceType, size, addonIds, scheduledDate, scheduledTime, urgencyTier, cardId, notes, setCardId, reset } = useCreateOrderStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(cardId);
  const [error, setError] = useState<string | false>(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!selectedCardId) return setError("Selecione um cartão para continuar.");
    if (!user) return setError("Sua sessão expirou. Faça login de novo.");
    if (!address || !serviceType || !size || !scheduledDate || !scheduledTime) {
      // Estado da wizard (Zustand em memória, sem persistência) se perdeu — geralmente
      // por recarregar a página no meio do fluxo. Manda de volta pro início do pedido
      // em vez de deixar o botão "Confirmar" sem fazer nada.
      setError("Alguma informação do pedido se perdeu. Vamos recomeçar essa parte.");
      setTimeout(() => router.replace("/(client)/criar-pedido/endereco"), 1500);
      return;
    }
    setLoading(true);
    setError(false);

    try {
      const price = computeOrderPrice(size, addonIds, urgencyTier);
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

      const docRef = await addDoc(collection(db, "orders"), {
        client_id: user.uid,
        client_name: user.displayName ?? null,
        cleaner_id: null,
        address: {
          street: address.street,
          number: address.number,
          complement: address.complement ?? "",
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          lat: address.lat ?? null,
          lng: address.lng ?? null,
        },
        service: {
          type: serviceType,
          size,
          extras: addonIds.map((id) => ({ id })),
        },
        scheduled_at: scheduledAt,
        pricing: {
          base_price: price.basePrice,
          extras_price: price.extrasPrice,
          subtotal: price.subtotal,
          urgency_fee: price.urgencyFee,
          gross_total: price.grossTotal,
          net_total_client: price.netTotalClient,
        },
        status: "draft",
        card_id: selectedCardId,
        notes: notes.trim() || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // DATABASE.md exige create com status="draft"; a transição pra "open" (pedido
      // publicado pra faxineiras verem) é sempre um update separado.
      await updateDoc(doc(db, "orders", docRef.id), { status: "open", updated_at: serverTimestamp() });

      setCardId(selectedCardId);
      router.replace({
        pathname: "/(client)/criar-pedido/confirmacao",
        params: { orderId: docRef.id, total: price.netTotalClient.toFixed(2), serviceType, size, scheduledDate, scheduledTime },
      });
      reset();
    } catch {
      setError("Não foi possível confirmar o pedido. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WizardShell step={8} footerLabel="Confirmar pedido" onFooterPress={handleConfirm} footerDisabled={!selectedCardId} footerLoading={loading}>
      <Text style={styles.title}>Escolha como pagar</Text>
      <Text style={styles.sectionLabel}>Cartões salvos</Text>

      <View style={{ gap: space.m }}>
        {cards.map((c) => (
          <View key={c.card_id}>
            <Card state={selectedCardId === c.card_id ? "selected" : "normal"} onPress={() => setSelectedCardId(c.card_id)}>
              <View style={styles.row}>
                <CardBrandBadge brand={c.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardNumber}>•••• {c.last_four}</Text>
                  <Text style={styles.cardHolder}>{c.holder_name}</Text>
                </View>
                {selectedCardId === c.card_id && <Icon name="check-circle" size={20} color={C.purplePrimary} />}
              </View>
            </Card>
          </View>
        ))}
      </View>

      <Pressable onPress={() => router.push("/(client)/criar-pedido/novo-cartao")}>
        <Text style={styles.addLink}>+ Adicionar novo cartão</Text>
      </Pressable>

      <View style={styles.warningBox}>
        <Icon name="info" size={16} color={C.warning} />
        <Text style={styles.warningText}>Pagamento será feito na véspera do serviço. Nada é cobrado agora.</Text>
      </View>

      {error && (
        <View style={{ marginTop: space.l }}>
          <Alert variant="error">{error}</Alert>
        </View>
      )}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  sectionLabel: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum, marginBottom: space.m },
  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  cardNumber: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  cardHolder: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  addLink: { fontFamily: font.medium, fontSize: font.body, color: C.purplePrimary, marginTop: space.l },
  warningBox: {
    flexDirection: "row",
    gap: space.s,
    alignItems: "flex-start",
    backgroundColor: C.warningBg,
    borderRadius: 8,
    padding: space.m,
    marginTop: space.xl,
  },
  warningText: { flex: 1, fontFamily: font.regular, fontSize: font.labelSm, color: C.warningDark, lineHeight: 18 },
});
