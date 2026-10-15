import type { Metadata } from "next"
import { CabecalhoConfiguracoes } from "@/components/app/configuracoes/cabecalho"
import { DadosExemplo } from "@/components/app/configuracoes/dados-exemplo"
import { Perfil } from "@/components/app/configuracoes/perfil"
import { marca, sistema } from "@/content/site"

const copy = sistema.configuracoes

export const metadata: Metadata = {
  title: `${copy.titulo} · ${marca.nome}`,
}

/**
 * A página é servidor: quem precisa de estado (os dados e o perfil) é cada
 * bloco. Assim o JavaScript que chega ao navegador é só o das duas ilhas, não
 * o da tela inteira.
 */
export default function PaginaConfiguracoes() {
  return (
    <>
      <CabecalhoConfiguracoes />

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <DadosExemplo />
        <Perfil />
      </div>
    </>
  )
}
