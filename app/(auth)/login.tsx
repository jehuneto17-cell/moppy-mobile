import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Icon } from "@/src/components/ui/Icon";
import { Input } from "@/src/components/ui/Input";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { useAuth } from "@/src/hooks/useAuth";
import { C, font, radius, space } from "@/src/theme";

WebBrowser.maybeCompleteAuthSession();

type Mode = "login" | "cadastro";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isLogin = mode === "login";

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (googleResponse?.type !== "success") return;

    const idToken = googleResponse.params.id_token;
    setGoogleLoading(true);
    loginWithGoogle(idToken)
      .then(() => router.replace("/"))
      .catch((e: any) => setError(mapAuthError(e?.code)))
      .finally(() => setGoogleLoading(false));
  }, [googleResponse]);

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
      <Image source={require("@/assets/images/logo-full.png")} style={styles.logo} resizeMode="contain" />

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

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        variant="secondary"
        size="large"
        loading={googleLoading}
        disabled={!googleRequest}
        icon={<GoogleLogo size={18} />}
        onPress={() => promptGoogleAsync()}
        style={{ width: "100%" }}
      >
        {isLogin ? "Entrar com o Google" : "Cadastrar com o Google"}
      </Button>
    </View>
  );
}

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <Path
        fill="#FBBC05"
        d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.28a12 12 0 0 0 0 10.8Z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75Z"
      />
    </Svg>
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
    width: 56,
    height: 56,
    alignSelf: "center",
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    marginTop: space.xl,
    marginBottom: space.l,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontFamily: font.regular,
    fontSize: font.bodySm,
    color: C.textSecondary,
  },
});
