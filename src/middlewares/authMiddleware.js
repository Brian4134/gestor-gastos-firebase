export const validarLogin = (req, res, next) => {
    if (!req.session?.usuario) {
        return res.redirect("/login");
    }
    next();
};

export const soloAdmin = (req, res, next) => {
    if (req.session?.rol !== "admin") {
        return res.status(403).send("Acceso denegado");
    }
    next();
};

export const soloUsuario = (req, res, next) => {
    if (req.session?.rol !== "usuario" && req.session?.rol !== "admin") {
        return res.status(403).send("Acceso denegado");
    }
    next();
};
