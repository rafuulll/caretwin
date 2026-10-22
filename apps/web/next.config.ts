import type { NextConfig } from "next"

/**
 * Cabeçalhos de segurança em todas as respostas (cartão 5.11). Com o site
 * aberto ao público, eles fecham portas que a proteção da Vercel fechava antes:
 *
 * - X-Frame-Options e frame-ancestors: nenhum outro site abre o CareTwin dentro
 *   de um iframe. Sem isso, uma página de fora poderia esconder o app por baixo
 *   de um botão dela e fazer a pessoa clicar em "aprovar" ou "sair da família"
 *   sem perceber. Só a diretiva frame-ancestors, e não uma CSP completa, para
 *   não arriscar bloquear os scripts e estilos do próprio Next.
 * - nosniff: o navegador não "adivinha" o tipo de um arquivo e roda como script
 *   algo que chegou como texto.
 * - Referrer-Policy: ao sair do app por um link, o outro site recebe só o
 *   domínio, nunca o caminho (que pode ter o id de uma pessoa).
 * - Permissions-Policy: desliga recursos do navegador que o app não usa.
 * - HSTS: depois da primeira visita, o navegador só fala com o site por https.
 *   Em http (o `npm run dev`) ele ignora o cabeçalho, então nada muda local.
 */
const CABECALHOS_DE_SEGURANCA = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
]

const nextConfig: NextConfig = {
  // Só o Dockerfile liga isto. O `standalone` gera uma pasta `.next/standalone`
  // com o servidor e só o que ele precisa, o que deixa a imagem do Docker
  // pequena. Na Vercel e no `npm run dev` ele fica desligado, porque lá quem
  // empacota o servidor é a própria plataforma.
  output: process.env.CARETWIN_STANDALONE === "1" ? "standalone" : undefined,

  async headers() {
    return [{ source: "/:path*", headers: CABECALHOS_DE_SEGURANCA }]
  },
}

export default nextConfig
