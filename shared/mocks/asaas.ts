// Mock do Asaas — mesma interface da API real (ver ARCHITECTURE.md fluxo A/B).
// Troca para SDK real na Etapa 9 (Bloco 9.3), sem mudar quem chama essas funções.

function fakeId(prefix: string) {
  return `${prefix}_mock_${Math.random().toString(36).slice(2, 10)}`;
}

export async function tokenizeCard(card: {
  number: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}) {
  return {
    token: fakeId("card"),
    lastFour: card.number.slice(-4),
    brand: "visa",
  };
}

export async function createCustomer(customer: { name: string; cpf: string; email: string }) {
  return { customerId: fakeId("cust") };
}

export async function preauthorize(params: { customerId: string; cardToken: string; amount: number }) {
  // Token especial pra testar o caminho de falha/retry sem precisar de um Asaas real (ver PAYMENT-IMPLEMENTATION.md 5.2).
  if (params.cardToken === "card_mock_declined") {
    return { preauthId: null, status: "preauth_failed" as const, error: "card_declined" };
  }
  return { preauthId: fakeId("preauth"), status: "preauth_success" as const, error: null as string | null };
}

export async function capturePayment(params: { preauthId: string; amount: number }) {
  return { captureId: fakeId("capture"), status: "capture_success" as const };
}

export async function refundPayment(params: { captureId: string; amount: number }) {
  return { refundId: fakeId("refund"), status: "refund_success" as const };
}

export async function createTransfer(params: { subaccountId: string; amount: number }) {
  return { transferId: fakeId("transfer"), status: "transfer_success" as const };
}
