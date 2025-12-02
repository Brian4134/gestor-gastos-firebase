# 💰 Gestor de Gastos - Firebase

Sistema web completo para la gestión de gastos e ingresos personales desarrollado con Node.js, Express y Firebase Firestore.

## ✨ Características

- 🔐 **Autenticación**: Login con email/contraseña y Google OAuth
- 👥 **Roles de Usuario**: Administrador y Usuario regular
- 💸 **Gestión de Transacciones**: CRUD completo de gastos e ingresos
- 📊 **Reportes y Gráficos**: Visualización de datos con Chart.js
- 🏷️ **Categorías Personalizables**: Gestión de categorías por el administrador
- 📱 **Responsive**: Diseño adaptable con Bootstrap 5
- 🔥 **Firebase**: Base de datos en tiempo real con Firestore

## 🚀 Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **Frontend**: EJS + Bootstrap 5 + Chart.js
- **Iconos**: Bootstrap Icons

## 🔧 Configuración de Firebase

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Firestore Database**:
   - Ve a "Build" → "Firestore Database"
   - Clic en "Create database"
   - Selecciona modo de producción o prueba
4. Habilita **Authentication**:
   - Ve a "Build" → "Authentication"
   - Clic en "Get started"
   - Habilita el proveedor "Email/Password"

### 2. Obtener Credenciales

1. En Firebase Console, ve a "Project Settings" (⚙️)
2. Ve a la pestaña "Service accounts"
3. Clic en "Generate new private key"
4. Descarga el archivo JSON

### 3. Configurar Variables de Entorno

**Opción A: Usar archivo JSON (Recomendado para desarrollo)**

1. Guarda el archivo JSON descargado en la raíz del proyecto como `firebase-credentials.json`
2. Crea un archivo `.env` basado en `.env.example`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
   SESSION_SECRET=tu_secreto_de_sesion_aqui
   ```

**Opción B: Usar variables individuales (Recomendado para producción)**

1. Abre el archivo JSON descargado
2. Crea un archivo `.env` con:
   ```env
   FIREBASE_PROJECT_ID=tu-proyecto-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto-id.iam.gserviceaccount.com
   SESSION_SECRET=tu_secreto_de_sesion_aqui
   ```

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 🔄 Migración de Datos (Opcional)

Si tienes datos existentes en MySQL que deseas migrar a Firebase:

1. Asegúrate de tener MySQL configurado y accesible
2. Agrega las variables de MySQL al `.env`:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASS=
   MYSQL_DB=gestor_gastos
   ```
3. Ejecuta el script de migración:
   ```bash
   npm run migrate
   ```

**Nota:** Los usuarios migrados tendrán una contraseña temporal `TempPassword123!` y deberán cambiarla.

## 📁 Estructura del Proyecto

```
gestor_gastos/
├── src/
│   ├── config/
│   │   └── firebase.js          # Configuración de Firebase
│   ├── controllers/
│   │   ├── authController.js    # Autenticación
│   │   └── gastoController.js   # CRUD de gastos
│   ├── models/
│   │   ├── db.js                # Exporta instancia Firestore
│   │   ├── usuarioModel.js      # Modelo de usuarios
│   │   └── gastoModel.js        # Modelo de gastos
│   ├── middlewares/
│   │   └── authMiddleware.js    # Middleware de autenticación
│   └── routes/
│       └── gastoRoutes.js       # Rutas de la aplicación
├── views/                        # Vistas EJS
├── public/                       # Archivos estáticos
├── .env                          # Variables de entorno (NO SUBIR A GIT)
├── .env.example                  # Ejemplo de variables
├── .gitignore                    # Archivos ignorados
├── migrate-data.js               # Script de migración (opcional)
├── package.json
└── server.js                     # Servidor Express
```

## 🔐 Usuarios y Roles

El sistema maneja dos tipos de usuarios:

- **Admin**: Acceso al dashboard y todas las funcionalidades
- **Usuario**: Acceso a gestión de gastos y reportes

## 🚀 Funcionalidades

- ✅ Autenticación con Firebase Authentication
- ✅ Registro de usuarios
- ✅ CRUD de gastos e ingresos
- ✅ Categorización de transacciones
- ✅ Reportes con gráficos circulares
- ✅ Resumen de ingresos vs gastos
- ✅ Roles de usuario (Admin/Usuario)

## 🔒 Seguridad

- Las contraseñas se hashean con bcrypt
- Firebase Authentication maneja la autenticación
- Sesiones seguras con express-session
- Credenciales protegidas en `.env`
- Validaciones en modelos y controladores

## 📝 Notas Importantes

- **NO** subas el archivo `.env` ni `firebase-credentials.json` a Git
- Cambia `SESSION_SECRET` en producción
- Configura reglas de seguridad en Firestore Console
- Los IDs en Firestore son strings, no números

## 🛠️ Desarrollo

Para desarrollo local:

1. Configura Firebase como se indica arriba
2. Instala dependencias: `npm install`
3. Crea archivo `.env` con tus credenciales
4. Inicia el servidor: `npm start`
5. Abre `http://localhost:3000` en tu navegador

## 📞 Soporte

Si tienes problemas con la configuración de Firebase, consulta la [documentación oficial](https://firebase.google.com/docs/admin/setup).
