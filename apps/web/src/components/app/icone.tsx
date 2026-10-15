import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BatteryLow,
  BatteryMedium,
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleQuestionMark,
  Clock,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Footprints,
  HeartPulse,
  Hourglass,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Palette,
  PenLine,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings,
  Sunrise,
  Trash2,
  TriangleAlert,
  User,
  Users,
  Watch,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react"

/**
 * O único ponto do app que traduz "nome de ícone" em componente.
 *
 * O `site.ts` guarda apenas a string (`icone: "users"`). Assim a copy não
 * precisa importar nada e trocar o ícone de um item de menu é editar uma
 * palavra. Ícone novo? Importe do lucide e acrescente uma linha aqui.
 */
const ICONES = {
  // O menu, na ordem do dia.
  painel: LayoutDashboard,
  sono: Moon,
  batimentos: HeartPulse,
  alertas: Bell,
  familia: Users,
  settings: Settings,
  // O que a pulseira conta e o estado dela.
  passos: Footprints,
  pulseira: Watch,
  bateria: BatteryMedium,
  "bateria-baixa": BatteryLow,
  sincronizar: RefreshCw,
  acordou: Sunrise,
  // Como um valor fica em relação ao normal. Sempre ao lado de um texto.
  abaixo: ArrowDown,
  acima: ArrowUp,
  dentro: CircleCheck,
  aprendendo: Hourglass,
  // Ações e peças de interface.
  escrever: PenLine,
  lido: CheckCheck,
  info: Info,
  menu: Menu,
  fechar: X,
  sair: LogOut,
  mais: Plus,
  anterior: ChevronLeft,
  proximo: ChevronRight,
  ajuda: CircleQuestionMark,
  relogio: Clock,
  usuario: User,
  email: Mail,
  remover: Trash2,
  check: Check,
  "seta-direita": ArrowRight,
  "seta-esquerda": ArrowLeft,
  "link-externo": ExternalLink,
  copiar: Copy,
  alerta: TriangleAlert,
  paleta: Palette,
  dados: Database,
  restaurar: RotateCcw,
  mostrar: Eye,
  esconder: EyeOff,
} satisfies Record<string, LucideIcon>

export type NomeIcone = keyof typeof ICONES

type PropsIcone = LucideProps & {
  /** Chave do mapa acima. Nome desconhecido cai num círculo neutro em vez de sumir. */
  nome: string
}

export function Icone({ nome, strokeWidth = 1.75, ...resto }: PropsIcone) {
  const Glifo: LucideIcon = ICONES[nome as NomeIcone] ?? Circle

  // Decorativo por padrão: todo lugar que usa ícone aqui já tem rótulo em texto
  // ou `aria-label` no botão. Passe `aria-hidden={false}` se precisar do contrário.
  return <Glifo aria-hidden="true" strokeWidth={strokeWidth} {...resto} />
}
