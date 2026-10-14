"use client";

/*
  Ajustes: quem você acompanha, como o app aparece para você (tema e tamanho do texto)
  e os dados de exemplo, com confirmação antes de qualquer coisa que apaga.
*/

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  apagarTudo,
  atualizarNomeDaSessao,
  atualizarPessoa,
  definirPreferencias,
  removerPessoa,
  restaurarExemplos,
  useDados,
  usePreferencias,
  useSessao,
} from "@/lib/store";
import { pulseiraDe } from "@/lib/consultas";
import { iniciais } from "@/lib/formato";
import { errosPorCampo, esquemaPerfil, esquemaPessoa, type FormPessoa } from "@/lib/validacao";
import type { Pessoa } from "@/lib/types";
import { ajustes as copy, comum, primeiroUso } from "@/content/app";
import { rotas } from "@/content/site";
import { CabecalhoTela } from "@/components/app/cabecalho-tela";
import { Alternador } from "@/components/ui/alternador";
import { Botao, LinkBotao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { Confirmar } from "@/components/ui/confirmar";
import { Dialogo } from "@/components/ui/dialogo";
import { Icone } from "@/components/ui/icone";
import { useAnunciar } from "@/components/ui/anunciador";

function Bloco({ id, titulo, apoio, children }: { id: string; titulo: string; apoio?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="cartao p-5 sm:p-6">
      <h2 id={id} className="text-[1.2rem] font-bold">
        {titulo}
      </h2>
      {apoio && <p className="mt-1 text-tinta-suave">{apoio}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EditarPessoa({ pessoa, aoFechar }: { pessoa: Pessoa; aoFechar: () => void }) {
  const anunciar = useAnunciar();
  const [form, setForm] = useState<FormPessoa>({
    nome: pessoa.nome,
    comoChamar: pessoa.comoChamar,
    idade: pessoa.idadeAproximada ? String(pessoa.idadeAproximada) : "",
    quemAcompanha: pessoa.quemAcompanha,
  });
  const [erros, setErros] = useState<Record<string, string>>({});

  function salvar(evento: FormEvent) {
    evento.preventDefault();
    const resultado = esquemaPessoa.safeParse(form);
    if (!resultado.success) {
      const novos = errosPorCampo(resultado.error);
      setErros(novos);
      const primeiro = Object.keys(novos)[0];
      document.getElementById(`ed-${primeiro}`)?.focus();
      return;
    }
    atualizarPessoa(pessoa.id, {
      nome: resultado.data.nome,
      comoChamar: resultado.data.comoChamar || resultado.data.nome.split(" ")[0],
      idadeAproximada: resultado.data.idade ? Number(resultado.data.idade) : null,
      quemAcompanha: resultado.data.quemAcompanha,
    });
    anunciar(copy.pessoas.salvo);
    aoFechar();
  }

  const campo = (nome: keyof FormPessoa) => ({
    id: `ed-${nome}`,
    value: form[nome],
    erro: erros[nome],
    autoComplete: "off",
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [nome]: e.target.value })),
  });

  return (
    <form noValidate onSubmit={salvar} className="space-y-4">
      <Campo rotulo={primeiroUso.pessoa.nome.rotulo} obrigatorio {...campo("nome")} />
      <Campo rotulo={primeiroUso.pessoa.comoChamar.rotulo} ajuda={primeiroUso.pessoa.comoChamar.ajuda} {...campo("comoChamar")} />
      <Campo rotulo={primeiroUso.pessoa.idade.rotulo} inputMode="numeric" className="max-w-[12rem]" {...campo("idade")} />
      <Campo rotulo={primeiroUso.pessoa.quemAcompanha.rotulo} obrigatorio {...campo("quemAcompanha")} />
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Botao variante="suave" onClick={aoFechar}>
          {comum.cancelar}
        </Botao>
        <Botao type="submit" icone="ok">
          {comum.salvar}
        </Botao>
      </div>
    </form>
  );
}

export function TelaAjustes() {
  const dados = useDados();
  const sessao = useSessao();
  const preferencias = usePreferencias();
  const anunciar = useAnunciar();
  const [nome, setNome] = useState<string | null>(null);
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [editando, setEditando] = useState<Pessoa | null>(null);
  const [removendo, setRemovendo] = useState<Pessoa | null>(null);
  const [confirmar, setConfirmar] = useState<"restaurar" | "apagar" | null>(null);

  if (!dados || !sessao) return null;
  const nomeAtual = nome ?? sessao.nome;

  function salvarPerfil(evento: FormEvent) {
    evento.preventDefault();
    const resultado = esquemaPerfil.safeParse({ nome: nomeAtual });
    if (!resultado.success) {
      setErroNome(resultado.error.issues[0].message);
      document.getElementById("perfil-nome")?.focus();
      return;
    }
    setErroNome(null);
    atualizarNomeDaSessao(resultado.data.nome);
    setNome(null);
    anunciar(copy.perfil.salvo);
  }

  return (
    <>
      <CabecalhoTela titulo={copy.titulo} apoio={copy.apoio} />

      <div className="grid gap-5">
        <Bloco id="bloco-pessoas" titulo={copy.pessoas.titulo} apoio={copy.pessoas.apoio}>
          {dados.pessoas.length === 0 ? (
            <p className="text-tinta-suave">{copy.pessoas.vazio}</p>
          ) : (
            <ul className="divide-y divide-borda overflow-hidden rounded-cartao border border-borda">
              {dados.pessoas.map((pessoa) => {
                const pulseira = pulseiraDe(dados, pessoa.id);
                return (
                  <li key={pessoa.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-info-fundo font-bold text-info" aria-hidden="true">
                      {iniciais(pessoa.nome)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">
                        {pessoa.comoChamar}
                        <span className="font-normal text-tinta-suave">
                          {" "}
                          ({pessoa.nome}
                          {pessoa.idadeAproximada ? `, ${copy.pessoas.anos(pessoa.idadeAproximada)}` : ""})
                        </span>
                      </p>
                      <p className="text-[0.95rem] text-tinta-suave">{copy.pessoas.acompanhadaPor(pessoa.quemAcompanha)}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[0.95rem] text-tinta-suave">
                        <Icone nome="pulseira" tamanho={16} />
                        {pulseira ? copy.pessoas.pulseira(pulseira.codigo, pulseira.bateria) : copy.pessoas.semPulseira}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Botao variante="secundario" tamanho="pequeno" icone="editar" onClick={() => setEditando(pessoa)} aria-label={copy.pessoas.editarTitulo(pessoa.comoChamar)}>
                        {copy.pessoas.editar}
                      </Botao>
                      <Botao variante="suave" tamanho="pequeno" icone="apagar" onClick={() => setRemovendo(pessoa)} aria-label={copy.pessoas.confirmarRemover.titulo(pessoa.comoChamar)}>
                        {copy.pessoas.remover}
                      </Botao>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <LinkBotao href={rotas.primeiroUso} variante="secundario" icone="mais" className="mt-4">
            {copy.pessoas.adicionar}
          </LinkBotao>
        </Bloco>

        <Bloco id="bloco-aparencia" titulo={copy.aparencia.titulo}>
          <div className="grid gap-6 md:grid-cols-2">
            <Alternador
              legenda={copy.aparencia.tema.rotulo}
              valor={preferencias.tema}
              aoMudar={(tema) => definirPreferencias({ tema })}
              opcoes={[
                { valor: "claro", rotulo: copy.aparencia.tema.claro, icone: "claro" },
                { valor: "escuro", rotulo: copy.aparencia.tema.escuro, icone: "escuro" },
                { valor: "sistema", rotulo: copy.aparencia.tema.sistema },
              ]}
            />
            <Alternador
              legenda={copy.aparencia.texto.rotulo}
              valor={preferencias.texto}
              aoMudar={(texto) => definirPreferencias({ texto })}
              ajuda={copy.aparencia.ajuda}
              opcoes={[
                { valor: "padrao", rotulo: copy.aparencia.texto.padrao },
                { valor: "grande", rotulo: copy.aparencia.texto.grande, icone: "texto" },
              ]}
            />
          </div>
        </Bloco>

        <Bloco id="bloco-perfil" titulo={copy.perfil.titulo}>
          <form noValidate onSubmit={salvarPerfil} className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Campo
              id="perfil-nome"
              rotulo={copy.perfil.nome.rotulo}
              ajuda={copy.perfil.nome.ajuda}
              value={nomeAtual}
              autoComplete="name"
              onChange={(e) => {
                setNome(e.target.value);
                if (erroNome) setErroNome(null);
              }}
              erro={erroNome}
              className="flex-1 sm:max-w-sm"
            />
            <Botao type="submit" variante="secundario" icone="ok" className="sm:mt-8">
              {copy.perfil.salvar}
            </Botao>
          </form>
          <p className="mt-4 text-[0.95rem] text-tinta-suave">{copy.sessao.texto(sessao.nome)}</p>
        </Bloco>

        <Bloco id="bloco-exemplos" titulo={copy.exemplos.titulo} apoio={copy.exemplos.apoio(dados.pessoas.length, dados.dias.length, dados.alertas.length)}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Botao variante="secundario" icone="restaurar" onClick={() => setConfirmar("restaurar")}>
              {copy.exemplos.restaurar}
            </Botao>
            <Botao variante="perigoSuave" icone="apagar" onClick={() => setConfirmar("apagar")}>
              {copy.exemplos.apagar}
            </Botao>
          </div>
        </Bloco>
      </div>

      <Dialogo aberto={editando !== null} aoFechar={() => setEditando(null)} titulo={editando ? copy.pessoas.editarTitulo(editando.comoChamar) : ""} rotuloFechar={comum.fechar}>
        {editando && <EditarPessoa key={editando.id} pessoa={editando} aoFechar={() => setEditando(null)} />}
      </Dialogo>

      <Confirmar
        aberto={removendo !== null}
        titulo={removendo ? copy.pessoas.confirmarRemover.titulo(removendo.comoChamar) : ""}
        texto={copy.pessoas.confirmarRemover.texto}
        confirmar={copy.pessoas.confirmarRemover.confirmar}
        cancelar={comum.cancelar}
        rotuloFechar={comum.fechar}
        aoCancelar={() => setRemovendo(null)}
        aoConfirmar={() => {
          if (removendo) removerPessoa(removendo.id);
          setRemovendo(null);
          anunciar(copy.pessoas.removido);
        }}
      />

      <Confirmar
        aberto={confirmar === "restaurar"}
        titulo={copy.exemplos.confirmarRestaurar.titulo}
        texto={copy.exemplos.confirmarRestaurar.texto}
        confirmar={copy.exemplos.confirmarRestaurar.confirmar}
        cancelar={comum.cancelar}
        rotuloFechar={comum.fechar}
        perigo={false}
        aoCancelar={() => setConfirmar(null)}
        aoConfirmar={() => {
          restaurarExemplos();
          setConfirmar(null);
          anunciar(copy.exemplos.restaurados);
        }}
      />

      <Confirmar
        aberto={confirmar === "apagar"}
        titulo={copy.exemplos.confirmarApagar.titulo}
        texto={copy.exemplos.confirmarApagar.texto}
        confirmar={copy.exemplos.confirmarApagar.confirmar}
        cancelar={comum.cancelar}
        rotuloFechar={comum.fechar}
        aoCancelar={() => setConfirmar(null)}
        aoConfirmar={() => {
          apagarTudo();
          setConfirmar(null);
          anunciar(copy.exemplos.apagados);
        }}
      />
    </>
  );
}
