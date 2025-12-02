import Gasto from "../models/gastoModel.js";

/**
 * Controlador de Gastos
 * Maneja todas las operaciones CRUD de gastos e ingresos
 */

/**
 * Listar todos los gastos
 */
/**
 * Listar todos los gastos
 */
export const listarGastos = async (req, res) => {
  try {
    const userId = req.session.usuario;
    const gastos = await Gasto.obtenerTodos(userId);
    
    // Obtener datos del usuario actual
    const Usuario = (await import("../models/usuarioModel.js")).default;
    const usuarioActual = await Usuario.obtenerPorId(userId);
    
    // Agregar nombre de usuario actual a cada gasto
    const gastosConUsuario = gastos.map(g => ({
      ...g,
      usuarioNombre: usuarioActual?.nombre || 'Usuario'
    }));
    
    res.render("index", { gastos: gastosConUsuario });
  } catch (error) {
    console.error("Error al listar gastos:", error);
    res.status(500).render("index", {
      gastos: [],
      error: "Error al obtener los gastos. Intente nuevamente."
    });
  }
};

/**
 * Mostrar formulario de creación
 */
export const mostrarFormularioCrear = (req, res) => {
  res.render("crear");
};

/**
 * Crear un nuevo gasto
 */
export const crearGasto = async (req, res) => {
  try {
    // Validar que los campos existan
    const { tipo, categoria, descripcion, monto, fecha } = req.body;
    const userId = req.session.usuario;

    if (!userId) {
      req.flash("error", "Usuario no autenticado");
      return res.redirect("/login");
    }

    if (!tipo || !categoria || !descripcion || !monto || !fecha) {
      req.flash("error", "Todos los campos son obligatorios");
      return res.redirect("/index");
    }

    // Validar monto
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      req.flash("error", "El monto debe ser un número positivo");
      return res.redirect("/index");
    }

    // Crear el gasto
    const resultado = await Gasto.crear(req.body, userId);
    req.flash("success", `${tipo === 'gasto' ? 'Gasto' : 'Ingreso'} registrado exitosamente`);
    
    res.redirect("/index");
  } catch (error) {
    console.error("Error al crear gasto:", error);
    req.flash("error", error.message || "Error al crear el gasto. Intente nuevamente.");
    res.redirect("/index");
  }
};

/**
 * Mostrar formulario de edición
 */
export const mostrarFormularioEditar = async (req, res) => {
  try {
    const gasto = await Gasto.obtenerPorId(req.params.id);

    if (!gasto) {
      return res.status(404).send("Gasto no encontrado");
    }

    res.render("editar", { gasto });
  } catch (error) {
    console.error("Error al mostrar formulario de edición:", error);
    res.status(500).send("Error al cargar el formulario. Intente nuevamente.");
  }
};

/**
 * Actualizar un gasto existente
 */
export const actualizarGasto = async (req, res) => {
  try {
    // Validar que los campos existan
    const { tipo, categoria, descripcion, monto, fecha } = req.body;

    if (!tipo || !categoria || !descripcion || !monto || !fecha) {
      const gasto = await Gasto.obtenerPorId(req.params.id);
      return res.status(400).render("editar", {
        gasto,
        error: "Todos los campos son obligatorios"
      });
    }

    // Validar monto
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      const gasto = await Gasto.obtenerPorId(req.params.id);
      return res.status(400).render("editar", {
        gasto,
        error: "El monto debe ser un número positivo"
      });
    }

    // Actualizar el gasto
    await Gasto.actualizar(req.params.id, req.body);
    res.redirect("/index");
  } catch (error) {
    console.error("Error al actualizar gasto:", error);
    const gasto = await Gasto.obtenerPorId(req.params.id);
    res.status(500).render("editar", {
      gasto,
      error: error.message || "Error al actualizar el gasto. Intente nuevamente."
    });
  }
};

/**
 * Eliminar un gasto
 */
export const eliminarGasto = async (req, res) => {
  try {
    await Gasto.eliminar(req.params.id);
    res.redirect("/index");
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    res.status(500).send(error.message || "Error al eliminar el gasto. Intente nuevamente.");
  }
};

/**
 * Mostrar reportes
 */
export const mostrarReportes = async (req, res) => {
  try {
    const userId = req.session.usuario;
    const gastosPorCategoria = await Gasto.obtenerPorCategoria(userId);
    const resumen = await Gasto.obtenerResumen(userId);
    const transaccionesPorFecha = await Gasto.obtenerPorFecha(userId);

    // Filtrar solo gastos para el gráfico circular
    const gastosOnly = gastosPorCategoria.filter(g => g.tipo === 'gasto');

    // Calcular totales
    const totalIngresos = resumen.find(r => r.tipo === 'ingreso')?.total || 0;
    const totalGastos = resumen.find(r => r.tipo === 'gasto')?.total || 0;

    res.render("reportes", {
      gastosPorCategoria: gastosOnly,
      totalIngresos,
      totalGastos,
      transaccionesPorFecha
    });
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    res.status(500).render("reportes", {
      gastosPorCategoria: [],
      totalIngresos: 0,
      totalGastos: 0,
      transaccionesPorFecha: []
    });
  }
};

/**
 * Mostrar Dashboard
 */
export const mostrarDashboard = async (req, res) => {
  try {
    res.render("dashboard");
  } catch (error) {
    console.error("Error al mostrar dashboard:", error);
    res.status(500).render("dashboard", {
      error: "Error al cargar el dashboard."
    });
  }
};
