# SOA-Polleria (Don Belisario) - Orquestador y Microservicios

Este es el backend completo del sistema de gestión para Don Belisario, construido bajo una arquitectura orientada a microservicios con Spring Boot, Spring Cloud, Eureka y API Gateway.

## ⚠️ Requisitos Previos

Si deseas ejecutar el proyecto **de forma local sin Docker**, asegúrate de tener lo siguiente:

1. **Base de Datos (Neon PostgreSQL)**: Debes tener los archivos `.env` creados dentro de la carpeta de cada microservicio (`servicios/cocina/.env`, `servicios/usuarios/.env`, etc.) con las credenciales de tu base de datos en la nube.
2. **Redis**: Instalado y corriendo en el puerto `6379`. Es requerido por el BFF para el manejo de sesiones.
3. **Keycloak**: Instalado y corriendo en el puerto `9080` (Requerido para la seguridad y autenticación OAuth2).

## 🚀 Cómo ejecutar el proyecto (Orden Estricto)

Dado que los microservicios dependen de una infraestructura núcleo (Core), **el orden de encendido es obligatorio**. Si enciendes un servicio antes que su dependencia, fallará.

### Ejecución Manual desde el IDE (IntelliJ, Eclipse, VSCode)
Si prefieres correrlos uno por uno dando clic a "Run", sigue este orden exacto. *(Asegúrate de configurar tu IDE para que lea los archivos `.env` de cada proyecto, por ejemplo usando el plugin EnvFile en IntelliJ)*:

1. **Discovery Server (Eureka)** -> Puerto `8761`
2. **Config Server** -> Puerto `8888`
3. **API Gateway** -> Puerto `8889`
4. **BFF (Backend for Frontend)** -> Puerto `7443`
5. **Microservicios (El orden entre estos no importa):**
   - Servicio Usuarios -> `8081`
   - Servicio Clientes -> `8082`
   - Servicio Mesas -> `8083`
   - Servicio QR -> `8084`
   - Servicio Ventas -> `8085`
   - Servicio Cocina -> `8086`
   - Servicio Inventario -> `8087`
   - Servicio Finanzas -> `8088`

## 🔑 Notas sobre el Inicio de Sesión
El servicio de `usuarios` se conecta a la base de datos `usuarios_db` en Neon para verificar tus credenciales. 
* Si recibes el error **"Error al iniciar sesión"**, significa que el correo y la contraseña que estás ingresando **no existen en la base de datos**.
* **Solución**: Antes de intentar entrar a la cocina, haz clic en el botón de **"Regístrate aquí"** en la pantalla de login del frontend (`http://localhost:4200/login`) y crea tu usuario (ej. `jefe.cocina@donbelisario.com` con rol `COCINA`). Una vez registrado, el login funcionará perfectamente.
