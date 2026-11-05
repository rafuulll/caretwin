# Redesign aprovado no app original

Data: 5 de novembro de 2026. Branch local: web/redesign-aprovado-integracao.

## Entrega

- A referência visual aprovada está preservada em apps/redesign-v1, no commit c5a5281.
- A landing agora faz parte do Next.js em /. Mesmo layout, imagens e interações aprovadas, com estilos limitados à classe ct-landing para não vazarem ao app.
- Os CTAs levam a /app/painel. A proteção de sessão existente encaminha visitantes a /entrar.
- Login com identidade CareTwin: Fustat local, wordmark com ponto azul, Ritmo 2D, campos e ações consistentes. OAuth, recuperação de senha e cadastro condicionado ao ambiente continuam no fluxo original.
- Painel e navegação usam a identidade aprovada: visão geral, última noite, estado da pulseira, histórico de passos e sono com filtros 7/14 dias, mudanças e seletor de pessoa acessível.
- As páginas existentes de sono, batimentos, mudanças, família, primeiro uso e preferências foram preservadas. A casca e os tokens visuais compartilhados também se aplicam a elas.

## Fontes de verdade

Copy em src/content/site.ts. Tokens semânticos e paleta das ilustrações em design-system.json. Fontes e assets aprovados em public/brand. Imagens passam por next/image com dimensões e tamanhos responsivos.

O painel continua lendo o store original e as funções existentes de consultas. Nenhuma rota de API, sessão no servidor, cálculo de faixa, estimativa de sono, regra de alerta, permissão ou migração de banco foi alterada. Os componentes independentes com fixtures do protótipo não foram usados como fonte de dados do app original.

## Validação

- Build de produção e TypeScript aprovados.
- Lint sem erros; quatro avisos de setState em effects já existentes em layout, perfil e diálogo.
- 26 verificações de navegação, validação de formulário, filtros, troca de pessoa, responsividade a 375/320 px e proteção de rota aprovadas.
- Zero erros de JavaScript na execução verificada.
- Quatro verificações axe para WCAG A/AA e 2.1 AA sem violações detectadas: landing desktop, login desktop, painel desktop e painel mobile. Isso é uma verificação automatizada, não uma certificação de acessibilidade.
- Movimento reduzido continua atendido por CSS e pelas animações importadas do protótipo. O scroll suave só é ativado em ponteiro fino e respeita a preferência do sistema.

O teste do fluxo foi local, com o modo navegador já existente e variáveis de conta/banco desativadas apenas no processo da prévia. O arquivo .env.local foi preservado. A resposta 503 de /api/v1/me nesse modo é o comportamento existente que permite a prévia local; não é falha nova de integração. Login e dados de contas reais ainda precisam de homologação no ambiente apropriado.

## Próximo passo

Revisar a experiência usando uma conta de homologação e uma pulseira vinculada, conferir cenários sem dados e permissões de família e então preparar um preview Vercel. Nenhum push ou deploy foi feito nesta etapa.

## Dependências antes de publicar

A consulta npm audit --omit=dev apontou seis alertas na árvore de produção: um crítico e cinco altos. O crítico está no Next.js 16.2.11; Zod 4.4.3 também aparece. Essas duas versões diretas já estavam no projeto antes desta integração e não foram alteradas. Nenhum dos sete pacotes adicionados para reproduzir a landing é apontado nessa lista. A correção das dependências requer uma etapa própria de atualização e regressão antes de publicar. Relatório integral em AUDITORIA-DEPENDENCIAS.json. Não foi executado npm audit fix nem atualização automática fora do escopo visual.
