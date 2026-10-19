# docs

| Arquivo | O que tem |
| --- | --- |
| `openapi.yaml` | Contrato da API v0.2: rotas da pulseira (`/v1/device/*`), do site (`/v1/me`, `/v1/pessoas`, `/v1/vinculos` e familia) e o formato dos erros. Fonte da verdade entre pulseira, API e site |
| `decisoes/0001-repositorio-e-fluxo.md` | Monorepo e contrato primeiro (e a 0002, IA local com reserva por regras) |
| `decisoes/0003-site-em-nextjs.md` | Site em Next.js e Tailwind, funcionando sozinho com dados de exemplo |
| `decisoes/0004-backend-no-nextjs.md` | Backend dentro do Next.js, Supabase como banco e contas |
| `hardware/CareTwin_Sensores_Hardware_Compras.md` | Pesquisa de sensores, alternativas e riscos (setembro de 2026) |

Regra: quem muda uma rota atualiza o `openapi.yaml` no mesmo pull request. O arquivo e escrito a mao.
