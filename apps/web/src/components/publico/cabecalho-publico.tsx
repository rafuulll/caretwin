import Link from "next/link"
import { Logo } from "@/components/app/logo"
import { publico } from "@/content/publico"

/** O topo das duas páginas abertas: a marca, o aviso de demonstração e a saída. */
export function CabecalhoPublico() {
  return (
    <header className="border-b border-hairline bg-surface">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label={publico.voltar}>
          <Logo />
        </Link>
        <Link href="/" className="text-sm text-muted underline-offset-4 hover:underline">
          {publico.voltar}
        </Link>
      </div>
      <p role="note" className="border-t border-hairline bg-elevated px-4 py-2 text-center text-sm text-ink sm:px-6">
        {publico.faixa}
      </p>
    </header>
  )
}

export function MensagemPublica({
  titulo,
  corpo,
  acao,
}: {
  titulo: string
  corpo: string
  acao?: { texto: string; aoClicar: () => void }
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center" role="status">
      <h1 className="text-xl text-ink">{titulo}</h1>
      <p className="mt-3 text-muted">{corpo}</p>
      {acao && (
        <button
          type="button"
          onClick={acao.aoClicar}
          className="mt-6 rounded-ds border border-hairline bg-surface px-4 py-2 text-sm text-ink"
        >
          {acao.texto}
        </button>
      )}
    </div>
  )
}
