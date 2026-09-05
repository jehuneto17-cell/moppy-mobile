// Tokens do Moppy Design System (fonte: Claude Design handoff) — não duplicar valores em telas, importar daqui.
export const C = {
  purplePrimary: "#A78BFA",
  purpleDark: "#9368F7",
  purpleLight: "#E9D5FF",
  purpleVeryDark: "#6B21A8",
  purpleStrong: "#7C3AED", // roxo usado no handoff pra ícones/badges/links/timer — mais forte que purplePrimary
  white: "#FFFFFF",
  surface: "#F9FAFB",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  textSecondary: "#9CA3AF",
  textPrimary: "#374151",
  textMaximum: "#1F2937",
  success: "#10B981",
  successBg: "#D1FAE5",
  successDark: "#065F46",
  error: "#EF4444",
  errorDark: "#DC2626",
  errorBg: "#FEE2E2",
  errorDarkest: "#7F1D1D",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  warningDark: "#92400E",
  info: "#3B82F6",
  infoBg: "#DBEAFE",
  infoDark: "#1E40AF",
};

// RN ignora fontWeight quando fontFamily é customizada (sobretudo Android) —
// usar sempre o nome exato da família por peso, nunca fontWeight solto.
export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  bold: "Inter_700Bold",
  display: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  bodyLg: 16,
  body: 14,
  bodySm: 12,
  label: 14,
  labelSm: 12,
  caption: 11,
};

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48 };

export const radius = { s: 4, m: 6, l: 8, xl: 12, pill: 999, circle: 9999 };

export const shadowCard = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
};

export const shadowModal = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.15,
  shadowRadius: 25,
  elevation: 10,
};
