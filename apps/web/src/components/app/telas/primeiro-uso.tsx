"use client";

/*
  Primeiro uso: cadastrar a pessoa e conectar a pulseira dela, em três passos curtos.
  Indicador de progresso, voltar sem perder o que foi digitado, resumo de erros com foco
  e o foco indo para o título de cada passo quando ele muda.
*/

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cadastrarPessoaComPulseira, useDados } from "@/lib/store";
import { errosPorCampo, esquemaCodigo, esquemaPessoa, type FormPessoa } from "@/lib/validacao";
import { primeiroUso as copy, comum } from "@/content/app";
import { rotas } from "@/content/site";
import { CabecalhoTela } from "@/components/app/cabecalho-tela";
import { Botao } from "@/components/ui/botao";
import { Campo, ResumoDeErros } from "@/components/ui/campo";
import { Icone } from "@/components/ui/icone";
import { cn } from "@/lib/cn";

const VAZIO: FormPessoa = { nome: "", comoChamar: "", idade: "", quemAcompanha: "" };

export function TelaPrimeiroUso() {
  const dados = useDados();
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [form, setForm] = useState<FormPessoa>(VAZIO);
  const [codigo, setCodigo] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [tentou, setTentou] = useState(false);
  const [procurando, setProcurando] = useState(false);
  const [nomeFinal, setNomeFinal] = useState("");
  const refTitulo = useRef<HTMLHeadingElement>(null);
  const refResumo = useRef<HTMLDivElement>(null);
  const primeiraVez = useRef(true);

  useEffect(() => {
    if (primeiraVez.current) {
      primeiraVez.current = false;
      return;
    }
    refTitulo.current?.focus();
  }, [passo]);

  if (!dados) return null;

  const idsCampos: Record<string, string> = {
    nome: "pu-nome",
    comoChamar: "pu-chamar",
    idade: "pu-idade",
    quemAcompanha: "pu-acompanha",
    codigo: "pu-codigo",
  };

  function mostrarErros(novos: Record<string, string>) {
    setTentou(true);
    setErros(novos);
    requestAnimationFrame(() => refResumo.current?.focus());
  }

  function enviarPessoa(evento: FormEvent) {
    evento.preventDefault();
    const resultado = esquemaPessoa.safeParse(form);
    if (!resultado.success) return mostrarErros(errosPorCampo(resultado.error));
    setErros({});
    setTentou(false);
    setPasso(1);
  }

  function enviarPulseira(evento: FormEvent) {
    evento.preventDefault();
    const resultado = esquemaCodigo.safeParse(codigo);
    if (!resultado.success) return mostrarErros({ codigo: resultado.error.issues[0].message });
    if (dados!.pulseiras.some((p) => p.codigo === resultado.data)) return mostrarErros({ codigo: copy.erros.codigoEmUso });
    setErros({});
    setTentou(false);
    setProcurando(true);
    window.setTimeout(() => {
      cadastrarPessoaComPulseira({
        nome: form.nome,
        comoChamar: form.comoChamar,
        idadeAproximada: form.idade ? Number(form.idade) : null,
        quemAcompanha: form.quemAcompanha,
        codigoPulseira: resultado.data,
      });
      setNomeFinal(form.comoChamar.trim() || form.nome.trim().split(" ")[0]);
      setProcurando(false);
      setPasso(2);
    }, 1400);
  }

  const itensResumo = Object.entries(erros).map(([campo, mensagem]) => ({ campoId: idsCampos[campo] ?? campo, mensagem }));

  function atualizar(campo: keyof FormPessoa, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (erros[campo]) setErros((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== campo)));
  }

  return (
    <>
      <CabecalhoTela titulo={copy.titulo} apoio={copy.apoio} />

      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label={copy.etapaDe(passo + 1, 3)}>
        {copy.etapas.map((etapa, i) => (
          <li key={etapa} aria-current={i === passo ? "step" : undefined} className="min-w-0">
            <span className={cn("block h-1.5 rounded-full", i <= passo ? "bg-primaria" : "bg-borda-forte")} />
            <span className={cn("mt-2 flex items-center gap-1.5 text-[0.9rem]", i === passo ? "font-bold text-tinta" : "text-tinta-suave")}>
              {i < passo ? <Icone nome="ok" tamanho={16} className="text-bom" /> : <span className="numeros-tabulares">{i + 1}.</span>}
              <span className="truncate">{etapa}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="cartao mx-auto max-w-2xl p-5 sm:p-8">
        <p className="text-[0.95rem] font-bold text-tinta-suave">{copy.etapaDe(passo + 1, 3)}</p>

        {passo === 0 && (
          <form noValidate onSubmit={enviarPessoa} className="mt-2 space-y-5">
            <h2 ref={refTitulo} tabIndex={-1} className="text-[1.4rem] font-bold focus:outline-none">
              {copy.pessoa.titulo}
            </h2>
            {tentou && <ResumoDeErros titulo={copy.erros.resumo(itensResumo.length)} itens={itensResumo} refResumo={refResumo} />}
            <Campo id="pu-nome" rotulo={copy.pessoa.nome.rotulo} placeholder={copy.pessoa.nome.exemplo} autoComplete="off" value={form.nome} onChange={(e) => atualizar("nome", e.target.value)} erro={erros.nome} obrigatorio />
            <Campo id="pu-chamar" rotulo={copy.pessoa.comoChamar.rotulo} placeholder={copy.pessoa.comoChamar.exemplo} ajuda={copy.pessoa.comoChamar.ajuda} autoComplete="off" value={form.comoChamar} onChange={(e) => atualizar("comoChamar", e.target.value)} erro={erros.comoChamar} />
            <Campo id="pu-idade" rotulo={copy.pessoa.idade.rotulo} placeholder={copy.pessoa.idade.exemplo} ajuda={copy.pessoa.idade.ajuda} inputMode="numeric" autoComplete="off" value={form.idade} onChange={(e) => atualizar("idade", e.target.value)} erro={erros.idade} className="max-w-[12rem]" />
            <Campo id="pu-acompanha" rotulo={copy.pessoa.quemAcompanha.rotulo} placeholder={copy.pessoa.quemAcompanha.exemplo} ajuda={copy.pessoa.quemAcompanha.ajuda} autoComplete="off" value={form.quemAcompanha} onChange={(e) => atualizar("quemAcompanha", e.target.value)} erro={erros.quemAcompanha} obrigatorio />
            <div className="flex justify-end pt-2">
              <Botao type="submit" tamanho="grande" iconeDepois="seta">
                {comum.continuar}
              </Botao>
            </div>
          </form>
        )}

        {passo === 1 && (
          <form noValidate onSubmit={enviarPulseira} className="mt-2 space-y-5">
            <h2 ref={refTitulo} tabIndex={-1} className="text-[1.4rem] font-bold focus:outline-none">
              {copy.pulseira.titulo}
            </h2>
            {tentou && <ResumoDeErros titulo={copy.erros.resumo(itensResumo.length)} itens={itensResumo} refResumo={refResumo} />}
            <ol className="space-y-3">
              {copy.pulseira.passos.map((texto, i) => (
                <li key={texto} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-info-fundo font-bold text-info">{i + 1}</span>
                  <p className="pt-0.5">{texto}</p>
                </li>
              ))}
            </ol>
            <Campo
              id="pu-codigo"
              rotulo={copy.pulseira.codigo.rotulo}
              placeholder={copy.pulseira.codigo.exemplo}
              ajuda={copy.pulseira.codigo.ajuda}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value);
                if (erros.codigo) setErros({});
              }}
              erro={erros.codigo}
              obrigatorio
              className="max-w-xs"
            />
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
              <Botao variante="suave" tamanho="grande" icone="voltar" onClick={() => setPasso(0)} disabled={procurando}>
                {comum.voltar}
              </Botao>
              <Botao type="submit" tamanho="grande" icone="pulseira" carregando={procurando} textoCarregando={copy.pulseira.procurando}>
                {copy.pulseira.procurar}
              </Botao>
            </div>
          </form>
        )}

        {passo === 2 && (
          <div className="mt-2 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-bom-fundo text-bom">
              <Icone nome="ok" tamanho={32} />
            </span>
            <h2 ref={refTitulo} tabIndex={-1} className="mt-4 text-[1.5rem] font-bold focus:outline-none">
              {copy.pronto.titulo}
            </h2>
            <p className="mt-1 font-bold text-bom" role="status">
              {copy.pulseira.encontrada(codigo.trim().toUpperCase())}
            </p>
            <p className="mx-auto mt-3 max-w-md text-tinta-suave">{copy.pronto.texto(nomeFinal)}</p>
            <Botao className="mt-6" tamanho="grande" iconeDepois="seta" onClick={() => router.push(rotas.hoje)}>
              {copy.pronto.botao}
            </Botao>
          </div>
        )}
      </div>
    </>
  );
}
