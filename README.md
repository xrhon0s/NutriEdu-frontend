# NutriEdu Frontend

Aplicacion web de NutriEdu construida con React y Vite. Es la interfaz que permite registrarse, iniciar sesion, configurar restricciones, consultar recetas seguras, planificar comidas, generar lista de compras y usar el panel administrativo.

## Tecnologias

- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

## Estructura

```txt
nutriedu-frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── AdminPanel/
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Planner.jsx
│   │   ├── Profile.jsx
│   │   ├── RecipeDetail.jsx
│   │   ├── Recipes.jsx
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   └── ShoppingList.jsx
│   ├── services/
│   │   └── api.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Instalacion

```bash
cd nutriedu-frontend
npm install
npm run dev
```

URL local por defecto:

```txt
http://localhost:5173
```

El backend esperado esta configurado en [src/services/api.jsx](src/services/api.jsx). En local usa:

```txt
http://localhost:3000/api
```

En despliegue usa la variable:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

## Rutas

Rutas publicas:

- `/`: pagina principal publica; con una sesion activa redirige a `/recipes`.
- `/register`: registro de usuario.
- `/login`: inicio de sesion.
- `/forgot-password`: solicitud de correo para recuperar contrasena.
- `/reset-password?token=...`: formulario para crear una nueva contrasena.

Rutas privadas:

- `/profile`: configuracion de restricciones alimentarias.
- `/recipes`: recetas seguras y recomendadas.
- `/recipes/:id`: detalle de receta.
- `/planner`: planificador semanal.
- `/shopping-list`: lista de compras generada desde el plan.

Ruta administrativa:

- `/admin/recipes`: panel administrativo para usuarios con rol `administrador`.

El panel usa una navegacion lateral persistente en escritorio y un selector compacto en mobile. La seccion Operacion muestra metricas agregadas, cobertura de perfiles, presupuesto de IA, ledger de migraciones y cinco indicadores accionables de calidad del catalogo. Estos indicadores enlazan con recetas o ingredientes para completar nutrientes, revision, cantidades, grupos alimentarios y grupos de sustitucion. Usuarios incorpora busqueda, filtro, paginacion, cobertura clinica y gestion protegida de roles. Catalogos clinicos permite crear, editar, activar y desactivar objetivos y condiciones. Reglas permite gestionar criterios nutricionales y restricciones sin eliminar historial. Uso de IA muestra solicitudes, tokens, costos y fallos, con la politica de limites en modo de solo lectura. Todas estas operaciones requieren JWT y rol administrativo verificado en backend.

Recetas publicas usan paginacion incremental. La vista inicial muestra seis recomendaciones ordenadas por el perfil, equivalentes a dos filas de tres tarjetas en escritorio; las busquedas mantienen paginas de 12 resultados. Cada recomendacion muestra afinidad, una razon principal y avisa cuando faltan datos nutricionales. La seleccion de restricciones del perfil incorpora busqueda y paginas sin perder selecciones. En administracion, recetas, ingredientes y restricciones incluyen busqueda y paginacion de servidor; ingredientes tambien se filtran y editan por grupo alimentario.

La base UI web usa tokens semanticos en `index.css` y componentes compartidos para shell, encabezados, botones, paginacion, mensajes y estados vacios. La navegacion autenticada ofrece menu responsive accesible hasta 1024 px. Recetas usa filtros etiquetados, tarjetas compactas con iconos Lucide, skeletons y reintento explicito de recomendaciones.

El detalle de receta separa compatibilidad, descripcion, datos por porcion e ingredientes reales. Consulta en paralelo la receta, sus ingredientes y la seguridad del usuario; muestra los nutrientes ausentes como pendientes y ofrece reintento ante errores. El modal de alternativas es informativo: cerrar o revisar una alternativa no modifica la receta ni elimina su alerta. El backend solo devuelve opciones seguras con la misma funcion culinaria; cuando no existe una alternativa cercana, la interfaz lo indica sin mostrar ingredientes arbitrarios.

El planificador presenta 21 espacios semanales, selector compacto, progreso y estado de guardado. Los espacios vacios llevan el dia y la comida al formulario, y cualquier cambio local se identifica como pendiente hasta recibir confirmacion del backend. Si una receta previamente guardada deja de ser compatible por cambios en el perfil, debe retirarse antes de guardar; las sustituciones todavia no se persisten en el modelo de datos.

La lista de compras usa el plan guardado para agrupar ingredientes por familia alimentaria, agregar cantidades disponibles y mostrar las recetas de origen. Su progreso se guarda con una clave compuesta por usuario y firma del plan, por lo que un cambio de semana no reutiliza selecciones obsoletas. Incluye modos para todos o solo pendientes, actualización, reinicio confirmado, skeleton, vacío, error y reintento. Las cantidades ausentes se presentan como pendientes de catálogo, nunca como valores estimados.

El perfil de salud se divide en datos personales, objetivos, salud/restricciones y metas nutricionales. Un resumen cuantifica el contexto disponible; los objetivos muestran su prioridad real, las restricciones conservan busqueda y paginacion, y los 13 limites diarios se agrupan en energia, macronutrientes y limites especificos. Cada seccion mantiene su guardado independiente y la carga ofrece skeleton, error y reintento.

Login, registro y recuperacion comparten un layout sobrio, campos etiquetados, progreso de envio y mensajes semanticos. Los campos de contrasena incluyen controles accesibles para mostrar u ocultar su contenido; registro y restablecimiento exigen confirmacion coincidente. Un enlace de recuperacion sin token valido no muestra el formulario, y un fallo al consultar el perfil despues de autenticar ya no se presenta como un login fallido. El logo de la navegacion autenticada vuelve a `/recipes` y nunca elimina la sesion; solo `Cerrar sesion` borra el token y el usuario almacenados.

El formulario administrativo de recetas consulta ingredientes en paginas de 12, permite buscarlos y conserva los IDs seleccionados al cambiar de pagina. Tambien captura nutrientes por porcion, tamano de porcion, numero de porciones y procedencia. La migracion backend `010_recipe_nutrition_provenance.sql` requerida por estos campos esta aplicada y verificada en Supabase.

La vista de recetas administrativas incorpora importacion JSON en dos pasos. Primero descarga o selecciona `example.catalog.json` y solicita una vista previa con conteos, errores y advertencias. El boton de importacion solo se habilita si el backend aprueba la previsualizacion y exige confirmacion antes de escribir. Ingredientes permite asignar y filtrar tanto el grupo alimentario como el grupo de sustitucion culinaria. Las migraciones backend `010`, `011` y `012` requeridas por este flujo estan aplicadas y verificadas en Supabase.

## Flujo de autenticacion

1. El usuario inicia sesion en `/login`.
2. El frontend envia credenciales a `POST /api/users/login`.
3. El backend devuelve `token` y `user`.
4. El frontend guarda ambos en `localStorage`.
5. `ProtectedRoute` bloquea vistas privadas cuando no hay usuario autenticado.
6. `api.jsx` agrega automaticamente `Authorization: Bearer <token>`.

El backend obtiene el usuario autenticado desde el JWT. El frontend ya no envia `x-user-id`.

## Recuperacion de contrasena

1. El usuario abre `/forgot-password`.
2. Ingresa su correo.
3. El backend envia un correo con Resend.
4. El enlace apunta a `/reset-password?token=...`.
5. El usuario escribe una nueva contrasena.
6. El frontend envia `token` y `password` a `POST /api/users/reset-password`.

Registro y restablecimiento comparten una guia visual y confirmacion de contrasena. Se exigen entre 10 y 72 caracteres, mayuscula, minuscula, numero y simbolo; el boton permanece deshabilitado hasta cumplir la politica, ambas entradas deben coincidir y el backend vuelve a validar la credencial autoritativamente.

## Paginas principales

- `Home.jsx`: portada y navegacion inicial.
- `Register.jsx`: registro de usuarios.
- `Login.jsx`: autenticacion y enlace de recuperacion.
- `ForgotPassword.jsx`: solicitud de correo de recuperacion.
- `ResetPassword.jsx`: cambio de contrasena con token.
- `Profile.jsx`: seleccion de restricciones alimentarias.
- `Recipes.jsx`: listado de recetas seguras/recomendadas.
- `RecipeDetail.jsx`: detalle y validacion de seguridad de receta.
- `Planner.jsx`: planificador semanal de desayuno, almuerzo y cena.
- `ShoppingList.jsx`: ingredientes necesarios segun el plan semanal.
- `AdminPanel/*`: gestion administrativa.

## Componentes compartidos

- `NavBar`: navegacion principal.
- `Footer`: pie de pagina compartido en vistas principales.
- `AuthLayout`: layout reutilizable para login, registro y recuperacion de contrasena.
- `ProtectedRoute`: proteccion de rutas privadas.
- `StatusMessage`: mensajes de exito/error.
- `Button`: acciones primarias, secundarias y de riesgo.
- `PageHeader`: titulo, contexto y acciones de pagina.
- `Pagination`: navegacion paginada accesible, incremental o con total de paginas.
- `LoadingScreen`: pantalla de carga.
- `EmptyState`: estado vacio reutilizable.
- `ConfirmModal`: confirmaciones.
- `UnsafeIngredientModal`: muestra ingredientes no seguros y sustitutos.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Verificacion rapida

```bash
npm run lint
npm run build
```

La verificacion actual exige que `lint` termine sin errores ni advertencias y que el build de produccion finalice correctamente.

## Despliegue en Vercel

Configuracion recomendada:

```txt
Framework Preset: Vite
Root Directory: nutriedu-frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Variable de entorno:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

Despues de desplegar el frontend, agrega su URL en el backend como `FRONTEND_URL` para que CORS permita las solicitudes desde Vercel.

## Notas de desarrollo

- Si Vite muestra errores de WebSocket/HMR, reinicia `npm run dev` y haz hard refresh del navegador.
- Si `localhost:5173` queda en estado raro, prueba ejecutar Vite con host explicito:

```bash
npm run dev -- --host 127.0.0.1
```

- Las transiciones entre paginas estan configuradas en `App.jsx` y `App.css`.

Proyecto desarrollado por David Sanchez, Nerver Fernandez y Sebastian Marquez.
