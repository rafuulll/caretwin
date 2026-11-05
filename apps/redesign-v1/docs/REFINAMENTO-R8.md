# Ajustes de movimento e hierarquia mobile — r8

04/11/2026. Alterações locais; sem publicação.

- Na seção Registrar / Conhecer / Comparar, o diagrama aparece imediatamente depois das abas em telas de até 767 px. Explicação e Ritmo vêm abaixo. A composição desktop foi preservada. A troca de etapas mantém a posição da página.
- A volta ao dia conserva a máscara circular de 680 ms. O sol fica na superfície clara, sob a camada azul; a lua pertence à camada azul e compartilha sua máscara. A própria revelação sincroniza os símbolos com as cores, eliminando o intervalo da esfera azul vazia e impedindo sol azul sobre superfície azul. Essa composição substitui a espera por raio usada em r7.
- Preferência de movimento reduzido e interrupções por trocas rápidas preservadas. Sem dependências novas ou mudanças no painel, dados ou backend.

Build aprovado. Doze verificações aprovadas: composição desktop, máscara e símbolos, trocas interrompidas, movimento reduzido e três etapas em 320 e 375 px. Nenhum salto de rolagem ou overflow nesses cenários; nenhum erro de JavaScript. Axe não encontrou violações na seção de histórico. Inspeção visual dos quadros da volta ao dia e da composição mobile concluída no Chrome local.

Evidências em `VERIFICACAO-R8.json`; roteiro e capturas no workspace `C:/Users/WIN11/Documents/Playground/caretwin-details-r8/`. Não foram feitos testes em dispositivos físicos.
