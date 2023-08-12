const { response } = require('express');
const { Usuario,Servicio,PlanesU } = require('../models');


const obtenerPlanesC = async (req, res = response) => {
  try {
    const planesC = await PlanesU.find()
      .populate('usuario', 'nombre')
      .populate({
        path: 'servicios._id',
        select: '-__v',
      })


    // Eliminar el campo "usuario" de los productos de cada pago y mostrar todos los campos de "servicioId" en citas
    planesC.forEach((planeC) => {
      if (planeC && planeC.servicios) {
        planeC.servicios.forEach((servicio) => {
          if (servicio && servicio._id) {
            servicio._id = servicio._id.toObject();
            delete servicio._id.usuario;
            servicio.id = servicio._id._id;
            servicio.cantidad = servicio.cantidad;
          }
        });
      }
    });

    const total = planesC.length; // Obtener el total de pagos encontrados

    res.json({
      total,
      planes: planesC,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const obtenerPlanesCUsuario = async (req, res = response) => {
  try {
    const idUsuario = req.params.id; 
    const planesC = await PlanesU.find({ usuario: idUsuario })
      .populate('usuario', 'nombre')
      .populate({
        path: 'servicios._id',
        select: '-__v',
      })


    // Eliminar el campo "usuario" de los productos de cada pago y mostrar todos los campos de "servicioId" en citas
    planesC.forEach((planeC) => {
      if (planeC && planeC.servicios) {
        planeC.servicios.forEach((servicio) => {
          if (servicio && servicio._id) {
            servicio._id = servicio._id.toObject();
            delete servicio._id.usuario;
            servicio.id = servicio._id._id;
            servicio.cantidad = servicio.cantidad;
          }
        });
      }
    });

    const total = planesC.length; // Obtener el total de pagos encontrados

    res.json({
      total,
      planes: planesC,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const crearPlanC = async (req, res = response) => {
  try {
    console.log("BODY: ", req.body)
    const { estado,total,nombre,usuario } = req.body;
    const usuarioId = req.usuario;
    const servicios = req.body.servicios;
    
    console.log("BODYY: ", servicios)

    // Verificar que el usuario exista
    const usuarioDB = await Usuario.findById(usuarioId._id);
    if (!usuarioDB) {
      return res.status(400).json({
        msg: "El usuario no existe",
      });
    }

    // Obtener los datos completos de los productos y calcular el total del pago
   
    const serviciosDB = [];
    for (const serviciosInfo of servicios) {
      const { _id, cantidad } = serviciosInfo;
      console.log("BODYY: ", _id)
      // Buscar el producto en la base de datos por su ID y obtener los campos necesarios
      const servicio = await Servicio.findById(_id).select('nombre precio');
      if (!servicio) {
        return res.status(400).json({
          msg: `El servicio con ID ${_id} no existe`,
        });
      }

      // Crear un objeto con los campos necesarios del producto
      const servicioDB = {
        precio: servicio._id.precio,
        opciones: servicio._id.opciones,
        _id: servicio._id._id,
        nombre: servicio._id.nombre,
        descripcion: servicio._id.descripcion,
        usuario: servicio._id.usuario,
        cantidad:cantidad
      };

      // Agregar el producto al array productosDB y actualizar el total
      serviciosDB.push(servicioDB);
      
    }

    // Obtener los datos completos de los servicios y calcular el total del pago
  

    // Crear el objeto del pago
    const planesC = new PlanesU({
      estado,
      nombre,
      usuario: usuarioId,
      total,
      servicios: serviciosDB,

    });

    // Guardar en la base de datos
    await planesC.save();

    // Realizar un populate para obtener los campos adicionales de los productos
    await planesC.populate('servicios._id', '-__v').execPopulate();

    planesC.servicios.forEach((servicio) => {
      servicio._id = servicio._id.toObject();
      delete servicio._id.usuario;
    });

    // Realizar un populate para obtener los campos adicionales del usuario
    await planesC.populate('usuario', 'nombre').execPopulate();

    // Realizar un populate para obtener los campos adicionales de las citas


    // Realizar un populate para obtener los campos adicionales de las citas y sus productos asociados
  

 

    res.status(201).json(planesC);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const disminuirCantidadServicio = async (planId, servicioId) => {
  try {
    // Verificar que el plan exista
    const planDB = await PlanesU.findById(planId);
    if (!planDB) {
      throw new Error(`El plan con ID ${planId} no existe`);
    }

    // Verificar que el servicio esté en el plan
    const servicioEncontrado = planDB.servicios.find(
      (servicio) => servicio._id.toString() === servicioId
    );

    if (!servicioEncontrado) {
      throw new Error(`El servicio con ID ${servicioId} no está en el plan`);
    }

    // Disminuir la cantidad del servicio en 1
    if (servicioEncontrado.cantidad > 0) {
      servicioEncontrado.cantidad -= 1;
    } else {
      // Si la cantidad ya es 0, no puede disminuirse más
      throw new Error("La cantidad del servicio ya es 0");
    }

    // Guardar los cambios en el plan
    await planDB.save();

    return planDB;
  } catch (error) {
    throw error;
  }
};



const borrarPlan = async(req, res = response ) => {

  const { id } = req.params;
  const planBorrado = await PlanesU.findByIdAndUpdate( id, { estado: false }, {new: true });

  res.json( planBorrado );
}



module.exports = {
     crearPlanC,
   obtenerPlanesC,
   borrarPlan,
   obtenerPlanesCUsuario,
  disminuirCantidadServicio
}