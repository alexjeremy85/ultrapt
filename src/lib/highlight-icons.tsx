import {
  DumbbellIcon,
  TrophyIcon,
  TargetIcon,
  ClipboardIcon,
  ChartIcon,
  HeartIcon,
  AppleIcon,
  PhoneIcon,
  TimerIcon,
  CalendarIcon,
  BadgeIcon,
  SparkleIcon,
} from "@/components/icons";

export type HighlightIconName =
  | "dumbbell"
  | "trophy"
  | "target"
  | "clipboard"
  | "chart"
  | "heart"
  | "apple"
  | "phone"
  | "timer"
  | "calendar"
  | "badge"
  | "sparkle";

export const HIGHLIGHT_ICONS: Array<{ name: HighlightIconName; label: string }> = [
  { name: "dumbbell", label: "Treino" },
  { name: "trophy", label: "Resultados" },
  { name: "target", label: "Foco" },
  { name: "clipboard", label: "Programa" },
  { name: "chart", label: "Progresso" },
  { name: "heart", label: "Saúde" },
  { name: "apple", label: "Nutrição" },
  { name: "phone", label: "App" },
  { name: "timer", label: "Tempo" },
  { name: "calendar", label: "Frequência" },
  { name: "badge", label: "Certificação" },
  { name: "sparkle", label: "Diferencial" },
];

export function HighlightIcon({
  name,
  className,
}: {
  name: string | undefined | null;
  className?: string;
}) {
  switch (name) {
    case "dumbbell":
      return <DumbbellIcon className={className} />;
    case "trophy":
      return <TrophyIcon className={className} />;
    case "target":
      return <TargetIcon className={className} />;
    case "clipboard":
      return <ClipboardIcon className={className} />;
    case "chart":
      return <ChartIcon className={className} />;
    case "heart":
      return <HeartIcon className={className} />;
    case "apple":
      return <AppleIcon className={className} />;
    case "phone":
      return <PhoneIcon className={className} />;
    case "timer":
      return <TimerIcon className={className} />;
    case "calendar":
      return <CalendarIcon className={className} />;
    case "badge":
      return <BadgeIcon className={className} />;
    case "sparkle":
    default:
      return <SparkleIcon className={className} />;
  }
}
