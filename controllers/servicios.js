const { response } = require('express');
const { Servicio } = require('../models');

const obtenerServicios = async (req, res = response) => {
    try {
      const servicios = await Servicio.find().populate('usuario', 'nombre');
      const total = servicios.length;
      res.json({
        total,
        servicios,
      });
    } catch (error) {
      console.error('Error al obtener los servicios:', error);
      res.status(500).json({ mensaje: 'Error en el servidor' });
    }
  };
  
const crearServicio = async (req, res = response) => {
  try {
    const { nombre, opciones, descripcion,precio } = req.body;
    const usuario = req.usuario._id; // Obtener el ID del usuario desde req.usuario._id

    const nuevoServicio = new Servicio({
      nombre,
      precio,
      opciones,
      descripcion,
      usuario
    });

    await nuevoServicio.save();

    await nuevoServicio.populate('usuario', 'nombre').execPopulate();

    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

const actualizarServicio = async (req, res = response) => {
    try {
      const { id } = req.params;
      const updateFields = {};
  
      // Verificar y agregar los campos proporcionados en la solicitud
      if (req.body.nombre) {
        updateFields.nombre = req.body.nombre;
      }
      if (req.body.opciones) {
        updateFields.opciones = req.body.opciones;
      }
      if (req.body.descripcion) {
        updateFields.descripcion = req.body.descripcion;
      }
      if (req.body.precio) {
        updateFields.precio = req.body.precio;
      }
  
      const servicioActualizado = await Servicio.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      ).populate('usuario', 'nombre');
  
      if (!servicioActualizado) {
        return res.status(404).json({ mensaje: 'Servicio no encontrado' });
      }
  
      res.json(servicioActualizado);
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      res.status(500).json({ mensaje: 'Error en el servidor' });
    }
  };
  

const eliminarServicio = async (req, res = response) => {
  try {
    const { id } = req.params;

    const servicioEliminado = await Servicio.findByIdAndDelete(id).populate('usuario', 'nombre');

    if (!servicioEliminado) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicioEliminado);
  } catch (error) {
    console.error('Error al eliminar el servicio:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

module.exports = {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
};
