# Audit Service — multi-stage build
#
# package-lock.json está en el .gitignore raíz del repo (regla genérica, sin
# prefijo de carpeta — afecta a audit-service/ también), así que un clon
# fresco no lo trae. `npm install` en vez de `npm ci` por la misma razón que
# TraductivIA/Frontend.

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 4001
CMD ["node", "index.js"]
