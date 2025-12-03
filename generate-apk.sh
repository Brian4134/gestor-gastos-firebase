#!/bin/bash

echo "🚀 Generando APK para Gestor de Gastos..."
echo

echo "📦 Instalando dependencias de Capacitor..."
npm install @capacitor/cli @capacitor/core @capacitor/android --save-dev

echo "🏗️ Generando build web..."
npm run build

echo "⚙️ Inicializando Capacitor..."
npx cap init "Gestor de Gastos" "com.gestorgastos.app" --web-dir=www

echo "📱 Agregando plataforma Android..."
npx cap add android

echo "🔄 Sincronizando archivos..."
npx cap sync

echo "🔨 Compilando APK..."
cd android
./gradlew assembleDebug

echo
echo "✅ APK generado exitosamente!"
echo "📍 Ubicación: android/app/build/outputs/apk/debug/app-debug.apk"
echo