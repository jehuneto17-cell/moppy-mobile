import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Icon } from "@/src/components/ui/Icon";
import { Input } from "@/src/components/ui/Input";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { useAuth } from "@/src/hooks/useAuth";
import { C, font, radius, space } from "@/src/theme";

type Mode = "login" | "cadastro";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit() {
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
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

  const submitDisabled = !isLogin && !agreeTerms;

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Moppy</Text>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, isLogin && styles.tabActive]} onPress={() => setMode("login")}>
          <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Entrar</Text>
        </Pressable>
        <Pressable style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setMode("cadastro")}>
          <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Cadastrar</Text>
        </Pressable>
      </View>

      <View style={{ gap: space.m }}>
        <LabeledInput
          label="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
        />

        <View style={{ gap: 4 }}>
          <Text style={styles.label}>Senha</Text>
          <View>
            <Input
              secureTextEntry={!showPassword}
              placeholder="Digite sua senha"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setError(null);
              }}
              state={error ? "error" : "normal"}
              style={{ paddingRight: 40 }}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.eyeButton}>
              <Icon name={showPassword ? "eye" : "eye-off"} size={18} color={C.textSecondary} />
            </Pressable>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {isLogin && (
            <Pressable>
              <Text style={styles.forgotLink}>Esqueci minha senha</Text>
            </Pressable>
          )}
        </View>

        {!isLogin && (
          <>
            <LabeledInput
              label="Confirmar senha"
              secureTextEntry
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Checkbox checked={agreeTerms} onChange={setAgreeTerms} label="Concordo com os Termos" />
          </>
        )}
      </View>

      <View style={{ marginTop: space.xxl }}>
        <Button variant="primary" size="large" disabled={submitDisabled} loading={loading} onPress={handleSubmit} style={{ width: "100%" }}>
          {isLogin ? "Entrar" : "Cadastrar"}
        </Button>
      </View>
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
    backgroundColor: C.white,
    padding: space.xxl,
    justifyContent: "center",
  },
  logo: {
    fontFamily: font.bold,
    fontSize: font.h2,
    color: C.purplePrimary,
    textAlign: "center",
    marginTop: space.xxl,
    marginBottom: space.xxxl,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: radius.l,
    padding: 4,
    gap: 4,
    marginBottom: space.xxl,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.m,
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    fontFamily: font.medium,
    fontSize: font.body,
    color: C.textSecondary,
  },
  tabTextActive: {
    color: C.purplePrimary,
  },
  label: {
    fontFamily: font.medium,
    fontSize: font.label,
    color: C.textMaximum,
  },
  eyeButton: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  errorText: {
    fontFamily: font.regular,
    fontSize: font.bodySm,
    color: C.error,
  },
  forgotLink: {
    fontFamily: font.regular,
    fontSize: font.bodySm,
    color: C.purplePrimary,
    textAlign: "right",
    marginTop: 4,
  },
});
