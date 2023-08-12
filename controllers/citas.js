const { response } = require('express');
const { Cita,Servicio } = require('../models');
const moment = require('moment');

const obtenerCitasFiltradas = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate('servicioId', '-__v')
      .populate({
        path: 'usuario',
        select: 'nombre',
      })
      .populate({
        path: 'mascota',
        select: 'nombre',
      });

    // Filtrar y ordenar las citas por fecha, estadoP y estadoR
    const citasFiltradas = citas.filter(cita => 
      moment(cita.fecha).isSameOrAfter(moment(), 'day') &&
      cita.estadoP === true &&
      cita.estadoR === false
    );
    citasFiltradas.sort((a, b) => moment(a.fecha).diff(moment(b.fecha)));

    const citasFormatted = citasFiltradas.map(cita => ({
      nombre: cita.nombre,
      estadoP: cita.estadoP,
      estadoR: cita.estadoR,
      estadoA: cita.estadoA,
      _id: cita._id,
      servicioId: {
        estado: cita.servicioId.estado,
        precio: cita.servicioId.precio,
        _id: cita.servicioId._id,
        nombre: cita.servicioId.nombre,
        descripcion: cita.servicioId.descripcion,
        tipo: cita.servicioId.tipo,
        usuario: cita.servicioId.usuario,
      },
      fecha: cita.fecha,
      hora: cita.hora,
      usuario: cita.usuario,
      mascota: cita.mascota,
    }));

    res.json({ total: citasFormatted.length, citas: citasFormatted });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener las citas' });
  }
};

const obtenerCitas = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate('servicioId', '-__v')
      .populate({
        path: 'usuario',
        select: 'nombre',
      })
      .populate({
        path: 'mascota',
        select: 'nombre',
      });

    const citasFormatted = citas.map(cita => ({
      nombre:cita.nombre,
      estadoP: cita.estadoP,
      estadoR: cita.estadoR,
      estadoA: cita.estadoA,
      _id: cita._id,
      servicioId: {
        estado: cita.servicioId.estado,
        precio: cita.servicioId.precio,
        _id: cita.servicioId._id,
        nombre: cita.servicioId.nombre,
        descripcion: cita.servicioId.descripcion,
        tipo: cita.servicioId.tipo,
        usuario: cita.servicioId.usuario,
      },
      fecha: cita.fecha,
      hora: cita.hora,
      usuario: cita.usuario,
      mascota:cita.mascota,
    }));

    res.json({ total: citas.length, citas: citasFormatted });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener las citas' });
  }
};
const obtenerCitasPorUsuario = async (req, res) => {
  try {
    let query = {};
    const usuarioId = req.params.id;

    if (usuarioId) {
      query.usuario = usuarioId;
    }

    const citas = await Cita.find(query)
      .populate('servicioId', '-__v')
      .populate({
        path: 'usuario',
        select: 'nombre',
      })
      .populate({
        path: 'mascota',
        select: 'nombre',
      });

    const citasFormatted = citas.map(cita => ({
      nombre:cita.nombre,
      estadoP: cita.estadoP,
      estadoR: cita.estadoR,
      estadoA: cita.estadoA,
      _id: cita._id,
      servicioId: {
        estado: cita.servicioId.estado,
        precio: cita.servicioId.precio,
        _id: cita.servicioId._id,
        nombre: cita.servicioId.nombre,
        descripcion: cita.servicioId.descripcion,
        tipo: cita.servicioId.tipo,
        usuario: cita.servicioId.usuario,
      },
      fecha: cita.fecha,
      hora: cita.hora,
      usuario: cita.usuario,
      mascota: cita.mascota,
    }));

    res.json({ total: citas.length, citas: citasFormatted });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener las citas' });
  }
};


const obtenerHorasDisponibles = async (req, res) => {
    try {
      const { fecha } = req.params;
      const fechaInicio = new Date(fecha);
  
      const horaInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate(), 9, 0, 0);
      const horaFin = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate(), 19, 0, 0);
  
      const citas = await Cita.find({ fecha: fechaInicio });
  
      const citasHoras = citas.map((cita) => cita.hora);
  
      const horasDisponibles = [];
      let horaActual = new Date(horaInicio);
  
      while (horaActual <= horaFin) {
        const hora = horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
        const citaExistente = citasHoras.find((citaHora) => citaHora === hora);
        if (!citaExistente) {
          horasDisponibles.push(hora);
        }
        horaActual.setMinutes(horaActual.getMinutes() + 30);
      }
  
      res.json({
        fecha: fechaInicio,
        horasDisponibles,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
    
const obtenerProducto = async(req, res = response ) => {

    const { id } = req.params;
    const producto = await Servicio.findById( id )
                            .populate('usuario', 'nombre');

    res.json( producto );

}

const crearCita = async (req, res) => {
    try {
      const { servicioId, fecha, hora, mascota,nombre } = req.body;

      // Verificar si la cita ya existe para la fecha y hora especificadas
      const citaExistente = await Cita.findOne({ fecha, hora });
      if (citaExistente) {
        return res.status(400).json({ error: 'Ya existe una cita para la fecha y hora especificadas' });
      }
  
      // Buscar el producto asociado al ID especificado
      const producto = await Servicio.findById(servicioId);
      if (!producto) {
        return res.status(404).json({ error: 'No se encontró el servicio especificado' });
      }
  
      // Crear una nueva cita
      const nuevaCita = new Cita({
        nombre,
        servicioId,
        fecha,
        hora,
        usuario: req.usuario._id,
        mascota:mascota,
      });
  
      // Guardar la nueva cita en la base de datos
      await nuevaCita.save();
  
      // Realizar el populate del campo "producto" para obtener los detalles completos del producto
      await nuevaCita.populate('servicioId', '-__v').execPopulate();
       await nuevaCita.populate('usuario', 'nombre').execPopulate();
       await nuevaCita.populate('mascota','nombre').execPopulate();
      res.status(201).json({cita: nuevaCita });
    } catch (error) {
      res.status(500).json({ error: 'Ocurrió un error al crear la cita' });
    }
  };
  
  const actualizarCita = async (req, res = response) => {
    const { id } = req.params;
    const { ...data } = req.body;
  
    try {
      const cita = await Cita.findByIdAndUpdate(id, data, { new: true });
  
      if (!cita) {
        return res.status(404).json({ msg: 'La cita no existe' });
      }
  
      res.json(cita);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Error en el servidor' });
    }
  };
  
const borrarCita = async (req, res = response) => {
  const { id } = req.params;

  try {
    // Buscar la cita por su ID y eliminarla de forma definitiva
    const citaBorrada = await Cita.deleteOne({ _id: id });


    res.json({ message: 'La cita ha sido eliminada exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ocurrió un error al eliminar la cita.' });
  }
};


module.exports = {
    crearCita,
    obtenerCitas,
    obtenerProducto,
    actualizarCita,
    obtenerCitasFiltradas,
    borrarCita,
    obtenerHorasDisponibles,
    obtenerCitasPorUsuario
}