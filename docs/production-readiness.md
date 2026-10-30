# Preparación de producción — pendiente de validación

## Seguridad y compatibilidad

Google usa Firebase Admin con el proyecto configurado en FIREBASE_PROJECT_ID. Solo usuarios que ya tengan firebaseUid vinculado pueden entrar con ese UID. Las cuentas existentes sin vínculo quedan bloqueadas para Google y deben usar su contraseña; si no tienen contraseña conocida es necesario diseñar una recuperación y vinculación autenticada, sin asociar automáticamente por correo. Se agregó un mecanismo de vinculación que requiere contraseña y token Firebase reciente; permanece bloqueado hasta crear el índice único conforme a docs/security-hardening.md. No desplegar hasta acordar y probar esta transición. La creación normal de usuarios Google nuevos continúa modificando MongoDB durante su uso normal; las pruebas automatizadas no usan bases reales.

`/healthz` mide el proceso; `/readyz` requiere conexión MongoDB. Se desactiva autoIndex para que el inicio no modifique índices existentes. No ejecutar scripts de migración. La prueba de readiness no garantiza que las consultas tengan permisos.

TRUST_PROXY_HOPS=0 por defecto. Si se usa 1, cualquier contenedor con acceso directo a la red web puede falsificar la IP. Antes de activarlo, verificar acceso exclusivo al backend y sanitización de cabeceras en Traefik y todos los proxies anteriores; el compose propuesto no garantiza ese aislamiento. Mientras tanto los límites agrupan clientes bajo la IP del proxy. No habilitar 1 en producción sin resolverlo.

## Variables

Servidor: MONGODB_URI, JWT_SECRET, FIREBASE_PROJECT_ID, NODE_ENV=production, PORT, TRUST_PROXY_HOPS, AUDIT_SERVICE_URL y AUDIT_WRITE_TOKEN. El archivo env real se crea fuera del repositorio con permisos restrictivos. Conservar los valores existentes de JWT y Atlas. Firebase Admin verifica tokens públicos con project ID, sin incluir clave privada de servicio. El build requiere VITE_FIREBASE_API_KEY, configuración pública del cliente que quedará incorporada en el bundle. Compose necesita RL_IMAGE por digest, RL_ENV_FILE, TRAEFIK_ENTRYPOINT y TRAEFIK_CERT_RESOLVER. No incluir secretos en build args.

## Limitaciones y plan de despliegue

Confirmar red web, entrypoint, resolver, capacidad de VPS, reglas de firewall y arquitectura de IMEPOL mediante inspección de solo lectura. Confirmar IP de salida y lista de Atlas, dominios autorizados y reglas Storage en Firebase; comprobar el servicio externo de auditoría. Probar en un entorno aislado sin documentos ni usuarios de producción. Docker no publica puertos. Antes del corte, probar Host/SNI con curl --resolve usando HTTPS solo cuando exista un certificado válido; el enrutamiento con Host HTTP requiere el entrypoint HTTP existente y configuración adicional que aún no se conoce.

Tras autorización separada: crear directorio dedicado y env protegido, seleccionar imagen verificada por digest, validar compose, desplegar solamente el proyecto RL y comprobar healthz, readyz, frontend, autenticación y servicio de auditoría. Cambiar DNS solo después de superar pruebas y comprobar HTTPS con el dominio real. Confirmar que los otros proyectos mantienen su estado.

## CD y recuperación

CD aún es diseño, no está habilitado. Requiere identidad y usuario SSH exclusivos, GitHub Environment con aprobación, OIDC para atestación/autorización, verificación de procedencia y digest, validación de que el commit siga siendo HEAD de main, concurrencia serializada y helper dedicado de alcance mínimo. Guardar digest y configuración anterior de RL; si falla readiness, restaurar únicamente ese digest, volver a comprobar y alertar. Conservar Render y DNS anterior hasta aceptar el corte; no revertir ni restaurar datos de Atlas/Firebase. Evitar despliegues automáticos hasta que este mecanismo sea implementado y auditado.

## Auditoría de dependencias

El backend fue actualizado; el cliente conserva vulnerabilidades altas, incluyendo PDF.js. CI falla deliberadamente ante auditorías altas; no publicar hasta resolverlas. Los cambios mayores en editor/PDF requieren pruebas funcionales y de seguridad antes de adoptarse. No se ha validado la imagen ni la ausencia de secretos mediante escaneo.


## Fase 3 — hallazgos y bloqueos

Se retiraron los paquetes `@react-pdf-viewer` porque no se importan, se actualizó PDF.js a 4.10.38 y se empaqueta su worker correspondiente, en lugar de cargar el worker 2.16.105 desde un CDN. Firebase se actualizó a la rama 12. La actualización automática notificó todavía 6 vulnerabilidades altas y 35 moderadas: el gate de CI permanece activo. El PDF debe probarse en navegadores reales, así como Firebase Authentication y Storage; la compilación no demuestra compatibilidad funcional.

La vinculación exige sesión propia, contraseña actual, token Firebase reciente y el índice único documentado en docs/security-hardening.md. El índice debe revisarse y crearse por separado; no se ha modificado la base real.

El entorno real de Traefik no se ha inspeccionado. La red web compartida no garantiza exclusividad y no es seguro confiar en un salto sin comprobar restricciones y sanitización; las pruebas de cookies, rate limit e IP reales siguen pendientes. El despliegue y rollback automatizados no están implementados. No activar CD, publicar ni desplegar mientras estas condiciones no se validen.
