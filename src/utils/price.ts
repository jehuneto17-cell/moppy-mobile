export const SIZE_BASE_PRICE: Record<string, number> = {
  studio: 90,
  "1q": 90,
  "2q": 120,
  "3q": 150,
  "4q+": 180,
};

export const ADDONS = [
  { id: "banheiro", label: "1 banheiro extra", price: 15 },
  { id: "externa", label: "Área externa (varanda/quintal)", price: 25 },
  { id: "geladeira", label: "Limpeza de geladeira", price: 25 },
  { id: "produtos", label: "Faxineira leva produtos de limpeza", price: 30 },
];

export const URGENCY_FEE: Record<string, number> = {
  normal: 0,
  baixa: 3.5,
  alta: 5.5,
};

// Taxa Asaas: R$0,49 fixo + 3% do subtotal (PAYMENT-FLOW.md secão 3.3).
// Cliente paga metade dessa taxa ("taxa de processamento"), a outra metade sai do repasse da faxineira.
export function computeOrderPrice(sizeId: string, addonIds: string[], urgencyTier: string) {
  const basePrice = SIZE_BASE_PRICE[sizeId] ?? 0;
  const extrasPrice = addonIds.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
  const urgencyFee = URGENCY_FEE[urgencyTier] ?? 0;
  const subtotal = basePrice + extrasPrice;
  const grossTotal = subtotal + urgencyFee;
  const asaasFee = 0.49 + grossTotal * 0.03;
  const clientFeeShare = asaasFee / 2;
  const netTotalClient = grossTotal + clientFeeShare;

  return { basePrice, extrasPrice, urgencyFee, subtotal, grossTotal, asaasFee, clientFeeShare, netTotalClient };
}

// Comissão Moppy 15% + metade da taxa Asaas (a outra metade é a "taxa de processamento" do cliente).
// Fórmula e exemplo exatos vêm de F07 - Detalhe do Pedido: base R$90 -> comissão R$13,50 -> taxa R$1,60 -> líquido R$74,90.
export function computeCleanerEarnings(grossTotal: number) {
  const commission = grossTotal * 0.15;
  const asaasFee = 0.49 + grossTotal * 0.03;
  const cleanerFeeShare = asaasFee / 2;
  const cleanerNet = grossTotal - commission - cleanerFeeShare;

  return { commission, cleanerFeeShare, cleanerNet };
}
