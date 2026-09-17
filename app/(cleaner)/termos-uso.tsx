import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { C, font, space } from "@/src/theme";

export default function TermosUsoScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Termos e Privacidade</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.xxl }}>
        <Text style={styles.heading}>Termos de Uso</Text>
        <Text style={styles.body}>
          Como faxineira parceira do Moppy, você presta serviços de forma autônoma, definindo sua disponibilidade e raio de atuação. O Moppy retém uma
          comissão de 15% sobre o valor de cada serviço concluído.
        </Text>

        <Text style={styles.heading}>Privacidade</Text>
        <Text style={styles.body}>
          Seus dados de cadastro e documentos são usados apenas para verificação de identidade e segurança da plataforma, conforme a LGPD.
        </Text>

        <Pressable onPress={() => Linking.openURL("https://moppy-admin.vercel.app/privacidade")}>
          <Text style={styles.link}>Ver políticas completas</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  header: { paddingHorizontal: space.xxl, paddingTop: space.xxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  heading: { fontFamily: font.medium, fontSize: font.body, color: "#6B7280", marginTop: space.l, marginBottom: space.s },
  body: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, lineHeight: 22 },
  link: { fontFamily: font.medium, fontSize: font.body, color: C.purplePrimary, marginTop: space.l },
});
