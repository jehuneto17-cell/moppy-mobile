export type CepResult = { street: string; neighborhood: string; city: string; state: string };

// Busca endereço pelo CEP via ViaCEP (gratuito, sem chave). Melhor-esforço: CEP
// inválido, não encontrado, ou API fora do ar simplesmente não preenche nada
// e a tela segue funcionando com preenchimento manual.
export async function lookupCep(cep: string): Promise<CepResult | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.erro) return null;

    return { street: data.logradouro ?? "", neighborhood: data.bairro ?? "", city: data.localidade ?? "", state: data.uf ?? "" };
  } catch {
    return null;
  }
}
