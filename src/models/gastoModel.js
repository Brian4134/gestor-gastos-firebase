import { db } from "../config/firebase.js";
import admin from "../config/firebase.js";

/**
 * Modelo de Gasto
 * Maneja todas las operaciones relacionadas con gastos e ingresos usando Firestore
 */
const Gasto = {
  /**
   * Obtener todos los gastos de un usuario ordenados por fecha descendente
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de gastos
   */
  async obtenerTodos(userId) {
    try {
      let query = db.collection("gastos");

      if (userId) {
        query = query.where("usuarioId", "==", userId);
      }

      const snapshot = await query.get();
      const gastos = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        gastos.push({
          id: doc.id,
          ...data,
          // Convertir Timestamp de Firebase a formato de fecha
          fecha: data.fecha instanceof admin.firestore.Timestamp
            ? data.fecha.toDate().toISOString().split('T')[0]
            : data.fecha,
          // Agregar timestamp para ordenar en JavaScript
          fechaTimestamp: data.fecha instanceof admin.firestore.Timestamp
            ? data.fecha.toDate().getTime()
            : new Date(data.fecha).getTime()
        });
      });

      // Ordenar por fecha en JavaScript en lugar de Firestore
      gastos.sort((a, b) => b.fechaTimestamp - a.fechaTimestamp);
      
      // Remover el campo temporal
      gastos.forEach(gasto => delete gasto.fechaTimestamp);

      return gastos;
    } catch (error) {
      console.error("Error al obtener gastos:", error);
      throw error;
    }
  },

  /**
   * Crear un nuevo gasto
   * @param {Object} data - Datos del gasto
   * @param {string} userId - ID del usuario propietario
   * @returns {Promise<Object>} Resultado de la inserción
   */
  async crear(data, userId) {
    try {
      // Validaciones
      if (!data.tipo || !data.categoria || !data.descripcion || !data.monto || !data.fecha) {
        throw new Error("Todos los campos son obligatorios");
      }

      if (!userId) {
        throw new Error("Usuario no identificado");
      }

      // Validar que el monto sea un número positivo
      const monto = parseFloat(data.monto);
      if (isNaN(monto) || monto <= 0) {
        throw new Error("El monto debe ser un número positivo");
      }

      // Validar tipo
      if (data.tipo !== 'gasto' && data.tipo !== 'ingreso') {
        throw new Error("El tipo debe ser 'gasto' o 'ingreso'");
      }

      // Preparar datos para Firestore
      const gastoData = {
        tipo: data.tipo,
        categoria: data.categoria,
        descripcion: data.descripcion,
        monto: monto,
        fecha: admin.firestore.Timestamp.fromDate(new Date(data.fecha)),
        metodo_pago: data.metodo_pago || null,
        usuarioId: userId,
        creado_en: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection("gastos").add(gastoData);

      return {
        id: docRef.id,
        ...gastoData
      };
    } catch (error) {
      console.error("Error al crear gasto:", error);
      throw error;
    }
  },

  /**
   * Obtener un gasto por ID
   * @param {string} id - ID del gasto
   * @returns {Promise<Object|null>} Gasto encontrado o null
   */
  async obtenerPorId(id) {
    try {
      if (!id) {
        throw new Error("ID inválido");
      }

      const doc = await db.collection("gastos").doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convertir Timestamp a formato de fecha para formularios
        fecha: data.fecha instanceof admin.firestore.Timestamp
          ? data.fecha.toDate().toISOString().split('T')[0]
          : data.fecha
      };
    } catch (error) {
      console.error("Error al obtener gasto por ID:", error);
      throw error;
    }
  },

  /**
   * Actualizar un gasto existente
   * @param {string} id - ID del gasto
   * @param {Object} data - Datos actualizados
   * @returns {Promise<boolean>} true si se actualizó correctamente
   */
  async actualizar(id, data) {
    try {
      // Validar que el ID sea válido
      if (!id) {
        throw new Error("ID inválido");
      }

      // Verificar que el gasto existe
      const gastoExistente = await this.obtenerPorId(id);
      if (!gastoExistente) {
        throw new Error("El gasto no existe");
      }

      // Validaciones de datos
      if (data.monto !== undefined) {
        const monto = parseFloat(data.monto);
        if (isNaN(monto) || monto <= 0) {
          throw new Error("El monto debe ser un número positivo");
        }
        data.monto = monto;
      }

      if (data.tipo && data.tipo !== 'gasto' && data.tipo !== 'ingreso') {
        throw new Error("El tipo debe ser 'gasto' o 'ingreso'");
      }

      // Convertir fecha a Timestamp si existe
      if (data.fecha) {
        data.fecha = admin.firestore.Timestamp.fromDate(new Date(data.fecha));
      }

      // Actualizar en Firestore
      await db.collection("gastos").doc(id).update(data);

      return true;
    } catch (error) {
      console.error("Error al actualizar gasto:", error);
      throw error;
    }
  },

  /**
   * Eliminar un gasto
   * @param {string} id - ID del gasto
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async eliminar(id) {
    try {
      // Validar que el ID sea válido
      if (!id) {
        throw new Error("ID inválido");
      }

      // Verificar que el gasto existe
      const gastoExistente = await this.obtenerPorId(id);
      if (!gastoExistente) {
        throw new Error("El gasto no existe");
      }

      await db.collection("gastos").doc(id).delete();

      return true;
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      throw error;
    }
  },

  /**
   * Obtener gastos agrupados por categoría para un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Gastos agrupados por categoría
   */
  async obtenerPorCategoria(userId) {
    try {
      let query = db.collection("gastos");

      if (userId) {
        query = query.where("usuarioId", "==", userId);
      }

      const snapshot = await query.get();

      // Agrupar manualmente por categoría y tipo
      const grupos = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const key = `${data.categoria}_${data.tipo}`;

        if (!grupos[key]) {
          grupos[key] = {
            categoria: data.categoria,
            tipo: data.tipo,
            total: 0
          };
        }

        grupos[key].total += parseFloat(data.monto);
      });

      // Convertir objeto a array y ordenar por total descendente
      const resultado = Object.values(grupos).sort((a, b) => b.total - a.total);

      return resultado;
    } catch (error) {
      console.error("Error al obtener gastos por categoría:", error);
      throw error;
    }
  },

  /**
   * Obtener resumen de gastos e ingresos para un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Resumen por tipo
   */
  async obtenerResumen(userId) {
    try {
      let query = db.collection("gastos");

      if (userId) {
        query = query.where("usuarioId", "==", userId);
      }

      const snapshot = await query.get();

      // Agrupar manualmente por tipo
      const resumen = {
        gasto: 0,
        ingreso: 0
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.tipo === 'gasto') {
          resumen.gasto += parseFloat(data.monto);
        } else if (data.tipo === 'ingreso') {
          resumen.ingreso += parseFloat(data.monto);
        }
      });

      // Convertir a formato de array similar a MySQL
      const resultado = [];
      if (resumen.gasto > 0) {
        resultado.push({ tipo: 'gasto', total: resumen.gasto });
      }
      if (resumen.ingreso > 0) {
        resultado.push({ tipo: 'ingreso', total: resumen.ingreso });
      }

      return resultado;
    } catch (error) {
      console.error("Error al obtener resumen:", error);
      throw error;
    }
  },

  /**
   * Obtener transacciones agrupadas por fecha para gráficos temporales
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Transacciones por fecha
   */
  async obtenerPorFecha(userId) {
    try {
      let query = db.collection("gastos");

      if (userId) {
        query = query.where("usuarioId", "==", userId);
      }

      const snapshot = await query.get();
      const transaccionesPorFecha = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof admin.firestore.Timestamp
          ? data.fecha.toDate().toISOString().split('T')[0]
          : data.fecha;

        if (!transaccionesPorFecha[fecha]) {
          transaccionesPorFecha[fecha] = {
            fecha,
            ingresos: 0,
            gastos: 0
          };
        }

        if (data.tipo === 'ingreso') {
          transaccionesPorFecha[fecha].ingresos += parseFloat(data.monto);
        } else if (data.tipo === 'gasto') {
          transaccionesPorFecha[fecha].gastos += parseFloat(data.monto);
        }
      });

      // Convertir a array y ordenar por fecha
      const resultado = Object.values(transaccionesPorFecha)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      return resultado;
    } catch (error) {
      console.error("Error al obtener transacciones por fecha:", error);
      throw error;
    }
  }
};

export default Gasto;
