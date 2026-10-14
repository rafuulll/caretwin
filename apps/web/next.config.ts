import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Só o Dockerfile liga isto. O `standalone` gera uma pasta `.next/standalone`
  // com o servidor e só o que ele precisa, o que deixa a imagem do Docker
  // pequena. Na Vercel e no `npm run dev` ele fica desligado, porque lá quem
  // empacota o servidor é a própria plataforma.
  output: process.env.CARETWIN_STANDALONE === "1" ? "standalone" : undefined,
}

export default nextConfig
