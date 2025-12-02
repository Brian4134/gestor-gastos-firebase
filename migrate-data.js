import mysql from 'mysql2/promise';
import { db, auth } from './src/config/firebase.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script de migración de datos de MySQL a Firebase
 * Migra usuarios y gastos existentes
 */

// Configuración de MySQL
const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DB || 'gestor_gastos'
};

async function migrarDatos() {
    let mysqlConnection;

    try {
        console.log('🔄 Iniciando migración de datos...\n');

        // Conectar a MySQL
        console.log('📊 Conectando a MySQL...');
        mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('✅ Conectado a MySQL\n');

        // Migrar usuarios
        console.log('👥 Migrando usuarios...');
        const [usuarios] = await mysqlConnection.query('SELECT * FROM usuarios');
        console.log(`   Encontrados ${usuarios.length} usuarios`);

        let usuariosMigrados = 0;
        let usuariosError = 0;

        for (const usuario of usuarios) {
            try {
                // Verificar si ya existe en Firestore
                const existente = await db.collection('usuarios')
                    .where('usuario', '==', usuario.usuario)
                    .limit(1)
                    .get();

                if (!existente.empty) {
                    console.log(`   ⚠️  Usuario ${usuario.usuario} ya existe en Firebase, saltando...`);
                    continue;
                }

                // Crear usuario en Firebase Auth
                let firebaseUser;
                try {
                    firebaseUser = await auth.createUser({
                        email: usuario.usuario,
                        password: 'TempPassword123!', // Contraseña temporal
                        displayName: usuario.nombre,
                    });
                } catch (authError) {
                    if (authError.code === 'auth/email-already-exists') {
                        // Si ya existe en Auth, obtener el usuario
                        firebaseUser = await auth.getUserByEmail(usuario.usuario);
                    } else {
                        throw authError;
                    }
                }

                // Guardar en Firestore
                await db.collection('usuarios').add({
                    nombre: usuario.nombre,
                    usuario: usuario.usuario,
                    password: usuario.password, // Mantener el hash original
                    rol: usuario.rol,
                    firebaseUid: firebaseUser.uid,
                    creado_en: new Date()
                });

                usuariosMigrados++;
                console.log(`   ✅ Usuario migrado: ${usuario.usuario}`);
            } catch (error) {
                usuariosError++;
                console.error(`   ❌ Error migrando usuario ${usuario.usuario}:`, error.message);
            }
        }

        console.log(`\n📊 Usuarios: ${usuariosMigrados} migrados, ${usuariosError} errores\n`);

        // Migrar gastos
        console.log('💰 Migrando gastos...');
        const [gastos] = await mysqlConnection.query('SELECT * FROM gastos');
        console.log(`   Encontrados ${gastos.length} gastos`);

        let gastosMigrados = 0;
        let gastosError = 0;

        for (const gasto of gastos) {
            try {
                await db.collection('gastos').add({
                    tipo: gasto.tipo,
                    categoria: gasto.categoria,
                    descripcion: gasto.descripcion,
                    monto: parseFloat(gasto.monto),
                    fecha: new Date(gasto.fecha),
                    metodo_pago: gasto.metodo_pago,
                    creado_en: gasto.creado_en ? new Date(gasto.creado_en) : new Date()
                });

                gastosMigrados++;
                console.log(`   ✅ Gasto migrado: ${gasto.descripcion} - $${gasto.monto}`);
            } catch (error) {
                gastosError++;
                console.error(`   ❌ Error migrando gasto ${gasto.id}:`, error.message);
            }
        }

        console.log(`\n📊 Gastos: ${gastosMigrados} migrados, ${gastosError} errores\n`);

        // Resumen final
        console.log('✅ Migración completada!');
        console.log(`\n📈 Resumen:`);
        console.log(`   Usuarios: ${usuariosMigrados}/${usuarios.length}`);
        console.log(`   Gastos: ${gastosMigrados}/${gastos.length}`);

        if (usuariosMigrados > 0) {
            console.log(`\n⚠️  IMPORTANTE: Los usuarios migrados tienen contraseña temporal "TempPassword123!"`);
            console.log(`   Deberán cambiar su contraseña al iniciar sesión.`);
        }

    } catch (error) {
        console.error('❌ Error en la migración:', error);
        throw error;
    } finally {
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('\n📊 Conexión MySQL cerrada');
        }
    }
}

// Ejecutar migración
migrarDatos()
    .then(() => {
        console.log('\n🎉 Proceso de migración finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal en la migración:', error);
        process.exit(1);
    });
