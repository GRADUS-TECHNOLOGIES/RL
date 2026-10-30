# Revista Legislatura: preparación urgente

## Estado comprobado — 30 de octubre de 2026

- El dominio A apunta a 187.77.27.8. HTTP redirige a HTTPS; HTTPS entrega el certificado autofirmado predeterminado de Traefik y responde 404. El sitio aún no está publicado.
- Auditoría SSH de solo lectura con `jorge`: Docker 29.4.2, Compose 5.1.3, red externa `web`, arquitectura x86_64, 89 GB libres y 6.9 GiB de memoria disponible. Traefik usa `websecure` y resolver `le`; no se ha cambiado su configuración.
- En la red `web` hay otros contenedores, por tanto `TRUST_PROXY_HOPS=1` no está validado. Conservar 0 inicialmente evita aceptar cabeceras falsificadas, pero las peticiones aparecen bajo la IP de Traefik y el rate limit se comparte: es un riesgo operativo que debe resolverse.
- La URI Atlas configurada localmente autenticó y respondió ping a través de un túnel SSH por la VPS, con TLS validado; esto no demuestra que esa URI sea la misma de Render. Los endpoints públicos de Firebase son alcanzables desde la VPS, sin comprobar autenticación ni Storage.
- La base Atlas configurada localmente contiene cinco cuentas administrativas sin `firebaseUid`; no se encontró el índice único requerido. No se ha confirmado que sea la base usada por Render. No se han modificado datos.
- En GitHub no hay variables ni secretos Actions de RL configurados; el workflow del PR construyó una imagen desechable, pero la auditoría del cliente falla por cuatro entradas altas transitivas y no publicó imagen GHCR. No confundir ese build, que carece de la variable Firebase del repositorio, con una prueba funcional de Firebase.

## Requisitos antes de cualquier cambio

1. El propietario confirma en Render, de forma privada, que `MONGODB_URI`, `JWT_SECRET` y la API key pública de Firebase corresponden a las fuentes que se usarán. Mantener el mismo `JWT_SECRET` para preservar sesiones; nunca pegar valores en chat, logs o repositorio. Confirmar también `AUDIT_SERVICE_URL` y `AUDIT_WRITE_TOKEN` si la auditoría externa está habilitada.
2. El administrador y el operador confirman de forma independiente la cuenta Google auténtica, el UID de Firebase del proyecto existente y el `_id` de la cuenta administrativa existente en MongoDB. No identificarla ni vincularla exclusivamente por correo. Confirmar que el backup y la recuperación de Atlas existen.
3. Revisar el commit exacto, el estado de CI, el riesgo de dependencias reportado y los pasos de abajo. Merge, cambios de base y operaciones privilegiadas requieren autorizaciones explícitas. Mientras se autorice únicamente auditoría, no ejecutar bloques que crean archivos, contenedores, índices o documentos.

## Preparación separada de la identidad — requiere autorización sobre Atlas

La aplicación candidata exige un índice único parcial y un `firebaseUid` vinculado. El inicio de Google fallará para administradores anteriores si falta cualquiera de los dos. Antes de autorizar o ejecutar cambios, verificar el proyecto y la base de Render y consultar los duplicados, valores no string e índices con las consultas de solo lectura en `docs/security-hardening.md`. No modificar automáticamente duplicados.

Con autorización específica y después de revisar ese precheck, el operador puede crear exactamente el índice descrito en ese documento. A continuación, solo después de la verificación independiente de la identidad y de una autorización específica para la cuenta correspondiente, la operación propuesta en `mongosh` es:

```javascript
db.users.updateOne(
  { _id: ObjectId('<ID_MONGO_CONFIRMADO>'), isAdmin: true, firebaseUid: { $exists: false } },
  { $set: { firebaseUid: '<UID_FIREBASE_CONFIRMADO>' } }
)
```

Exigir `matchedCount: 1` y `modifiedCount: 1`. Si hay conflicto de índice, cuenta ya vinculada o resultado distinto, detenerse sin intentar reasignar ni crear otra cuenta. El comando conserva el rol y los demás campos. Sustituir los marcadores únicamente en una sesión administrativa privada; no compartir ID tokens o credenciales. La vinculación y creación de índice afectan a datos reales y **no han sido autorizadas ni ejecutadas**.

## Preparación de VPS — solo después de autorización

Los siguientes comandos son una propuesta revisable, **no ejecutada**. La creación bajo `/opt` requiere privilegios. Trabajar exclusivamente sobre el proyecto RL; no recrear otros proyectos ni modificar Traefik. Si cualquiera de las verificaciones falla, detenerse.

En la VPS, con `jorge`, crear el directorio y un directorio de código nuevo, comprobando que no existan:

```bash
test ! -e /opt/revista-legislatura || { echo 'Directorio existente: detenerse'; exit 1; }
sudo install -d -m 0700 -o jorge -g jorge /opt/revista-legislatura
mkdir -m 0700 /opt/revista-legislatura/source
```

En PowerShell del equipo con el repositorio, tras elegir y aprobar el SHA exacto del candidato:

