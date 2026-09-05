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

- `/`: pagina principal.
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

La pestana Operacion muestra metricas agregadas, cobertura de perfiles, presupuesto de IA y ledger de migraciones. Usuarios incorpora busqueda, filtro, paginacion, cobertura clinica y gestion protegida de roles. Catalogos clinicos permite crear, editar, activar y desactivar objetivos y condiciones. Reglas permite gestionar criterios nutricionales y restricciones sin eliminar historial. Uso de IA muestra solicitudes, tokens, costos y fallos, con la politica de limites en modo de solo lectura. Recetas e ingredientes conservan sus pestanas de gestion; todas estas operaciones requieren JWT y rol administrativo verificado en backend.

Recetas publicas usan paginacion incremental. La seleccion de restricciones del perfil incorpora busqueda y paginas sin perder selecciones. En administracion, recetas, ingredientes y restricciones incluyen busqueda y paginacion de servidor; ingredientes tambien se filtran y editan por grupo alimentario.

El formulario administrativo de recetas consulta ingredientes en paginas de 12, permite buscarlos y conserva los IDs seleccionados al cambiar de pagina.

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

Registro y restablecimiento comparten una guia visual de contrasena. Se exigen entre 10 y 72 caracteres, mayuscula, minuscula, numero y simbolo; el boton permanece deshabilitado hasta cumplir la politica y el backend vuelve a validarla.

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

Actualmente `lint` puede mostrar advertencias de hooks en algunas paginas existentes, pero no bloquea el build.

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
