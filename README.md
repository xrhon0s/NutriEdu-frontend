# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 🎨 NutriEdu Frontend

Aplicación web desarrollada con React y Vite para la interfaz de usuario de NutriEdu.

---

## 🧠 Descripción

El frontend de NutriEdu permite a los usuarios interactuar con la plataforma mediante una interfaz web moderna y sencilla.

Actualmente incluye funcionalidades para:

- visualizar la página principal
- registrarse en la plataforma
- iniciar sesión
- conectarse con el backend mediante peticiones HTTP
- almacenar el token de autenticación en el navegador

---

## 🛠️ Tecnologías utilizadas

- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

---

## 📦 Estructura del proyecto

```bash
src/
├── assets/
├── components/
│   └── navBar.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── services/
│   └── api.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx
🔀 Rutas del frontend

La aplicación utiliza React Router para definir las vistas principales:

/ → página principal

/login → inicio de sesión

/register → registro de usuario

📄 Páginas principales
Home

Pantalla de bienvenida de la plataforma.

Funciones:

presentar el propósito de NutriEdu

permitir navegación hacia login y registro

Login

Pantalla para autenticación de usuarios.

Funciones:

capturar email y contraseña

enviar solicitud al backend

guardar el token recibido en localStorage

Endpoint consumido:

POST /api/users/login

Register

Pantalla para registrar nuevos usuarios.

Funciones:

capturar nombre, email y contraseña

validar formato básico del correo

enviar solicitud al backend

Endpoint consumido:

POST /api/users/register

🌐 Comunicación con el backend

La aplicación se comunica con el backend mediante Axios.

Backend esperado:

http://localhost:3000

Endpoints usados actualmente:

POST /api/users/register

POST /api/users/login

🔐 Manejo de autenticación

El flujo actual de autenticación es:

el usuario ingresa sus credenciales

el frontend envía la solicitud al backend

el backend valida los datos y devuelve un token JWT

el frontend guarda el token en localStorage

Este mecanismo permite mantener la sesión del usuario en el navegador.

⚙️ Instalación y ejecución
Instalar dependencias
npm install
Ejecutar en modo desarrollo
npm run dev
Abrir en navegador
http://localhost:5173
📌 Estado actual del frontend
✅ Implementado

landing page

formulario de login

formulario de registro

navegación con React Router

conexión con backend

almacenamiento de token en navegador

🚧 Pendiente

pantalla para seleccionar restricciones

vista de recetas seguras

vista de recetas recomendadas

protección de rutas privadas

cierre de sesión

manejo visual de errores

centralización de llamadas API en services/api.jsx

uso de componentes reutilizables como navbar

💡 Mejoras recomendadas

crear un servicio centralizado para Axios

implementar contexto de autenticación

proteger rutas con validación de token

agregar redirección después del login

reemplazar alert() por mensajes visuales

crear componentes reutilizables

mejorar experiencia de usuario

🧩 Relación con el resto del sistema

El frontend consume la API del backend y permite al usuario interactuar con la lógica del sistema sin acceder directamente a la base de datos.