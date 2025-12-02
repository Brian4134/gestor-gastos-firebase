# 🔥 Guía de Configuración de Firebase

## Paso 1: Crear Proyecto en Firebase Console

1. **Accede a Firebase Console**
   - Ve a: https://console.firebase.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crear nuevo proyecto**
   - Clic en "Agregar proyecto" o "Add project"
   - Nombre del proyecto: `gestor-gastos` (o el que prefieras)
   - Acepta los términos y clic en "Continuar"
   - Desactiva Google Analytics (opcional para este proyecto)
   - Clic en "Crear proyecto"
   - Espera a que se cree (toma unos segundos)

## Paso 2: Habilitar Firestore Database

1. **Ir a Firestore**
   - En el menú lateral, ve a "Build" → "Firestore Database"
   - Clic en "Create database"

2. **Configurar Firestore**
   - Selecciona **"Start in production mode"** (más seguro)
   - Clic en "Next"
   - Selecciona una ubicación (ej: `us-central1` o la más cercana)
   - Clic en "Enable"
   - Espera a que se cree la base de datos

3. **Configurar reglas de seguridad (IMPORTANTE)**
   - Ve a la pestaña "Rules"
   - Reemplaza las reglas con:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Clic en "Publish"
   - ⚠️ **Nota**: Estas reglas permiten acceso total. En producción, debes restringirlas.

## Paso 3: Habilitar Authentication

1. **Ir a Authentication**
   - En el menú lateral, ve a "Build" → "Authentication"
   - Clic en "Get started"

2. **Habilitar Email/Password**
   - Ve a la pestaña "Sign-in method"
   - Clic en "Email/Password"
   - Activa el switch de "Email/Password"
   - Clic en "Save"

## Paso 4: Obtener Credenciales del Servicio

1. **Ir a configuración del proyecto**
   - Clic en el ícono de engranaje ⚙️ junto a "Project Overview"
   - Selecciona "Project settings"

2. **Ir a Service Accounts**
   - Ve a la pestaña "Service accounts"
   - Asegúrate de estar en "Firebase Admin SDK"

3. **Generar clave privada**
   - Clic en "Generate new private key"
   - Aparecerá un diálogo de confirmación
   - Clic en "Generate key"
   - Se descargará un archivo JSON (ej: `gestor-gastos-xxxxx-firebase-adminsdk-xxxxx.json`)
   - **¡GUARDA ESTE ARCHIVO EN UN LUGAR SEGURO!**

## Paso 5: Configurar el Proyecto

### Opción A: Usar archivo JSON (Más fácil)

1. **Mover el archivo JSON**
   - Renombra el archivo descargado a: `firebase-credentials.json`
   - Muévelo a la raíz de tu proyecto (mismo nivel que `server.js`)

2. **Actualizar archivo .env**
   - Edita el archivo `.env` en la raíz del proyecto
   - Descomenta y actualiza esta línea:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
   SESSION_SECRET=gestor_gastos_secret_key_2024_change_in_production
   ```

### Opción B: Usar variables individuales

1. **Abrir el archivo JSON descargado**
   - Abre el archivo JSON con un editor de texto
   - Busca estos valores:
     - `project_id`
     - `private_key`
     - `client_email`

2. **Actualizar archivo .env**
   - Edita el archivo `.env` en la raíz del proyecto
   - Copia los valores del JSON:
   ```env
   FIREBASE_PROJECT_ID=tu-proyecto-id-aqui
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_COMPLETA_AQUI\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto-id.iam.gserviceaccount.com
   SESSION_SECRET=gestor_gastos_secret_key_2024_change_in_production
   ```

## Paso 6: Verificar la Instalación

1. **Instalar dependencias** (si aún no lo has hecho)
   ```bash
   npm install
   ```

2. **Iniciar el servidor**
   ```bash
   npm start
   ```

3. **Verificar en consola**
   - Deberías ver: `Firebase inicializado con...`
   - Si ves errores, revisa que las credenciales estén correctas

4. **Probar en el navegador**
   - Abre: http://localhost:3000
   - Deberías ver la página de login
   - Intenta registrar un nuevo usuario

## 🎉 ¡Listo!

Tu aplicación ahora está conectada a Firebase. Los datos se guardarán en Firestore.

## 📋 Checklist de Verificación

- [ ] Proyecto creado en Firebase Console
- [ ] Firestore Database habilitado
- [ ] Authentication (Email/Password) habilitado
- [ ] Archivo de credenciales descargado
- [ ] Archivo `.env` configurado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor inicia sin errores
- [ ] Puedes registrar un usuario nuevo

## ❓ Solución de Problemas

### Error: "Firebase not initialized"
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Asegúrate de que la ruta al archivo JSON es correcta

### Error: "Permission denied"
- Ve a Firestore → Rules y asegúrate de que las reglas permiten acceso
- Verifica que Authentication está habilitado

### Error: "Invalid credentials"
- Descarga nuevamente el archivo de credenciales desde Firebase Console
- Verifica que copiaste correctamente la clave privada (debe incluir `\n`)

## 🔄 Migrar Datos de MySQL (Opcional)

Si tienes datos en MySQL que quieres migrar:

1. **Agrega variables de MySQL al .env**
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASS=
   MYSQL_DB=gestor_gastos
   ```

2. **Ejecuta el script de migración**
   ```bash
   npm run migrate
   ```

3. **Verifica en Firebase Console**
   - Ve a Firestore Database
   - Deberías ver las colecciones `usuarios` y `gastos` con tus datos

---

**¿Necesitas ayuda?** Consulta la [documentación oficial de Firebase](https://firebase.google.com/docs/admin/setup)
