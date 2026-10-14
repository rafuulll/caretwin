/*
  Prévia da tela Hoje, desenhada em HTML com os mesmos tokens do app, sem imagem.
  Ela é decoração (aria-hidden): o texto da dobra já diz o que o app faz.
*/

import { site } from "@/content/site";
import { Icone } from "@/components/ui/icone";
import { Simbolo } from "@/components/marca/logo";

export function PreviaApp() {
  const p = site.previa;
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[400px] lg:[transform:perspective(1200px)_rotateX(6deg)_rotateY(-8deg)] lg:origin-top">
      <div className="overflow-hidden rounded-[28px] border border-borda-forte bg-gradient-to-b from-superficie to-fundo shadow-ct-xl">
        <div className="flex items-center gap-2 border-b border-borda bg-superficie px-5 py-3.5">
          <Simbolo tamanho={22} className="text-primaria" />
          <span className="text-[0.95rem] font-bold">{p.saudacao}</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-info-fundo px-2.5 py-1 text-[0.8rem] font-bold text-info">
            <Icone nome="pessoa" tamanho={14} />
            {p.pessoa}
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between rounded-cartao border border-borda bg-superficie px-4 py-2.5 text-[0.82rem] text-tinta-suave">
            <span className="inline-flex items-center gap-1.5">
              <Icone nome="pulseira" tamanho={15} />
              {p.sincronizou}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icone nome="bateriaMedia" tamanho={15} />
              {p.bateria}
            </span>
          </div>

          <div className="rounded-cartao border border-borda bg-superficie p-4 shadow-ct-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold text-tinta-suave">
                <Icone nome="passos" tamanho={15} />
                {p.passosRotulo}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-bom-fundo px-2 py-0.5 text-[0.72rem] font-bold text-bom">
                <Icone nome="dentro" tamanho={12} />
                {p.situacao}
              </span>
            </div>
            <p className="mt-1 text-[2.4rem] font-bold leading-none tracking-tight">{p.passosValor}</p>
            <div className="relative mt-3 h-3 rounded-full bg-suave">
              <div className="absolute inset-y-0 left-[48%] w-[22%] rounded-full bg-[var(--ct-grafico-faixa)] ring-1 ring-primaria/30" />
              <div className="absolute -top-1 left-[55%] h-5 w-1 rounded-full bg-primaria" />
            </div>
            <p className="mt-2 text-[0.78rem] text-tinta-suave">{p.passosFaixa}</p>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-cartao border border-borda bg-superficie p-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold text-tinta-suave">
                <Icone nome="sono" tamanho={15} />
                {p.sonoRotulo}
              </span>
              <p className="mt-1 text-[1.5rem] font-bold leading-none">{p.sonoValor}</p>
              <p className="mt-1.5 text-[0.78rem] text-tinta-suave">{p.sonoFaixa}</p>
            </div>
            <svg width="96" height="44" viewBox="0 0 96 44" className="text-primaria">
              {[30, 26, 8, 4, 3, 2, 6, 2, 3, 2, 4, 3, 9, 24, 32, 28].map((h, i) => (
                <rect key={i} x={i * 6} y={44 - h} width="4" height={h} rx="1.5" fill="currentColor" opacity={h < 10 ? 0.35 : 0.8} />
              ))}
            </svg>
          </div>

          <div className="rounded-cartao border border-borda bg-info-fundo/60 p-4">
            <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold text-info">
              <Icone nome="ia" tamanho={15} />
              {p.resumoRotulo}
            </span>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed">{p.resumo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
