"use client";

/*
  A porta do CareTwin, com os quatro elementos na ordem: botão do Google, campo de
  usuário, campo de senha e botão de entrar. Todos visíveis assim que a tela abre.

  Por que a senha não é guardada: nesta versão não existe servidor de login, então a
  senha não teria contra o que ser conferida. Ela não vai para o localStorage, não vai
  para a sessão e não sai do navegador. Quando o Supabase Auth for ligado (cartão 5.3),
  é ele que recebe a senha, e esta tela não muda.
*/

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Botao } from "@/components/ui/botao";
import { Campo, CampoSenha, ResumoDeErros } from "@/components/ui/campo";
import { entrar } from "@/lib/store";
import { entrada, rotas } from "@/content/site";
import { IconeGoogle } from "./icone-google";
import { ModalGoogle } from "./modal-google";

type Erros = { usuario?: string; senha?: string };

function nomeParaMostrar(usuario: string): string {
  const texto = usuario.trim();
  if (!texto.includes("@")) return texto;
  const parte = texto.split("@")[0].replace(/[._-]+/g, " ").trim();
  return parte.replace(/\b\p{L}/gu, (letra) => letra.toUpperCase()) || texto;
}

export function FormularioEntrada() {
  const router = useRouter();
  const [googleAberto, setGoogleAberto] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [tentou, setTentou] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const refResumo = useRef<HTMLDivElement>(null);
  const refSenha = useRef<HTMLInputElement>(null);

  function validar(senha: string): Erros {
    const novos: Erros = {};
    if (!usuario.trim()) novos.usuario = entrada.erros.usuario;
    if (!senha) novos.senha = entrada.erros.senha;
    return novos;
  }

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const senha = refSenha.current?.value ?? "";
    const encontrados = validar(senha);
    setTentou(true);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) {
      requestAnimationFrame(() => refResumo.current?.focus());
      return;
    }
    setCarregando(true);
    entrar(nomeParaMostrar(usuario));
    router.replace(rotas.hoje);
  }

  const itensResumo = [
    erros.usuario ? { campoId: "entrar-usuario", mensagem: erros.usuario } : null,
    erros.senha ? { campoId: "entrar-senha", mensagem: erros.senha } : null,
  ].filter((item): item is { campoId: string; mensagem: string } => item !== null);

  return (
    <>
      <form noValidate onSubmit={aoEnviar} className="space-y-5">
        {tentou && <ResumoDeErros titulo={entrada.erros.resumo(itensResumo.length)} itens={itensResumo} refResumo={refResumo} />}

        <Botao variante="suave" tamanho="grande" larguraTotal onClick={() => setGoogleAberto(true)} className="border border-borda-campo bg-superficie hover:bg-suave">
          <span className="inline-flex items-center gap-3">
            <IconeGoogle />
            {entrada.google}
          </span>
        </Botao>

        <div className="flex items-center gap-4 text-tinta-suave" role="separator" aria-label={entrada.separador}>
          <span className="h-px flex-1 bg-borda-forte" />
          <span aria-hidden="true">{entrada.separador}</span>
          <span className="h-px flex-1 bg-borda-forte" />
        </div>

        <Campo
          id="entrar-usuario"
          name="username"
          rotulo={entrada.usuario.rotulo}
          placeholder={entrada.usuario.exemplo}
          ajuda={entrada.usuario.ajuda}
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          value={usuario}
          onChange={(e) => {
            setUsuario(e.target.value);
            if (erros.usuario) setErros((atual) => ({ ...atual, usuario: undefined }));
          }}
          erro={erros.usuario}
          obrigatorio
        />

        <CampoSenha
          id="entrar-senha"
          ref={refSenha}
          name="password"
          rotulo={entrada.senha.rotulo}
          ajuda={entrada.senha.ajuda}
          autoComplete="current-password"
          textoMostrar={entrada.senha.mostrar}
          textoEsconder={entrada.senha.esconder}
          onChange={() => {
            if (erros.senha) setErros((atual) => ({ ...atual, senha: undefined }));
          }}
          erro={erros.senha}
          obrigatorio
        />

        <Botao type="submit" tamanho="grande" larguraTotal iconeDepois="seta" carregando={carregando} textoCarregando={entrada.carregando}>
          {entrada.botao}
        </Botao>
      </form>
      <ModalGoogle aberto={googleAberto} aoFechar={() => setGoogleAberto(false)} />
    </>
  );
}
