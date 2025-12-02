import Usuario from "../models/usuarioModel.js";
import Gasto from "../models/gastoModel.js";

/**
 * Gestión de Usuarios
 */
export const gestionUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerTodos();
    res.render("admin/usuarios", { usuarios });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).render("admin/usuarios", { usuarios: [], error: "Error al cargar usuarios" });
  }
};

/**
 * Gestión de Transacciones (todas)
 */
export const gestionTransacciones = async (req, res) => {
  try {
    const transacciones = await Gasto.obtenerTodos(); // Sin filtro de usuario
    const usuarios = await Usuario.obtenerTodos();
    
    // Agregar nombre de usuario a cada transacción
    const transaccionesConUsuario = transacciones.map(t => {
      const usuario = usuarios.find(u => u.id === t.usuarioId);
      return {
        ...t,
        usuarioNombre: usuario ? usuario.nombre : 'Usuario no encontrado'
      };
    });
    
    res.render("admin/transacciones", { transacciones: transaccionesConUsuario });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).render("admin/transacciones", { transacciones: [], error: "Error al cargar transacciones" });
  }
};

/**
 * Reportes Generales del Sistema
 */
export const reportesGenerales = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerTodos();
    const totalTransacciones = await Gasto.obtenerTodos();
    
    const stats = {
      totalUsuarios: usuarios.length,
      totalTransacciones: totalTransacciones.length,
      totalIngresos: totalTransacciones.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + t.monto, 0),
      totalGastos: totalTransacciones.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.monto, 0)
    };

    res.render("admin/reportes", { stats, usuarios: usuarios.length });
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    res.status(500).render("admin/reportes", { stats: {}, usuarios: 0, error: "Error al cargar reportes" });
  }
};

/**
 * Consolidado por Usuario
 */
export const consolidadoUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerTodos();
    const consolidado = [];

    for (const usuario of usuarios) {
      const transacciones = await Gasto.obtenerTodos(usuario.id);
      const ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + t.monto, 0);
      const gastos = transacciones.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.monto, 0);
      
      consolidado.push({
        usuario: usuario.nombre,
        email: usuario.usuario,
        totalTransacciones: transacciones.length,
        totalIngresos: ingresos,
        totalGastos: gastos,
        balance: ingresos - gastos
      });
    }

    res.render("admin/consolidado", { consolidado });
  } catch (error) {
    console.error("Error al obtener consolidado:", error);
    res.status(500).render("admin/consolidado", { consolidado: [], error: "Error al cargar consolidado" });
  }
};