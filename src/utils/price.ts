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

// Taxa Asaas: R$0,49 fixo + 1,99% do subtotal — valor atual conferido direto no
// formulário "Criar cobrança" do painel Asaas em 2026-09-13 ("Taxa de 1,99% sobre
// o valor da cobrança + R$0,49") e validado com uma simulação real de R$100 →
// líquido R$97,52. PAYMENT-FLOW.md secão 3.3 ainda cita 3%, desatualizado.
// Cliente paga metade dessa taxa ("taxa de processamento"), a outra metade sai do repasse da faxineira.
export function computeOrderPrice(sizeId: string, addonIds: string[], urgencyTier: string) {
  const basePrice = SIZE_BASE_PRICE[sizeId] ?? 0;
  const extrasPrice = addonIds.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
  const urgencyFee = URGENCY_FEE[urgencyTier] ?? 0;
  const subtotal = basePrice + extrasPrice;
  const grossTotal = subtotal + urgencyFee;
  const asaasFee = 0.49 + grossTotal * 0.0199;
  const clientFeeShare = asaasFee / 2;
  const netTotalClient = grossTotal + clientFeeShare;

  return { basePrice, extrasPrice, urgencyFee, subtotal, grossTotal, asaasFee, clientFeeShare, netTotalClient };
}

// Comissão Moppy 15% + metade da taxa Asaas (a outra metade é a "taxa de processamento" do cliente).
// Espelha computeSplit() do moppy-admin (lib/split.ts) — tem que dar o MESMO número, senão a
// faxineira vê um líquido aqui e recebe outro na carteira. Comissão incide sobre o subtotal;
// a taxa do Asaas incide sobre o que passou no cartão (subtotal + metade da taxa), não sobre o subtotal.
export function computeCleanerEarnings(subtotal: number) {
  const commission = subtotal * 0.15;
  const grossCharged = subtotal + (0.49 + subtotal * 0.0199) / 2;
  const asaasFee = 0.49 + grossCharged * 0.0199;
  const cleanerFeeShare = asaasFee / 2;
  const cleanerNet = subtotal - commission - cleanerFeeShare;

  return { commission, cleanerFeeShare, cleanerNet };
}
