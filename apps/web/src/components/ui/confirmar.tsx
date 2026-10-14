"use client";

/* Confirmação de ação destrutiva: alertdialog com o foco começando no "Cancelar". */

import { Dialogo } from "./dialogo";
import { Botao } from "./botao";

type Props = {
  aberto: boolean;
  titulo: string;
  texto: string;
  confirmar: string;
  cancelar: string;
  rotuloFechar: string;
  perigo?: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
};

export function Confirmar({ aberto, titulo, texto, confirmar, cancelar, rotuloFechar, perigo = true, aoConfirmar, aoCancelar }: Props) {
  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoCancelar}
      titulo={titulo}
      descricao={texto}
      papel="alertdialog"
      rotuloFechar={rotuloFechar}
      rodape={
        <>
          <Botao variante="suave" onClick={aoCancelar} autoFocus>
            {cancelar}
          </Botao>
          <Botao variante={perigo ? "perigo" : "primario"} onClick={aoConfirmar}>
            {confirmar}
          </Botao>
        </>
      }
    />
  );
}
