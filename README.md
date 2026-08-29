# Moppy Mobile

App mobile (Expo / React Native) do Moppy — marketplace de faxina, telas de Cliente e Faxineira. Repositório irmão: [`moppy-admin`](https://github.com/jehuneto17-cell/moppy-admin) (painel admin + config/regras do Firebase + documentação completa do projeto em `docs/fabrica/`), mesmo projeto Firebase.

## Estrutura

```
app/        # Rotas (Expo Router)
src/         # Componentes, hooks, serviços
shared/      # Tipos e utils compartilhados (cópia local, também existe em moppy-admin)
```

## Rodando local

```bash
npm install
npm run web       # testar no navegador
npm run android   # ou npm run ios
```

Precisa de `.env.local` (não commitado) com as chaves do Firebase — ver `.env.example`.

## Deploy

Play Store (EAS Build) — configurar quando chegar nessa etapa.

## Documentação do projeto

Specs, arquitetura, estado e regras de negócio ficam centralizados em `docs/fabrica/` no repositório [`moppy-admin`](https://github.com/jehuneto17-cell/moppy-admin), pra evitar 2 cópias divergindo.
