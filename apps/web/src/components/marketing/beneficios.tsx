import { site } from "@/content/site";
import { Icone, type NomeIcone } from "@/components/ui/icone";

const ICONES: NomeIcone[] = ["pessoa", "ia", "cuidado", "batimentos"];

export function Beneficios() {
  const b = site.beneficios;
  return (
    <section aria-labelledby="beneficios-titulo">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 id="beneficios-titulo" className="max-w-2xl text-[clamp(1.9rem,3.6vw,2.6rem)] font-bold tracking-[-0.015em]">
          {b.titulo}
        </h2>
        <ul className="mt-10 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {b.itens.map((item, i) => (
            <li key={item.titulo} className="cartao p-6">
              <span className="flex size-12 items-center justify-center rounded-full bg-info-fundo text-primaria">
                <Icone nome={ICONES[i]} tamanho={24} />
              </span>
              <h3 className="mt-5 text-[1.15rem] font-bold">{item.titulo}</h3>
              <p className="mt-2 leading-relaxed text-tinta-suave">{item.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
