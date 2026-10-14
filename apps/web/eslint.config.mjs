import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // A versão do React vai escrita: o plugin de React tenta descobrir sozinho,
  // e essa descoberta quebra no ESLint 10, derrubando o `npm run lint` inteiro.
  { settings: { react: { version: "19.2" } } },
  // Marcar "já hidratou" e "já montou" num efeito é o padrão do andaime pra
  // separar o que só existe no navegador (sessão, portal do diálogo) do que o
  // servidor desenha. A regra nova do React acusa esse padrão como erro; aqui
  // ele vira aviso, porque é deliberado e está comentado onde aparece.
  { rules: { "react-hooks/set-state-in-effect": "warn" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
