# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:22-alpine3.23@sha256:baf676f7d0e552f3231945c2f979055ca121bce128c152f7a34e6bd1728b1c5a

FROM ${NODE_IMAGE} AS base

WORKDIR /app

FROM base AS dependencies

RUN apk add --no-cache python3 make g++ openssl

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM dependencies AS build

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npm run prisma:generate && \
    npm run build && \
    npm prune --omit=dev

FROM docker:29.9.0-cli@sha256:1a4c7cb63513f349bdad01fcc6e0f3f2f67d37b9da86f14dc0d4a0942eecda00 AS docker-cli

FROM ${NODE_IMAGE} AS production

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

RUN apk add --no-cache openssl tini && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx && \
    addgroup --system --gid 10001 aita && \
    adduser --system --uid 10001 --ingroup aita aita && \
    mkdir -p /app/uploads /app/workspaces && \
    chown -R aita:aita /app

COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=build --chown=aita:aita /app/package.json ./package.json
COPY --from=build --chown=aita:aita /app/node_modules ./node_modules
COPY --from=build --chown=aita:aita /app/dist ./dist

USER aita

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const request=require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/',response=>process.exit(response.statusCode===200?0:1));request.on('error',()=>process.exit(1));request.setTimeout(3000,()=>{request.destroy();process.exit(1)})"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
