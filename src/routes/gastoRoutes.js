import express from "express";
import {
    listarGastos,
    mostrarFormularioCrear,
    crearGasto,
    mostrarFormularioEditar,
    actualizarGasto,
    eliminarGasto,
    mostrarReportes,
    mostrarDashboard,
} from "../controllers/gastoController.js";

import { loginUsuario, registrarUsuario, loginConGoogle } from "../controllers/authController.js";
import { gestionUsuarios, gestionTransacciones, reportesGenerales, consolidadoUsuarios } from "../controllers/adminController.js";
import { validarLogin, soloAdmin, soloUsuario } from "../middlewares/authMiddleware.js";

const router = express.Router();

// LOGIN
router.get("/login", (req, res) => res.render("login"));
router.post("/login", loginUsuario);

// GOOGLE AUTH
router.post("/auth/google", loginConGoogle);

// REGISTRO
router.get("/register", (req, res) => res.render("register"));
router.post("/register", registrarUsuario);

// RUTAS PROTEGIDAS
router.get("/dashboard", validarLogin, soloAdmin, mostrarDashboard);

// RUTAS DE ADMINISTRACIÓN
router.get("/admin/usuarios", validarLogin, soloAdmin, gestionUsuarios);
router.get("/admin/transacciones", validarLogin, soloAdmin, gestionTransacciones);
router.get("/admin/reportes", validarLogin, soloAdmin, reportesGenerales);
router.get("/admin/consolidado", validarLogin, soloAdmin, consolidadoUsuarios);

router.get("/index", validarLogin, soloUsuario, listarGastos);
router.get("/reportes", validarLogin, soloUsuario, mostrarReportes);
router.get("/crear", validarLogin, soloUsuario, mostrarFormularioCrear);
router.post("/crear", validarLogin, soloUsuario, crearGasto);
router.get("/editar/:id", validarLogin, soloUsuario, mostrarFormularioEditar);
router.post("/editar/:id", validarLogin, soloUsuario, actualizarGasto);
router.post("/eliminar/:id", validarLogin, soloUsuario, eliminarGasto);

// QR CODE
router.get("/qr", async (req, res) => {
    try {
        const QRCode = await import('qrcode');
        const url = `${req.protocol}://${req.get('host')}/login`;
        const qrDataUrl = await QRCode.default.toDataURL(url);
        res.render('qr', { qrDataUrl, url });
    } catch (err) {
        console.error('Error generando QR:', err);
        res.status(500).send('Error generando QR');
    }
});

// DEPLOY PAGE
router.get("/deploy", async (req, res) => {
    try {
        const QRCode = await import('qrcode');
        const url = `${req.protocol}://${req.get('host')}`;
        const qrDataUrl = await QRCode.default.toDataURL(url);
        res.render('deploy', { qrDataUrl, url });
    } catch (err) {
        console.error('Error generando QR:', err);
        res.status(500).send('Error generando QR');
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
        }
        res.redirect("/login");
    });
});

export default router;
