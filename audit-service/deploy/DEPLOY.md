# Despliegue del Audit Service en la VPS (2.24.205.175, test-gradus.tech)

La VPS institucional ya corre **Traefik (Docker)** como único reverse proxy y
terminador de TLS para todo lo que aloja (Portal, SGI, Nuni, TraductivIA) —
un nginx nativo separado competiría por los puertos 80/443, que Traefik ya
tiene tomados, y nunca arrancaría. Este documento reemplaza la versión previa
basada en nginx nativo + certbot + pm2 (ver nota en
`nginx.audit-service.conf.example`, que queda solo como referencia histórica).

El código de `audit-service/` no cambia por esto — solo cómo se empaqueta y
expone. Pasos de infraestructura completos, con compose y verificación en
vivo: **Paso 18 de la guía de aprovisionamiento de la VPS TEST** (artifact
compartido del equipo). Resumen de las piezas:

## 1. MongoDB de auditoría

Contenedor propio (`mongo:7`), en la red Docker `internal` — sin publicar
ningún puerto a internet. Usuario dedicado con permisos solo sobre la base
`audit` (igual que pedía la versión anterior de este documento, ahora vía
`MONGO_INITDB_ROOT_USERNAME`/`PASSWORD` del propio contenedor en vez de un
`mongod.conf` editado a mano). Para consulta administrativa directa
(`mongosh`/Compass) sin exponerlo a internet, el puerto se publica **solo**
en `127.0.0.1` del host de la VPS — se llega vía túnel SSH:
`ssh -L 27017:127.0.0.1:27017 jorge@<VPS_IP>`.

## 2. El proceso Node

Empaquetado con el `Dockerfile` de esta misma carpeta (`npm install` — el
`package-lock.json` está en `.gitignore` a nivel repo, así que un clon fresco
no lo trae, igual que en TraductivIA/Frontend — imagen `node:22-alpine`). No
hace falta `pm2` ni `systemd` — `restart: unless-stopped` en el
`docker-compose.yml` de despliegue cumple el mismo rol.

`AUDIT_BIND_HOST=0.0.0.0` se fija explícitamente en el `docker-compose.yml`
de despliegue (no en este repo) — ver el comentario en `index.js` para por
qué eso es seguro dentro de un contenedor sin puertos publicados.

## 3. TLS y ruteo

Automático vía Traefik + Let's Encrypt (HTTP-01), igual que el resto de la
VPS — sin `certbot` manual. Subdominio: `audit.test-gradus.tech` (ya resuelve
por el wildcard DNS `*.test-gradus.tech` existente, sin registro nuevo).

## 4. Firewall de la VPS

Sin cambios respecto al resto de la VPS — Traefik ya es lo único expuesto en
80/443. El puerto del Audit Service (4001) no se publica en absoluto (ni
siquiera a 127.0.0.1); solo Traefik lo alcanza, vía la red Docker interna.

## 5. App principal (servidor de la revista, en Render)

En las variables de entorno de Render (no en este repo):

```
AUDIT_SERVICE_URL=https://audit.test-gradus.tech
AUDIT_WRITE_TOKEN=<el mismo valor que AUDIT_WRITE_TOKEN_RL en la VPS>
```

`AUDIT_READ_TOKEN` **no** se configura en Render — la lectura de eventos se
hace directo contra la VPS, nunca a través de la app de la revista.

## 5.1 Multi-tenant — otras apps institucionales

El Audit Service no es exclusivo de RL. Cada app (Portal, SGI, Nuni,
TraductivIA) tiene su **propio** token de escritura
(`AUDIT_WRITE_TOKEN_<NOMBRE>` en el `.env` de la VPS — ver `.env.example` y
`utils/sources.js`), nunca comparten uno. El middleware determina de qué app
viene cada evento por **cuál token coincidió**, no por nada que el body del
request diga — así ninguna app puede reportar eventos a nombre de otra. Una
app sin su variable configurada todavía simplemente no puede autenticar; no
afecta a las demás.

Para dar de alta una app nueva: generar su token, agregarlo como
`AUDIT_WRITE_TOKEN_<NOMBRE>` en el `.env` de la VPS, recrear el contenedor
(`docker compose up -d --force-recreate audit-service`), y escribir un
cliente HTTP no bloqueante en el lenguaje de esa app (mismo patrón que
`api/utils/auditClient.js` de RL: `POST /events` con ese token, nunca hacer
fallar la petición de negocio si el Audit Service no responde). El campo
`source` en las lecturas (`GET /events?source=portal`) permite acotar por
app.

## 6. Consultar los eventos

Sigue sin existir un panel/dashboard para esto (decisión explícita: todo el
consumo de auditoría queda fuera de la app de la revista):

- Directo al endpoint: `curl -H "Authorization: Bearer <AUDIT_READ_TOKEN>" "https://audit.test-gradus.tech/events?limit=20"`
- O `mongosh`/Compass contra la base `audit` vía el túnel SSH del punto 1.
