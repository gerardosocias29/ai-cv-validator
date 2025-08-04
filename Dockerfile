# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

ARG AUTH_SECRET
ARG DATABASE_URL
ARG OPENROUTER_API_KEY

ENV AUTH_SECRET=$AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV OPENROUTER_API_KEY=$OPENROUTER_API_KEY

RUN npm install --frozen-lockfile
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
