// Mock do Asaas (mesma interface de shared/mocks/asaas.ts — Metro não resolve workspaces
// sem config extra de monorepo, então mobile mantém sua própria cópia até o Bloco 9).
export async function tokenizeCard(card: { number: string; holderName: string; expiryMonth: number; expiryYear: number; cvv: string }) {
  return {
    token: `card_mock_${Math.random().toString(36).slice(2, 10)}`,
    lastFour: card.number.slice(-4),
    brand: "visa",
  };
}
