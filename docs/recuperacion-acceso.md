# Recuperación de acceso

Las cuentas creadas históricamente con Google podían recibir una contraseña aleatoria que el usuario nunca conoció. El acceso actual requiere un UID de Firebase vinculado y verificado; el correo coincidente no prueba el control de la cuenta. Un usuario con contraseña válida puede entrar y vincular Google en su perfil usando la contraseña y una autenticación reciente de Google.

No hay un proveedor de correo de recuperación configurado. No se emiten códigos automáticamente a partir de correos. Para una cuenta sin contraseña utilizable:

1. Un operador autorizado identifica el documento correcto y verifica independientemente la identidad del titular por un canal confiable. Confirma respaldo y obtiene autorización expresa para modificar **esa cuenta**. El correo coincidente, por sí solo, no basta. No se debe compartir el ID ni el código en chats, tickets o registros.
2. En la VPS, con acceso autorizado al contenedor de Revista Legislatura y al Atlas correcto, ejecuta interactivamente `docker exec -it revista-legislatura-revista-app-1 node api/scripts/issue-recovery-code.js --issue`. Introduce el ID de la cuenta identificada y confirma `AUTORIZO`. Esta operación agrega un verificador y su vencimiento a ese documento; no cambia la contraseña, el UID ni el rol. No reemplaza un código vigente.
3. Entrega el código solo al titular mediante un canal privado cuya identidad haya sido comprobada independientemente. El código vence en 15 minutos. El titular visita `/recuperar-acceso`, introduce el código y establece su propia contraseña. El operador nunca necesita conocerla.
4. El titular inicia sesión y, para vincular Google, abre su perfil y usa **Vincular cuenta de Google**. Debe introducir su contraseña y autenticar Google nuevamente. El backend verifica el token Firebase y el índice único antes de vincular.

Si hay error o resultado incierto, no repetir automáticamente: comprobar el estado sin mostrar datos sensibles. Un código solo puede consumirse una vez, incluso bajo peticiones simultáneas. La recuperación invalida el código, pero **las sesiones JWT emitidas anteriormente no se revocan** y pueden permanecer activas hasta siete días; si existe sospecha de compromiso, el incidente requiere una respuesta separada antes de recuperar la cuenta.

La ruta de recuperación aplica el límite de intentos existente y no revela si existe un correo. El límite de la configuración actual puede compartirse entre usuarios detrás de Traefik. La herramienta de emisión debe ejecutarse solo después de desplegar y verificar la versión que la incluye y de recibir autorización para la cuenta específica. Nunca se debe ejecutar para probarla con cuentas reales.
