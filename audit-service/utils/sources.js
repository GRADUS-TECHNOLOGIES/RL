// Lista única de apps institucionales que pueden mandar eventos — fuente de
// verdad compartida entre el modelo (validación del campo `source`) y el
// middleware de auth (qué variable de entorno de token corresponde a cada
// una). Agregar una app nueva es agregar una línea aquí + su variable
// AUDIT_WRITE_TOKEN_<NOMBRE> en el .env del despliegue.
export const AUDIT_SOURCES = ['rl', 'portal', 'sgi', 'nuni', 'traductivia'];
