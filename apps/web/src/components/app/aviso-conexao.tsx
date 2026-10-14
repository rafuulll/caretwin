"use client";

/*
  Aviso de conexão: quando a internet cai, o app avisa com calma que continua mostrando
  os últimos dados guardados no aparelho. É o lado visível do suporte offline (cartão 7.7).
*/

import { useEffect, useState } from "react";
import { Icone } from "@/components/ui/icone";
import { casca } from "@/content/site";

export function AvisoConexao() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine);
    atualizar();
    window.addEventListener("online", atualizar);
    window.addEventListener("offline", atualizar);
    return () => {
      window.removeEventListener("online", atualizar);
      window.removeEventListener("offline", atualizar);
    };
  }, []);

  if (online) return null;
  return (
    <div role="status" className="flex items-start gap-2 border-b border-atencao/30 bg-atencao-fundo px-4 py-3 font-bold text-atencao">
      <Icone nome="semInternet" className="mt-0.5" />
      <p>{casca.offline}</p>
    </div>
  );
}
