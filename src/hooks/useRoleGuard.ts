import { usePathname } from "expo-router";

import { useAuth } from "./useAuth";
import { useCleanerProfile } from "./useCleanerProfile";
import { useUserProfile } from "./useUserProfile";

// Espelha a lógica de redirecionamento de app/index.tsx, mas roda dentro dos
// próprios grupos (client)/(cleaner) — sem isso, quem chega direto numa URL
// dessas telas (link salvo, aba antiga, digitou o endereço) nunca passa pela
// checagem de app/index.tsx e pode acabar numa tela de um papel que a conta
// não tem completo (ex: virou "cleaner" no role-choice mas nunca terminou o
// onboarding, e as telas de faxineira tentam ler/escrever um documento que
// não existe).
export function useRoleGuard(required: "client" | "cleaner") {
  const pathname = usePathname();
  const { user, initializing } = useAuth();
  const { profile: userProfile, role, loading: profileLoading } = useUserProfile(user?.uid ?? null);
  const isCleaner = !!role?.includes("cleaner");
  const needsCleanerProfile = required === "cleaner" && isCleaner;
  const { profile: cleanerProfile, loading: cleanerLoading } = useCleanerProfile(needsCleanerProfile ? (user?.uid ?? null) : null);

  // /pedido/{id} existe duplicado dentro de (client) e (cleaner) — mesma URL
  // final pros dois grupos (grupo com parênteses não entra na URL). Numa
  // navegação direta/reload, o build resolve pra um dos dois de forma meio
  // arbitrária, então um cliente de verdade pode cair na versão "cleaner" da
  // rota (ou vice-versa) mesmo sendo exatamente o papel certo pro pedido em
  // questão. Não faz sentido barrar por "papel errado" aqui — quem realmente
  // não deveria ver o pedido já é barrado pelas regras do Firestore.
  const isSharedOrderRoute = pathname.startsWith("/pedido/");

  if (initializing || (user && profileLoading) || (needsCleanerProfile && cleanerLoading)) {
    return { ready: false as const, redirect: null };
  }

  if (!user) return { ready: false as const, redirect: "/(auth)/login" as const };
  if (!role || role.length === 0) return { ready: false as const, redirect: "/(role-choice)" as const };

  console.log("[DEBUG guard] " + JSON.stringify({ required, pathname, isSharedOrderRoute, isCleaner, role }));

  if (required === "cleaner") {
    if (!isCleaner) return isSharedOrderRoute ? { ready: true as const, redirect: null } : { ready: false as const, redirect: "/" as const };
    if (!cleanerProfile) return { ready: false as const, redirect: "/(cleaner-onboarding)/documentos" as const };
    if (cleanerProfile.approval_status !== "approved") return { ready: false as const, redirect: "/(cleaner-onboarding)/aguardando" as const };
    return { ready: true as const, redirect: null };
  }

  if (isCleaner) return isSharedOrderRoute ? { ready: true as const, redirect: null } : { ready: false as const, redirect: "/" as const };
  if (!userProfile?.client_terms_accepted) return { ready: false as const, redirect: "/(client-onboarding)/endereco" as const };
  return { ready: true as const, redirect: null };
}
