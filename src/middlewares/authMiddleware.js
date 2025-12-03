import jwt from 'jsonwebtoken';

export const validarLogin = (req, res, next) => {
    const token = req.cookies?.auth_token;
    
    if (!token) {
        return res.redirect("/login");
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.redirect("/login");
    }
};

export const soloAdmin = (req, res, next) => {
    if (req.user?.rol !== "admin") {
        return res.status(403).send("Acceso denegado");
    }
    next();
};

export const soloUsuario = (req, res, next) => {
    if (req.user?.rol !== "usuario" && req.user?.rol !== "admin") {
        return res.status(403).send("Acceso denegado");
    }
    next();
};
