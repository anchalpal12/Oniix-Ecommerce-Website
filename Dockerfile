# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci && npm ci --prefix client

COPY . .
RUN npm run build --prefix client

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S onix && adduser -S onix -G onix

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/app.js ./
COPY --from=build /app/server.js ./
COPY --from=build /app/config ./config
COPY --from=build /app/controllers ./controllers
COPY --from=build /app/middleware ./middleware
COPY --from=build /app/models ./models
COPY --from=build /app/routes ./routes
COPY --from=build /app/utils ./utils
COPY --from=build /app/validators ./validators
COPY --from=build /app/public ./public
COPY --from=build /app/client/dist ./client/dist

RUN mkdir -p uploads && chown -R onix:onix /app
USER onix

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health/live || exit 1

CMD ["node", "server.js"]
