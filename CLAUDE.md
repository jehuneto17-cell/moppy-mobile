@AGENTS.md

# CLAUDE.md — Moppy Mobile

Guidelines para Claude trabalhar neste repositório. Este é 1 de 2 repositórios do projeto Moppy — o outro é [`moppy-admin`](https://github.com/jehuneto17-cell/moppy-admin) (Next.js, dono da config/regras do Firebase e de `docs/fabrica/`, a documentação completa do projeto). Os dois apontam pro mesmo projeto Firebase (`moppy-4ae68`).

## Contexto do Projeto

**Nome:** Moppy
**Tipo:** Marketplace de faxina (mobile + web)
**Este repo:** App mobile (Expo/React Native) — telas de Cliente e Faxineira
**Stack:** Expo + TypeScript + Firebase Auth/Firestore + Zustand

## Identidade Visual

```
Logo: Gota d'água branca
Cor Primária: Roxo #A78BFA
Tipografia: Inter
Estilo: Minimalista
```

## Guidelines para Claude

- Ponytail full: código mínimo, reutilizar, stdlib first, sem over-engineering
- TypeScript obrigatório, componentes pequenos e reutilizáveis
- Nunca commitar `.env.local` ou secrets
- Checkout/pagamento sempre via backend (moppy-admin) — nunca expor keys do Asaas no app
- Mudar `firestore.rules`/regras de negócio → mexer no repo `moppy-admin`, não aqui
- Deletar código, mudar dependências, deploy pra produção → confirmar antes

## Documentação do projeto

Specs, arquitetura, banco de dados e estado do projeto ficam em `docs/fabrica/` no repositório [`moppy-admin`](https://github.com/jehuneto17-cell/moppy-admin) — cópia única, não duplicada aqui.
