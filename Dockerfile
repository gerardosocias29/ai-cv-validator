FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

ENV NODE_ENV=production

RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

ENV NODE_ENV=production

COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./

COPY --from=builder --chown=appuser:appgroup /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
