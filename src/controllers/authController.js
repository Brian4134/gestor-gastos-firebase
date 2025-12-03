import Usuario from "../models/usuarioModel.js";
import { auth } from "../config/firebase.js";

/**
 * Controlador de autenticación
 * Maneja login y registro de usuarios
 */

/**
 * Login de usuario
 */
export const loginUsuario = async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // Validar que los campos existan
        if (!usuario || !password) {
            return res.render("login", { error: "Todos los campos son obligatorios" });
        }

        // Validar credenciales usando el modelo
        const user = await Usuario.validarCredenciales(usuario, password);

        if (!user) {
            return res.render("login", { error: "Usuario o contraseña incorrectos" });
        }

        // Crear JWT token
        const jwt = await import('jsonwebtoken');
        const token = jwt.default.sign(
            { 
                userId: user.id, 
                rol: user.rol, 
                nombre: user.nombre 
            }, 
            process.env.SESSION_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );
        
        // Establecer cookie con JWT
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        // Redirigir según el rol
        res.redirect(user.rol === "admin" ? "/dashboard" : "/index");
    } catch (error) {
        console.error("Error en login:", error);
        res.render("login", { error: "Error en el servidor. Intente nuevamente." });
    }
};

/**
 * Login con Google
 */
export const loginConGoogle = async (req, res) => {
    const { idToken } = req.body;

    try {
        console.log('Iniciando login con Google...');
        
        if (!idToken) {
            console.log('Error: Token de ID no proporcionado');
            return res.status(400).json({ error: "Token de ID requerido" });
        }

        console.log('Verificando token con Firebase Admin...');
        // Verificar el token con Firebase Admin
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;
        console.log('Token verificado para usuario:', email);

        // Crear o actualizar usuario en nuestra BD
        console.log('Creando/actualizando usuario en BD...');
        const user = await Usuario.crearDesdeGoogle({
            uid,
            email,
            name,
            picture
        });
        console.log('Usuario creado/actualizado:', user.id, user.rol);

        // Crear JWT token
        const jwt = await import('jsonwebtoken');
        const token = jwt.default.sign(
            { 
                userId: user.id, 
                rol: user.rol, 
                nombre: user.nombre 
            }, 
            process.env.SESSION_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );
        
        console.log('Token JWT creado, redirigiendo...');
        res.json({ 
            success: true, 
            token,
            redirect: user.rol === "admin" ? "/dashboard" : "/index" 
        });
    } catch (error) {
        console.error("Error detallado en login con Google:", error);
        console.error("Stack trace:", error.stack);
        res.status(401).json({ error: "Autenticación fallida: " + error.message });
    }
};

/**
 * Registro de nuevo usuario
 */
export const registrarUsuario = async (req, res) => {
    const { nombre, usuario, password } = req.body;

    try {
        // Crear usuario usando el modelo
        await Usuario.crear({ nombre, usuario, password });

        // Redirigir al login
        res.redirect("/login");
    } catch (error) {
        console.error("Error en registro:", error);

        // Manejar errores específicos
        let errorMessage = "Error al registrar usuario";
        if (error.message === "El usuario ya existe") {
            errorMessage = "El usuario ya existe. Intente con otro nombre de usuario.";
        } else if (error.message === "Todos los campos son obligatorios") {
            errorMessage = "Todos los campos son obligatorios";
        } else if (error.message.includes("contraseña")) {
            errorMessage = error.message;
        }

        res.render("register", { error: errorMessage });
    }
};
