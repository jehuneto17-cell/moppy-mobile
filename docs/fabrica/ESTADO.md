# Estado do Projeto — Moppy (view do moppy-mobile)

**Este arquivo só lista as pendências deste repo.** Estado completo, histórico e documentação do produto (specs, arquitetura, banco de dados, gates) ficam em `docs/fabrica/ESTADO.md` no repo [moppy-admin](https://github.com/jehuneto17-cell/moppy-admin) — é a cópia única, atualize lá quando mudar algo de escopo geral.

## Etapa atual

Etapa 8 — Implementação, Bloco 9 (Contas Reais) em andamento.

## Pendências deste repo (moppy-mobile)

- [ ] Cloudinary real — trocar mock (`shared/mocks/cloudinary.ts`) por conta real. Usado em: foto de chegada, foto de disputa, documentos do cadastro da faxineira (`(cleaner-onboarding)/documentos.tsx`)
- [ ] EAS Build — configurar `eas.json`, gerar primeiro `.apk`/`.aab` pra testar/publicar na Play Store

## Não é daqui

Firebase Blaze, Asaas real, deploy Vercel → repo moppy-admin.

---
Atualize este arquivo (marcar `[x]`) quando resolver algum item acima.
