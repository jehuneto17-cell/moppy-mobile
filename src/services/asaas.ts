import { auth } from "./firebase";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_ASAAS === "true";

// Tokenização real: o número/CVV vão pro backend (admin), que tem a API Key do
// Asaas — nunca pode ficar no bundle do mobile (PAYMENT-IMPLEMENTATION.md §6).
// `cpf`/`phone` só são obrigatórios no primeiro cartão (onboarding); num cartão
// adicional depois, o backend já tem os dois salvos em `users/{uid}`.
export async function tokenizeCard(card: {
  number: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cpf?: string;
  phone?: string;
}) {
  if (USE_MOCK) {
    return {
      token: `card_mock_${Math.random().toString(36).slice(2, 10)}`,
      lastFour: card.number.slice(-4),
      brand: "visa",
    };
  }

  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Usuário não autenticado");

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cards/tokenize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({
      number: card.number,
      holderName: card.holderName,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: card.cvv,
      cpf: card.cpf,
      phone: card.phone,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Falha ao cadastrar cartão");
  return { token: data.token as string, lastFour: data.lastFour as string, brand: data.brand as string };
}
