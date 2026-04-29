/**
 * Biblioteca central de icones SVG. Substitui emojis em todo o app
 * pra manter coesao visual com a landing.
 *
 * Padrao:
 * - 24x24 viewBox
 * - stroke-based (currentColor) exceto quando filled faz mais sentido
 * - strokeWidth=2, strokeLinecap=round, strokeLinejoin=round
 * - Tamanho via className (ex: "h-4 w-4")
 */

type IconProps = { className?: string };

function S(props: { className?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      {props.children}
    </svg>
  );
}

/* ---------- Navigation / Generic ---------- */

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </S>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </S>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M20 6L9 17l-5-5" />
    </S>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </S>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M12 5v14M5 12h14" />
    </S>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M15 3h6v6M14 10l7-7" />
      <path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </S>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </S>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </S>
  );
}

/* ---------- Status / Feedback ---------- */

export function AlertIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M12 9v4M12 17h0" />
      <path d="M10.3 3.86a2 2 0 0 1 3.4 0L21.4 17a2 2 0 0 1-1.7 3H4.3a2 2 0 0 1-1.7-3z" />
    </S>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </S>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 18.27l-6.18 3.23L7 14.63 2 9.76l6.91-1L12 2.5z" />
    </svg>
  );
}

/**
 * Avalia em estrelas. As preenchidas pegam `filledClassName` (default: text-accent),
 * as vazias pegam `emptyClassName` (default: text-ink-dim). Tamanho via size.
 */
export function StarRating({
  value,
  total = 5,
  size = "h-4 w-4",
  filledClassName = "text-accent",
  emptyClassName = "text-ink-dim opacity-40",
}: {
  value: number;
  total?: number;
  size?: string;
  filledClassName?: string;
  emptyClassName?: string;
}) {
  const v = Math.max(0, Math.min(total, Math.round(value)));
  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`${v} de ${total} estrelas`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <StarIcon
          key={i}
          className={`${size} ${i < v ? filledClassName : emptyClassName}`}
        />
      ))}
    </div>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M12 3l1.8 4.5L18 9l-4.2 1.5L12 15l-1.8-4.5L6 9l4.2-1.5L12 3z" />
      <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8L16.5 17.5l1.8-.7L19 15z" />
    </S>
  );
}

/* ---------- People / Brand ---------- */

export function UserIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </S>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </S>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </S>
  );
}

export function BadgeIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </S>
  );
}

/* ---------- Communication ---------- */

export function MessageIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </S>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M3 11a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3H7l-4 3z" />
    </S>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18h2" />
    </S>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
    </S>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </S>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h0" />
    </S>
  );
}

export function WhatsappIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z" />
      <path d="M9 10c0 3 2 5 5 5l1.5-1.5L18 14l-1 2c-3 0-7-3-7-7l2-1 .5 2.5L11 11" />
    </S>
  );
}

/* ---------- Documents / Forms ---------- */

export function ClipboardIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </S>
  );
}

export function FileTextIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </S>
  );
}

export function PrinterIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </S>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </S>
  );
}

/* ---------- Money / Commerce ---------- */

export function CardIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h3" />
    </S>
  );
}

export function MoneyIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h0M18 12h0" />
    </S>
  );
}

export function TicketIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" />
      <path d="M13 5v2M13 11v2M13 17v2" />
    </S>
  );
}

export function CalculatorIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h2M12 18h2M16 18h0" />
    </S>
  );
}

/* ---------- Charts / Data ---------- */

export function ChartIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </S>
  );
}

export function TrendingUpIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </S>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </S>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </S>
  );
}

/* ---------- Fitness ---------- */

export function DumbbellIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M3 9v6M5 7v10M9 5v14M15 5v14M19 7v10M21 9v6M9 12h6" />
    </S>
  );
}

export function TimerIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M9 2h6" />
    </S>
  );
}

export function TargetIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </S>
  );
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 1 1-10 0z" />
      <path d="M17 4h3v3a3 3 0 0 1-3 3M7 4H4v3a3 3 0 0 0 3 3" />
    </S>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </S>
  );
}

export function AppleIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M12 7c0-2 1-4 3-4M9 21c-2 0-4-2-5-5-1-3 0-7 3-9 2-1 4 0 5 1 1-1 3-2 5-1 3 2 4 6 3 9-1 3-3 5-5 5-1 0-2-.5-3-.5s-2 .5-3 .5z" />
    </S>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </S>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/* ---------- Settings / Tools ---------- */

export function SettingsIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </S>
  );
}

export function LogOutIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </S>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </S>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </S>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <S className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </S>
  );
}

/* ---------- Brand mark ---------- */

export function Logomark({ className }: IconProps) {
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hype text-black ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M5 8v8M9 5v14M15 5v14M19 8v8M3 11h2M3 13h2M19 11h2M19 13h2"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
