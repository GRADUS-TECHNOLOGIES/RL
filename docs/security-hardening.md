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

## Auditoría de cliente — fase 3.2

Se examinó código, configuración, plugins y árbol instalado. No se usa Firestore, `@firebase/firestore` ni `@grpc/grpc-js` directamente: el paquete público `firebase` instala Firestore y éste declara `@grpc/grpc-js` con rango `~1.9.0`, aunque la app utiliza solamente Authentication y Storage. La última versión oficial examinada de Firebase (13.1.0) aún exige ese rango. El equipo de Firebase indica que `@firebase/auth` no está destinado al uso directo: https://github.com/firebase/firebase-js-sdk/blob/main/packages/auth/README.md . Se conserva el SDK oficial y no se fuerza un override incompatible. La alerta de gRPC se refiere a un caso de autenticación de certificados en servidor; este proyecto no importa Firestore. Esto no sustituye una evaluación formal de exposición.

Flowbite React se usaba para el menú de usuario, avatar y dos botones, además de plugins de Vite y Tailwind. Se sustituyeron por Radix UI Dropdown Menu y enlaces con clases equivalentes; se retiraron los plugins y paquetes `flowbite` y `flowbite-react`. El menú mantiene perfil, cierre de sesión, navegación por teclado y cierre por Escape. Se añadieron pruebas de regresión de componentes. La revisión visual en navegadores reales sigue pendiente.

Las cuatro entradas altas restantes son `@grpc/grpc-js` (1.9.16; corregido en 1.13.6), `@firebase/firestore`, `@firebase/firestore-compat` y `firebase`, que propagan esa vulnerabilidad. No se ha encontrado una versión oficial compatible que elimine la cadena. No se desactiva ni exceptúa el gate de `npm audit`. Revisar las versiones concretas y resultados del runner antes de considerar producción.

## Pruebas y límites

Las pruebas locales incluyen contraseñas, sesión, rechazo de rol no administrador, Firebase Admin con token de otro proyecto, políticas de vinculación y PDF. La simulación unitaria de colisiones no demuestra por sí sola el índice MongoDB; CI incluye una prueba con MongoDB aislado y peticiones simultáneas. Se requiere validar visualmente Google y PDF en navegador, Firebase real de prueba y el estado final del runner. No se verifica revocación de Firebase ID tokens en este flujo; expiración y `auth_time` limitan su antigüedad.
