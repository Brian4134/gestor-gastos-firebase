import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import gastoRoutes from "../src/routes/gastoRoutes.js";
import flash from "connect-flash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.user = req.session.usuario ? { id: req.session.usuario, rol: req.session.rol } : null;
    res.locals.firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || 'demo-key',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
    };
    next();
});

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.use("/", gastoRoutes);

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Error interno del servidor');
});

export default app;