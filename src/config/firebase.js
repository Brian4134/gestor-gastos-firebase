import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuración de Firebase Admin SDK
 * Inicializa Firebase con las credenciales del proyecto
 */

// Inicializar Firebase Admin
try {
    // Opción 1: Usar variables de entorno individuales
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        });
        console.log('✅ Firebase inicializado con variables de entorno');
    }
    // Opción 2: Usar archivo de credenciales JSON
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        // Resolver la ruta relativa desde la raíz del proyecto
        const projectRoot = resolve(__dirname, '../..');
        const credentialsPath = resolve(projectRoot, process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

        // Leer el archivo JSON
        const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase inicializado con archivo de credenciales');
    }
    // Opción 3: Desarrollo local - usar credenciales por defecto
    else {
        console.warn('⚠️  No se encontraron credenciales de Firebase en .env');
        console.warn('⚠️  Por favor, configura las variables de entorno de Firebase');
        console.warn('⚠️  Ver .env.example para más información');

        // Inicializar sin credenciales (fallará en operaciones reales)
        admin.initializeApp();
    }
} catch (error) {
    console.error('❌ Error al inicializar Firebase:', error.message);
    throw error;
}

// Exportar instancias de Firebase
export const db = admin.firestore();
export const auth = admin.auth();

// Configuración de Firestore
db.settings({
    ignoreUndefinedProperties: true,
});

export default admin;
