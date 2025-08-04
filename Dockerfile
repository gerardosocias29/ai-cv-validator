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

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["npm", "run", "start"]
