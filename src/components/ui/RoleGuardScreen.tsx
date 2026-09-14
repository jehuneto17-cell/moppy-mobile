import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useRoleGuard } from "@/src/hooks/useRoleGuard";
import { C } from "@/src/theme";

// Usado dentro de cada tela (não no _layout.tsx do grupo) — colocar no layout
// protegeria também pedido/[id], que existe duplicado em (client) e (cleaner)
// pra mesma URL final (grupo com parênteses não entra na URL). Numa navegação
// direta, usePathname() ainda não reflete a URL real no primeiro render desse
// caso (fica "/" até o deep-link terminar de resolver), então um guard no
// layout redirecionava um cliente de verdade tentando ver o próprio pedido.
// pedido/[id] fica de fora disso de propósito — quem não pode ver aquele
// pedido já é barrado pelas regras do Firestore.
export function RoleGuardScreen({ required, children }: { required: "client" | "cleaner"; children: React.ReactNode }) {
  const { ready, redirect } = useRoleGuard(required);

  if (!ready) {
    if (redirect) return <Redirect href={redirect} />;
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.white }}>
        <ActivityIndicator color={C.purplePrimary} />
      </View>
    );
  }

  return <>{children}</>;
}
