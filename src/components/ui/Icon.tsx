import { ColorValue } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// Ícones prontos do pacote @expo/vector-icons (Feather + MaterialCommunityIcons
// pros que a Feather não tem), no lugar dos paths desenhados a mão que ficavam
// feios em produção.
const MCI_NAMES = {
  hand: "hand-front-right",
  cleaning: "broom",
  "heavy-clean": "spray-bottle",
  iron: "iron",
  star: "star", // sólida — a da Feather é só contorno, não serve pra estrela de avaliação preenchida
} as const;

const FEATHER_NAMES = [
  "check",
  "x",
  "chevron-down",
  "chevron-right",
  "chevron-left",
  "plus",
  "search",
  "home",
  "message-circle",
  "list",
  "settings",
  "log-out",
  "user",
  "camera",
  "alert-circle",
  "info",
  "check-circle",
  "alert-triangle",
  "image",
  "mail",
  "lock",
  "calendar",
  "credit-card",
  "eye",
  "eye-off",
  "map-pin",
  "send",
  "bell",
] as const;

export type IconName = (typeof FEATHER_NAMES)[number] | keyof typeof MCI_NAMES;

export function Icon({
  name,
  size = 20,
  color = "#000",
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
  fill?: ColorValue;
}) {
  if (name in MCI_NAMES) {
    return <MaterialCommunityIcons name={MCI_NAMES[name as keyof typeof MCI_NAMES]} size={size} color={color as string} />;
  }
  return <Feather name={name as (typeof FEATHER_NAMES)[number]} size={size} color={color as string} />;
}
