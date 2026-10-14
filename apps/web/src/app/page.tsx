import { Cabecalho } from "@/components/marketing/cabecalho";
import { Abertura } from "@/components/marketing/abertura";
import { NormalDeCadaUm } from "@/components/marketing/normal-de-cada-um";
import { ComoFunciona } from "@/components/marketing/como-funciona";
import { ExemploAviso } from "@/components/marketing/exemplo-aviso";
import { Beneficios } from "@/components/marketing/beneficios";
import { ChamadaFinal } from "@/components/marketing/chamada-final";
import { Rodape } from "@/components/marketing/rodape";
import { Tour } from "@/components/onboarding/tour";
import { site } from "@/content/site";

/*
  O site do CareTwin, na raiz. Tudo aqui é componente de servidor, sem estado;
  as únicas partes de cliente são o fundo da abertura e o tour da primeira visita.
*/
export default function PaginaInicial() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-campo bg-superficie px-4 py-3 font-bold text-primaria shadow-ct-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {site.pularParaConteudo}
      </a>
      <Cabecalho />
      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <Abertura />
        <NormalDeCadaUm />
        <ComoFunciona />
        <ExemploAviso />
        <Beneficios />
        <ChamadaFinal />
      </main>
      <Rodape />
      <Tour />
    </>
  );
}
