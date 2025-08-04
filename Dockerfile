FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

ENV NODE_ENV=production

RUN npm install --frozen-lockfile

COPY . .

ARG AUTH_SECRET
ARG DATABASE_URL
ARG OPENROUTER_API_KEY

ENV AUTH_SECRET=$AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV OPENROUTER_API_KEY=$OPENROUTER_API_KEY

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

ENV NODE_ENV=production

COPY prisma ./prisma

COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./

COPY --from=builder --chown=appuser:appgroup /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
