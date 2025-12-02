import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import gastoRoutes from "./src/routes/gastoRoutes.js";
import flash from "connect-flash";

// Set NODE_ENV for Vercel
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// Necesario para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Motor de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use('/src', express.static(path.join(__dirname, "src")));

// Sesiones para login
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_change_me",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.user = req.session.usuario ? { id: req.session.usuario, rol: req.session.rol, nombre: req.session.nombreUsuario } : null;
    res.locals.firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || 'demo-key',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
    };
    next();
});
// Redirigir al login al iniciar
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Rutas del sistema
app.use("/", gastoRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).render('error', { 
        error: 'Error en el servidor. Intente nuevamente.',
        details: process.env.NODE_ENV === 'development' ? err.message : null
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        error: 'Página no encontrada',
        details: null
    });
});

// Servidor
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

export default app;
