# 📱 Generación de APK - Gestor de Gastos

Esta guía te ayudará a generar un APK de la aplicación Gestor de Gastos.

## 🔧 Requisitos Previos

### 1. Android Studio y SDK
- Descargar e instalar [Android Studio](https://developer.android.com/studio)
- Configurar Android SDK (API 22 o superior)
- Agregar `ANDROID_HOME` a las variables de entorno

### 2. Java Development Kit (JDK)
- Instalar JDK 11 o superior
- Configurar `JAVA_HOME` en variables de entorno

### 3. Node.js
- Tener Node.js instalado (versión 16 o superior)

## 🚀 Generación Automática

### Opción 1: Script Automático (Windows)
```bash
# Ejecutar el script automático
./generate-apk.bat
```

### Opción 2: Script Automático (Linux/Mac)
```bash
# Dar permisos de ejecución
chmod +x generate-apk.sh

# Ejecutar el script
./generate-apk.sh
```

## 🔧 Generación Manual

### 1. Instalar Dependencias
```bash
npm install @capacitor/cli @capacitor/core @capacitor/android --save-dev
```

### 2. Generar Build Web
```bash
npm run build
```

### 3. Inicializar Capacitor
```bash
npx cap init "Gestor de Gastos" "com.gestorgastos.app" --web-dir=www
```

### 4. Agregar Plataforma Android
```bash
npx cap add android
```

### 5. Sincronizar Archivos
```bash
npx cap sync
```

### 6. Compilar APK
```bash
cd android
./gradlew assembleDebug
```

## 📍 Ubicación del APK

El APK generado se encontrará en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔧 Configuración Personalizada

### Cambiar Icono de la App
1. Reemplazar archivos en `android/app/src/main/res/mipmap-*/`
2. Usar herramientas como [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

### Cambiar Nombre de la App
Editar `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Tu Nombre de App</string>
```

### Configurar Permisos
Editar `android/app/src/main/AndroidManifest.xml` para agregar permisos necesarios.

## 🚀 APK de Producción

Para generar APK firmado para producción:

### 1. Crear Keystore
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar Gradle
Editar `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'password'
            keyAlias 'alias_name'
            keyPassword 'password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Generar APK de Producción
```bash
cd android
./gradlew assembleRelease
```

## 🔍 Solución de Problemas

### Error: ANDROID_HOME no encontrado
- Configurar variable de entorno ANDROID_HOME apuntando al SDK de Android
- Agregar `%ANDROID_HOME%\tools` y `%ANDROID_HOME%\platform-tools` al PATH

### Error: Java no encontrado
- Instalar JDK 11 o superior
- Configurar JAVA_HOME en variables de entorno

### Error: Gradle no encontrado
- Android Studio instala Gradle automáticamente
- Verificar que Android Studio esté correctamente instalado

### APK no se instala en el dispositivo
- Habilitar "Fuentes desconocidas" en configuración de Android
- Verificar que el dispositivo tenga Android 5.1 (API 22) o superior

## 📱 Instalación en Dispositivo

1. Transferir el APK al dispositivo Android
2. Habilitar instalación de fuentes desconocidas
3. Abrir el archivo APK y seguir las instrucciones de instalación

## 🔄 Actualización de la App

Para actualizar la app:
1. Incrementar `versionCode` en `android/app/build.gradle`
2. Regenerar el APK
3. Instalar la nueva versión (sobrescribirá la anterior)

## 📞 Soporte

Si encuentras problemas durante la generación del APK:
1. Verificar que todos los requisitos estén instalados
2. Revisar los logs de error en la consola
3. Consultar la documentación de [Capacitor](https://capacitorjs.com/docs/android)