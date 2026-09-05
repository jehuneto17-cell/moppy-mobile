# Estado do Projeto — Moppy (view do moppy-mobile)

**Este arquivo só lista as pendências deste repo.** Estado completo, histórico e documentação do produto (specs, arquitetura, banco de dados, gates) ficam em `docs/fabrica/ESTADO.md` no repo [moppy-admin](https://github.com/jehuneto17-cell/moppy-admin) — é a cópia única, atualize lá quando mudar algo de escopo geral.

## Etapa atual

Etapa 8 — Implementação, Bloco 9 (Contas Reais) em andamento.

## Pendências deste repo (moppy-mobile)

- [x] Cloudinary real — implementado e testado em 2026-09-04 (ver ESTADO.md do admin)
- [x] Firebase real — `.env.local` já aponta pro projeto real `moppy-4ae68` com `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false` (confirmado em `src/services/firebase.ts`); falta só testar login + chamada autenticada ponta a ponta pela UI
- [x] EAS Build — `eas.json` com perfil `development` (dev client, apk) e `production` (app-bundle, autoIncrement) + `submit`. Primeiro APK de dev gerado e testado num emulador real (ver ESTADO.md do admin, 2026-09-05). Falta gerar o primeiro `.aab` de produção de verdade (`eas build --profile production`) — ainda não rodado.

## Não é daqui

Firebase Blaze, Asaas real, deploy Vercel → repo moppy-admin.

---
Atualize este arquivo (marcar `[x]`) quando resolver algum item acima.