```powershell
$shaRL = '<SHA_APROBADO>'
git cat-file -e "$shaRL^{commit}"
$archiveRL = Join-Path $env:TEMP "revista-$shaRL.tar"
git archive --format=tar --output=$archiveRL $shaRL
scp $archiveRL jorge@187.77.27.8:/opt/revista-legislatura/source.tar
ssh jorge@187.77.27.8 'tar -xf /opt/revista-legislatura/source.tar -C /opt/revista-legislatura/source'
```

El archivo de entorno real debe crearse mediante un editor privado en `/opt/revista-legislatura/app.env`, con `umask 077` y permisos 600. Contendrá, sin mostrarlos en pantalla compartida ni copiar al repositorio: `MONGODB_URI`, `JWT_SECRET`, `FIREBASE_PROJECT_ID=mern-blog-f33a3`, `NODE_ENV=production`, `PORT=3000`, `TRUST_PROXY_HOPS=0` y, si están configuradas en Render, `AUDIT_SERVICE_URL` y `AUDIT_WRITE_TOKEN`. Confirmar la correspondencia con Render antes de usar cualquier valor local. La API key `VITE_FIREBASE_API_KEY` es configuración pública del cliente, incorporada al bundle al construir; no incluir secretos de servidor como build args.

En la VPS, después de autorizar la construcción y habiendo preparado el archivo de entorno:

```bash
cd /opt/revista-legislatura/source
read -r -p 'SHA aprobado: ' RL_COMMIT
read -r -s -p 'VITE_FIREBASE_API_KEY: ' RL_FIREBASE_KEY; echo
docker build --build-arg VITE_FIREBASE_API_KEY="$RL_FIREBASE_KEY" -t "revista-legislatura:$RL_COMMIT" .
unset RL_FIREBASE_KEY
docker image inspect --format '{{.Id}}' "revista-legislatura:$RL_COMMIT"
```

Registrar SHA, ID y resultado de build. La etiqueta es mutable: volver a comparar su ID antes de usarla. Este build manual no representa una publicación GHCR por digest. La política CI existente sigue bloqueando la publicación automática por las alertas de cliente; requiere decisión explícita, no una excepción silenciosa.

## Prueba sin ruta pública — solo después de autorización

Tras verificar el índice y la vinculación autorizados y confirmar que el archivo de entorno apunta a la base correcta, se propone un contenedor temporal de RL sin puertos publicados y sin red `web`:

```bash
RL_IMAGE="revista-legislatura:$RL_COMMIT"
docker run -d --name rl-preflight --network bridge --restart no --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges --env-file /opt/revista-legislatura/app.env "$RL_IMAGE"
docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' rl-preflight
docker exec rl-preflight node -e 'Promise.all(["/healthz","/readyz","/api/user/test","/api/post/getposts?limit=1"].map(async p=>{const r=await fetch("http://127.0.0.1:3000"+p);console.log(p,r.status);if(!r.ok)process.exitCode=1})).catch(()=>process.exitCode=1)'
```

Esperar hasta 30 segundos si Atlas todavía está conectando y repetir la comprobación una sola vez. Las pruebas GET consultan artículos pero no los modifican. El código candidato configura `autoCreate=false` y `autoIndex=false` antes de cargar modelos. Este preflight no demuestra Google, Storage, cookies HTTPS ni permisos de administrador. Si falla, conservar el contenedor y los resultados para diagnóstico; no conectar Traefik ni modificar otros proyectos.

## Primer enlace a Traefik — autorización de despliegue separada

Solo después de aprobar los resultados anteriores, registrar el ID de la imagen y verificarlo de nuevo. Con el proyecto RL exclusivamente:

```bash
cd /opt/revista-legislatura/source
export RL_IMAGE="revista-legislatura:$RL_COMMIT"
export RL_ENV_FILE=/opt/revista-legislatura/app.env
export TRAEFIK_ENTRYPOINT=websecure
export TRAEFIK_CERT_RESOLVER=le
docker image inspect --format '{{.Id}}' "$RL_IMAGE"
docker compose config --quiet
docker compose up -d revista-app
docker compose ps
```

El `up` crea la ruta pública de RL y puede iniciar la emisión ACME; no ejecutar antes de la autorización de publicación. Verificar certificado y hostname sin `-k`, `/healthz`, `/readyz`, portada y consultas. El administrador debe comprobar Google, permisos y dashboard; una publicación solo debe crearse con el contenido y autorización del cliente, nunca como dato de prueba real.

## Recuperación

No existe una versión anterior de RL en esta VPS y la URL pública ya devuelve 404; no prometer rollback automático a Render. Si la activación falla, preservar logs sin secretos y el estado de RL, detener nuevas acciones y solicitar decisión. Solo con autorización para recuperación se puede detener exclusivamente el servicio `revista-app`; esto restaura el 404 de Traefik, no Render. No borrar volúmenes, imágenes ni recursos de otros proyectos, no modificar DNS o correo y no ejecutar limpiezas globales. Confirmar después el estado de los demás servicios frente al baseline.
