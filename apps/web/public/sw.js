/*
 * O service worker do CareTwin (cartão 7.7): faz o app abrir sem internet.
 *
 * Ele guarda só a casca do app: o HTML das telas e os arquivos de /_next/static.
 * As telas do app são montadas no navegador, então esse HTML não tem dado de
 * ninguém. Os dados da família nunca passam por aqui: /api fica sempre fora do
 * cache, e a última leitura para abrir sem internet mora no store
 * (src/lib/store.ts), que apaga a cópia quando a pessoa sai.
 *
 * Mudou este arquivo? Troque a VERSAO: o navegador instala o novo e apaga o
 * cache da versão anterior.
 */

const VERSAO = "caretwin-v1"

/** As telas guardadas já na instalação, para abrir mesmo as que ainda não foram visitadas. */
const TELAS = [
  "/entrar",
  "/app/painel",
  "/app/sono",
  "/app/batimentos",
  "/app/alertas",
  "/app/familia",
  "/app/configuracoes",
  "/app/primeiro-uso",
]

async function guardarTelas() {
  const cache = await caches.open(VERSAO)
  const arquivos = new Set()
  for (const tela of TELAS) {
    try {
      const resposta = await fetch(tela, { cache: "no-store" })
      if (!resposta.ok) continue
      const html = await resposta.clone().text()
      await cache.put(tela, resposta)
      // Os scripts e estilos que essa tela pede, para ela montar sem internet.
      for (const caminho of html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? []) arquivos.add(caminho)
    } catch {
      // Sem internet na instalação: a tela entra no cache quando for aberta.
    }
  }
  await Promise.all([...arquivos].map((caminho) => cache.add(caminho).catch(() => {})))
}

self.addEventListener("install", (evento) => {
  evento.waitUntil(guardarTelas().then(() => self.skipWaiting()))
})

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  )
})

/** Navegação: a rede primeiro, para a tela sempre vir nova; sem rede, a cópia. */
async function navegar(pedido) {
  const cache = await caches.open(VERSAO)
  try {
    const resposta = await fetch(pedido)
    if (resposta.ok && !resposta.redirected) await cache.put(new URL(pedido.url).pathname, resposta.clone())
    return resposta
  } catch {
    return (await cache.match(new URL(pedido.url).pathname)) ?? Response.error()
  }
}

/** Arquivos de /_next/static: o nome muda a cada versão, então o guardado nunca fica velho. */
async function arquivoFixo(pedido) {
  const cache = await caches.open(VERSAO)
  const guardado = await cache.match(pedido)
  if (guardado) return guardado
  const resposta = await fetch(pedido)
  if (resposta.ok) await cache.put(pedido, resposta.clone())
  return resposta
}

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request
  const url = new URL(pedido.url)
  if (pedido.method !== "GET" || url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) return
  if (pedido.mode === "navigate") return evento.respondWith(navegar(pedido))
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icones/")) {
    evento.respondWith(arquivoFixo(pedido))
  }
})
