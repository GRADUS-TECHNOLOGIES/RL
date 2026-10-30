# Seguridad: vinculación Firebase y dependencias

## Vinculación de cuentas

`POST /api/auth/link-google` exige JWT propio, contraseña actual y token de Google firmado para el proyecto Firebase configurado, con `auth_time` de máximo cinco minutos. No se decide la vinculación por email. Se aplica limitación a intentos y se asigna el UID mediante una actualización condicional atómica; cambios concurrentes de contraseña, repetición y UID ya utilizado producen conflicto. No se modifican roles. La verificación de Firebase Admin valida firma, vencimiento, emisor y audiencia; la prueba con token de otro proyecto usa el SDK real. Las pruebas unitarias usan identidades ficticias.

Tanto la vinculación como el inicio de sesión Google fallan de forma cerrada hasta que exista el índice único exacto descrito abajo. La aplicación no crea índices automáticamente. Por tanto, no habilitar esta versión en producción sin completar la preparación separada. No hay recuperación para usuarios que no conozcan la contraseña local: requiere un proceso independiente, sin asociar cuentas por correo.

## Índice: precheck y operación separada

No ejecutar durante CI ni sobre la base real durante la auditoría. Antes de una operación de producción autorizada, confirmar base y colección (`users`), hacer respaldo y revisar la salida de consultas de solo lectura en una sesión administrativa aislada:

```javascript
db.users.aggregate([{ $match: { firebaseUid: { $type: 'string' } } }, { $group: { _id: '$firebaseUid', count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]);
db.users.aggregate([{ $match: { firebaseUid: { $exists: true, $not: { $type: 'string' } } } }, { $count: 'nonStringUids' }]);
db.users.getIndexes();
```

Detener la operación si hay duplicados, valores no esperados, collation o índices conflictivos; investigar y resolver por un procedimiento aprobado, sin borrar o reasignar identidades automáticamente. Una vez revisado y autorizado por separado, la operación prevista es:

```javascript
db.users.createIndex({ firebaseUid: 1 }, { name: 'firebase_uid_unique', unique: true, partialFilterExpression: { firebaseUid: { $type: 'string' } } });
```

Comprobar el índice con `getIndexes()`; una falla por duplicados exige detenerse. El precheck no impide carreras durante su ejecución: el índice único es la garantía final. Asegurar que ningún proceso retire el índice mientras la aplicación esté activa. No se ejecutó ninguna de estas operaciones en Atlas.

## Auditoría de cliente

`npm audit` informa 45 paquetes afectados: 6 altos, 35 moderados y 4 bajos. Las seis entradas altas representan dos vulnerabilidades raíz y sus dependientes:

| Entrada | Versión | Introducción / acción |
|---|---|---|
| `@grpc/grpc-js` | 1.9.16 | Firebase → Firestore 4.17.2; GHSA-m9gg-hp2v-232j, posible aceptación indebida de certificados en determinadas configuraciones de servidor. Corregido desde 1.13.6, fuera del rango `~1.9.0` declarado por Firestore. El código de la revista no importa Firestore, pero el paquete de Firebase lo incluye en el árbol. |
| `@firebase/firestore` | 4.17.2 | Dependiente de gRPC; requiere versión de Firebase/Firestore que acepte la corrección o sustitución compatible del SDK. |
| `@firebase/firestore-compat` | 0.4.14 | Dependiente de Firestore, incluida por `firebase`. |
| `firebase` | 12.19.0 | Propaga las alertas anteriores. No se ha validado una sustitución compatible para Authentication y Storage. |
| `deepmerge-ts` | 7.1.4 | `flowbite-react`; GHSA-ggr8-5vv4-36mx, agotamiento de pila con grafos recursivos. Corregido en 8.0.0; se necesita una versión compatible de Flowbite o reemplazar sus componentes y plugin. |
| `flowbite-react` | 0.11.9 | Depende de deepmerge-ts; se utiliza en la interfaz y en los plugins de build. |

El auditor sugiere retrocesos mayores de Firebase y Flowbite, que no se han aplicado ni verificado. No se ha forzado un override fuera de rango. La aplicabilidad real debe evaluarse en cada flujo; no equivale a una explotación demostrada. El gate `npm audit --audit-level=high` permanece activo y bloquea publicación. `main` no tiene protección de rama verificable mediante el endpoint consultado: los checks no están configurados como obligatorios. La configuración de esa protección no se cambió.

## Pruebas y límites

Las pruebas locales incluyen contraseñas, sesión, rechazo de rol no administrador, Firebase Admin con token de otro proyecto, políticas de vinculación y PDF. La simulación unitaria de colisiones no demuestra por sí sola el índice MongoDB; CI incluye una prueba con MongoDB aislado y peticiones simultáneas. Se requiere validar visualmente Google y PDF en navegador, Firebase real de prueba y el estado final del runner. No se verifica revocación de Firebase ID tokens en este flujo; expiración y `auth_time` limitan su antigüedad.
