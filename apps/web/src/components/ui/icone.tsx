/*
  Mapa de ícones do CareTwin. Todo ícone do app sai daqui, todos de traço (lucide),
  com o mesmo peso de linha. Por padrão o ícone é decorativo (aria-hidden), porque
  quase sempre há um texto visível do lado; quando ele carrega significado sozinho,
  quem usa passa um "rotulo".
*/

import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BedDouble,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleMinus,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Footprints,
  HandHeart,
  HeartPulse,
  House,
  Info,
  LoaderCircle,
  LogOut,
  Menu,
  MoonStar,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Table2,
  Trash2,
  TriangleAlert,
  Type,
  UserRound,
  Users,
  Watch,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ICONES = {
  hoje: House,
  sono: MoonStar,
  cama: BedDouble,
  batimentos: HeartPulse,
  alertas: Bell,
  configuracoes: Settings,
  passos: Footprints,
  atividade: Activity,
  pulseira: Watch,
  bateriaCheia: BatteryFull,
  bateriaMedia: BatteryMedium,
  bateriaBaixa: BatteryLow,
  sincronizar: RefreshCw,
  sair: LogOut,
  menu: Menu,
  fechar: X,
  ok: Check,
  dentro: CircleCheck,
  abaixo: ArrowDown,
  acima: ArrowUp,
  semDados: CircleMinus,
  seta: ArrowRight,
  voltar: ArrowLeft,
  anterior: ChevronLeft,
  proximo: ChevronRight,
  abrir: ChevronDown,
  mostrar: Eye,
  esconder: EyeOff,
  copiar: Copy,
  externo: ExternalLink,
  info: Info,
  atencao: TriangleAlert,
  ajuda: CircleHelp,
  ia: Sparkles,
  tabela: Table2,
  relogio: Clock,
  calendario: CalendarDays,
  pessoa: UserRound,
  pessoas: Users,
  cuidado: HandHeart,
  mais: Plus,
  editar: Pencil,
  apagar: Trash2,
  restaurar: RotateCcw,
  semInternet: WifiOff,
  carregando: LoaderCircle,
  seguro: ShieldCheck,
  texto: Type,
  claro: Sun,
  escuro: Moon,
} satisfies Record<string, LucideIcon>;

export type NomeIcone = keyof typeof ICONES;

type Props = {
  nome: NomeIcone;
  className?: string;
  /** Texto para leitor de tela quando o ícone carrega significado sozinho. */
  rotulo?: string;
  tamanho?: number;
};

export function Icone({ nome, className, rotulo, tamanho = 20 }: Props) {
  const Componente = ICONES[nome] ?? CircleHelp;
  return (
    <Componente
      width={tamanho}
      height={tamanho}
      strokeWidth={1.75}
      className={cn("shrink-0", className)}
      aria-hidden={rotulo ? undefined : true}
      aria-label={rotulo}
      role={rotulo ? "img" : undefined}
      focusable="false"
    />
  );
}
