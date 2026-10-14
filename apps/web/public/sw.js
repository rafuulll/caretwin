/*
  Service worker do CareTwin (suporte offline, cartão 7.7 do Trello).

  Estratégia:
  - Arquivos com hash em /_next/static: cache primeiro (nunca mudam).
  - Páginas e dados das rotas: rede primeiro, com cópia no cache; sem internet,
    entrega a última cópia guardada.
  Os dados do usuário ficam no próprio navegador (localStorage), então com as páginas
  em cache o app abre e mostra os últimos dados mesmo sem internet.
  Quando a API do CareTwin existir, é aqui que entra o aviso (push) para quem cuida.
*/

const VERSAO = "caretwin-v1";
const PAGINAS = ["/", "/entrar", "/como-usar", "/app/hoje", "/app/sono", "/app/batimentos", "/app/alertas", "/app/ajustes"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(VERSAO)
      .then((cache) => cache.addAll(PAGINAS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== VERSAO).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.match(/\.(png|svg|woff2)$/)) {
    evento.respondWith(
      caches.match(pedido).then(
        (guardado) =>
          guardado ||
          fetch(pedido).then((resposta) => {
            const copia = resposta.clone();
            caches.open(VERSAO).then((cache) => cache.put(pedido, copia));
            return resposta;
          }),
      ),
    );
    return;
  }

  evento.respondWith(
    fetch(pedido)
      .then((resposta) => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(VERSAO).then((cache) => cache.put(pedido, copia));
        }
        return resposta;
      })
      .catch(() => caches.match(pedido).then((guardado) => guardado || caches.match("/app/hoje"))),
  );
});
