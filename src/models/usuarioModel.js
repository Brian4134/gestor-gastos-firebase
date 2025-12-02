import { db, auth } from "../config/firebase.js";
import bcrypt from "bcryptjs";

/**
 * Modelo de Usuario
 * Maneja todas las operaciones relacionadas con usuarios usando Firebase
 */
const Usuario = {
    /**
     * Obtener usuario por nombre de usuario (email)
     * @param {string} usuario - Nombre de usuario (email)
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    async obtenerPorUsuario(usuario) {
        try {
            const usuariosRef = db.collection("usuarios");
            const snapshot = await usuariosRef.where("usuario", "==", usuario).limit(1).get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            throw error;
        }
    },

    /**
     * Obtener usuario por Google UID
     * @param {string} googleId - UID de Google
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    async obtenerPorGoogleId(googleId) {
        try {
            const usuariosRef = db.collection("usuarios");
            const snapshot = await usuariosRef.where("googleId", "==", googleId).limit(1).get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error("Error al obtener usuario por Google ID:", error);
            throw error;
        }
    },

    /**
     * Crear nuevo usuario
     * @param {Object} data - Datos del usuario (nombre, usuario, password)
     * @returns {Promise<Object>} Resultado de la inserción
     */
    async crear(data) {
        try {
            // Validaciones básicas
            if (!data.nombre || !data.usuario) {
                throw new Error("Nombre y usuario son obligatorios");
            }

            // Password solo obligatorio si no es registro con Google
            if (!data.googleId && !data.password) {
                throw new Error("La contraseña es obligatoria");
            }

            if (data.password && data.password.length < 6) {
                throw new Error("La contraseña debe tener al menos 6 caracteres");
            }

            // Verificar si el usuario ya existe
            const usuarioExistente = await this.obtenerPorUsuario(data.usuario);
            if (usuarioExistente) {
                throw new Error("El usuario ya existe");
            }

            // Hash de la contraseña (solo si existe)
            let hashedPassword = null;
            if (data.password) {
                hashedPassword = await bcrypt.hash(data.password, 10);
            }

            // Crear usuario en Firebase Authentication
            let firebaseUser;
            try {
                firebaseUser = await auth.createUser({
                    email: data.usuario,
                    password: data.password || undefined, // Opcional para Google Auth (aunque usualmente Google Auth ya crea el user)
                    displayName: data.nombre,
                });
            } catch (authError) {
                // Manejar errores específicos de Firebase Auth
                if (authError.code === 'auth/email-already-exists') {
                    throw new Error("El usuario ya existe");
                }
                throw authError;
            }

            // Guardar datos adicionales en Firestore
            const usuarioData = {
                nombre: data.nombre,
                usuario: data.usuario,
                rol: data.rol || "usuario",
                firebaseUid: firebaseUser.uid,
                creado_en: new Date()
            };

            if (hashedPassword) {
                usuarioData.password = hashedPassword;
            }

            if (data.googleId) {
                usuarioData.googleId = data.googleId;
                usuarioData.authProvider = 'google';
            } else {
                usuarioData.authProvider = 'local';
            }

            const docRef = await db.collection("usuarios").add(usuarioData);

            return {
                id: docRef.id,
                firebaseUid: firebaseUser.uid,
                ...usuarioData
            };
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw error;
        }
    },

    /**
     * Crear o actualizar usuario desde Google
     * @param {Object} googleUser - Datos del usuario de Google
     * @returns {Promise<Object>} Usuario creado o actualizado
     */
    async crearDesdeGoogle(googleUser) {
        try {
            // Verificar si ya existe por Google ID
            let user = await this.obtenerPorGoogleId(googleUser.uid);

            if (user) {
                return user;
            }

            // Verificar si existe por email
            user = await this.obtenerPorUsuario(googleUser.email);
            if (user) {
                // Si existe por email pero no tiene Google ID, actualizamos
                const userRef = db.collection("usuarios").doc(user.id);
                await userRef.update({
                    googleId: googleUser.uid,
                    authProvider: 'google_linked' // Indicamos que se vinculó
                });
                return { ...user, googleId: googleUser.uid };
            }

            // Si no existe, creamos uno nuevo en Firestore
            // Nota: El usuario ya existe en Firebase Auth porque el login fue con Google Provider
            const usuarioData = {
                nombre: googleUser.name || googleUser.displayName || googleUser.email.split('@')[0],
                usuario: googleUser.email,
                rol: "usuario",
                firebaseUid: googleUser.uid,
                googleId: googleUser.uid,
                authProvider: 'google',
                creado_en: new Date()
            };

            const docRef = await db.collection("usuarios").add(usuarioData);

            return {
                id: docRef.id,
                ...usuarioData
            };
        } catch (error) {
            console.error("Error al crear usuario desde Google:", error);
            throw error;
        }
    },

    /**
     * Validar credenciales de usuario
     * @param {string} usuario - Nombre de usuario (email)
     * @param {string} password - Contraseña sin hash
     * @returns {Promise<Object|null>} Usuario si las credenciales son válidas, null si no
     */
    async validarCredenciales(usuario, password) {
        try {
            const user = await this.obtenerPorUsuario(usuario);

            if (!user) {
                return null;
            }

            // Validar contraseña usando bcrypt (mantenemos compatibilidad)
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return null;
            }

            return user;
        } catch (error) {
            console.error("Error al validar credenciales:", error);
            throw error;
        }
    },

    /**
     * Obtener todos los usuarios
     * @returns {Promise<Array>} Lista de usuarios
     */
    async obtenerTodos() {
        try {
            const snapshot = await db.collection("usuarios").get();
            const usuarios = [];
            
            snapshot.forEach(doc => {
                usuarios.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return usuarios;
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            throw error;
        }
    },

    /**
     * Obtener usuario por ID
     * @param {string} id - ID del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    async obtenerPorId(id) {
        try {
            const doc = await db.collection("usuarios").doc(id).get();
            
            if (!doc.exists) {
                return null;
            }

            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error("Error al obtener usuario por ID:", error);
            throw error;
        }
    },
};

export default Usuario;
