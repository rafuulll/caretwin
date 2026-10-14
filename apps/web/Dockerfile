# CareTwin rodando num container, só neste computador.
#
#   docker compose up --build
#
# Depois abra http://localhost:3000. A primeira montagem precisa de internet
# para baixar a fonte Inter e as dependências. Depois disso o app roda sem rede.

# 1) Dependências: camada própria, pra não reinstalar tudo a cada mudança de tela.
FROM node:22-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2) Build de produção.
FROM node:22-alpine AS construcao
WORKDIR /app
# Nenhum dado de uso sai daqui: a telemetria do Next fica desligada.
ENV NEXT_TELEMETRY_DISABLED=1 \
    CARETWIN_STANDALONE=1
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Imagem final: só o servidor gerado pelo build, sem código-fonte nem
# node_modules de desenvolvimento, rodando sem permissão de administrador.
FROM node:22-alpine AS execucao
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S caretwin && adduser -S caretwin -G caretwin
COPY --from=construcao --chown=caretwin:caretwin /app/.next/standalone ./
COPY --from=construcao --chown=caretwin:caretwin /app/.next/static ./.next/static
COPY --from=construcao --chown=caretwin:caretwin /app/public ./public
USER caretwin
EXPOSE 3000
CMD ["node", "server.js"]
