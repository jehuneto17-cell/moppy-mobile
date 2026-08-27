import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/src/hooks/useAuth";
import { C, radius, spacing } from "@/src/theme";

type Mode = "entrar" | "cadastrar";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (mode === "cadastrar" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "entrar") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.replace("/");
    } catch (e: any) {
      setError(mapAuthError(e?.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Moppy</Text>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, mode === "entrar" && styles.tabActive]}
          onPress={() => setMode("entrar")}
        >
          <Text style={[styles.tabText, mode === "entrar" && styles.tabTextActive]}>
            Entrar
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, mode === "cadastrar" && styles.tabActive]}
          onPress={() => setMode("cadastrar")}
        >
          <Text style={[styles.tabText, mode === "cadastrar" && styles.tabTextActive]}>
            Cadastrar
          </Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={C.textoSecundario}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder="Senha"
        placeholderTextColor={C.textoSecundario}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {mode === "cadastrar" && (
        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor={C.textoSecundario}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>{mode === "entrar" ? "Entrar" : "Cadastrar"}</Text>
        )}
      </Pressable>
    </View>
  );
}

function mapAuthError(code?: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado.";
    case "auth/weak-password":
      return "A senha precisa ter no mínimo 6 caracteres.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    default:
      return "Não foi possível continuar. Tente novamente.";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.fundo,
    padding: spacing.pagina,
    justifyContent: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "700",
    color: C.primary,
    textAlign: "center",
    marginBottom: spacing.pagina,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: C.superficie,
    borderRadius: radius.botao,
    marginBottom: spacing.pagina,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.botao,
  },
  tabActive: {
    backgroundColor: C.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: C.textoPrimario,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: C.borda,
    borderRadius: radius.input,
    padding: 12,
    fontSize: 14,
    color: C.textoMaximo,
    marginBottom: spacing.gap,
  },
  inputError: {
    borderColor: C.erro,
  },
  errorText: {
    color: C.erro,
    fontSize: 12,
    marginBottom: spacing.gap,
  },
  button: {
    backgroundColor: C.primary,
    borderRadius: radius.botao,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.base,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
