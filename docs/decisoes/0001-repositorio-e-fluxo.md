# 0001 Monorepo e contrato primeiro

Decisao: um unico repositorio (monorepo) com apps/web, apps/api, ai, firmware e docs.
Motivo: equipe de 3 pessoas, prazo curto, um PR pode tocar API e contrato juntos, um unico quadro no Trello e um unico lugar para achar tudo. Vercel e Railway aceitam Root Directory por pasta, entao deploy separado continua possivel.

Decisao: contract first. O docs/openapi.yaml e a fonte da verdade entre pulseira, API e site.

# 0002 IA local com fallback

Decisao: tentar IA local (Ollama) para o texto, mantendo a analise na linha de base estatistica e um fallback por regras.
Motivo: privacidade, custo zero, mas Railway nao roda modelos e tunel para notebook e fragil em dia de demo.
Plano: API chama uma interface de provedor; na demo, tudo em um notebook; versao em nuvem com texto por regras como reserva.

Atualizacao (15/10/2026): a parte de apps/api e da Railway foi substituida pela decisao 0004. O backend mora em apps/web, dentro do Next.js, e a IA local continua valendo, chamada pela API do Next.js.
