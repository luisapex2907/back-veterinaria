const { response } = require('express');
const { Pago,Producto,Usuario,Servicio,Cita,PlanesC } = require('../models');


const obtenerPagos = async (req, res = response) => {
  try {
    const pagos = await Pago.find()
      .populate('usuario', 'nombre')
      .populate({
        path: 'productos._id',
        select: '-__v',
      })
      .populate({
        path: 'citas._id',
        select: '-__v',
        populate: {
          path: 'servicioId',
          select: '-__v',
        },
      })
      .populate({
        path: 'citas._id.usuario',
        select: 'nombre',
      });

    // Eliminar el campo "usuario" de los productos de cada pago y mostrar todos los campos de "servicioId" en citas
    pagos.forEach((pago) => {
      if (pago && pago.productos) {
        pago.productos.forEach((producto) => {
          if (producto && producto._id) {
            producto._id = producto._id.toObject();
            delete producto._id.usuario;
            producto.id = producto._id._id;
            producto.cantidad = producto.cantidad;
          }
        });
      }

      if (pago && pago.citas) {
        pago.citas.forEach((cita) => {
          if (cita && cita._id && cita._id.servicioId) {
            cita._id.servicioId = cita._id.servicioId.toObject();
          }
        });
      }
    });

    const total = pagos.length; // Obtener el total de pagos encontrados

    res.json({
      total,
      pagos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const obtenerCarrito = async (req, res = response) => {
  try {
    const usuarioId = req.usuario._id;

    // Buscar el carrito del usuario
    const carrito = await Carrito.findOne({ usuario: usuarioId })
      .populate('usuario', 'nombre')
      .populate('productos._id', '-__v');

    if (!carrito) {
      return res.status(404).json({
        msg: 'El carrito no existe',
      });
    }

    // Eliminar el campo "usuario" de los productos
    carrito.productos.forEach((producto) => {
      producto._id = producto._id.toObject();
      delete producto._id.usuario;
    });

    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const obtenerCarritosPorUsuario = async (req, res = response) => {
  try {
    const idUsuario = req.params.idUsuario; // Obtener el ID del usuario de los parámetros de la solicitud

    const carritos = await Carrito.find({ usuario: idUsuario })
      .populate('usuario', 'nombre')
      .populate({
        path: 'productos._id',
        select: '-__v',
      })
      .populate({
        path: 'citas._id',
        select: '-__v',
        populate: {
          path: 'servicioId',
          select: '-__v',
        },
      })
      .populate({
        path: 'citas._id.usuario',
        select: 'nombre',
      });

    // Eliminar el campo "usuario" de los productos de cada carrito y mostrar todos los campos de "servicioId" en citas
    carritos.forEach((carrito) => {
      if (carrito && carrito.productos) {
        carrito.productos.forEach((producto) => {
          if (producto && producto._id) {
            producto._id = producto._id.toObject();
            delete producto._id.usuario;
            producto.id = producto._id._id;
            producto.cantidad = producto.cantidad;
          }
        });
      }

      if (carrito && carrito.citas) {
        carrito.citas.forEach((cita) => {
          if (cita && cita._id && cita._id.servicioId) {
            cita._id.servicioId = cita._id.servicioId.toObject();
          }
        });
      }
    });

    const total = carritos.length; // Obtener el total de carritos encontrados

    res.json({
      total,
      carritos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const crearPago = async (req, res = response) => {
  try {
    const { estado,plan } = req.body;
    const usuarioId = req.usuario._id;
    const productos = req.body.productos;
    const citas = req.body.citas;


    // Verificar que el usuario exista
    const usuarioDB = await Usuario.findById(usuarioId);
    if (!usuarioDB) {
      return res.status(400).json({
        msg: "El usuario no existe",
      });
    }

    // Obtener los datos completos de los productos y calcular el total del pago
    let total = 0;

    const plant = await PlanesC.findById(plan).select('total');

    if (plant && plant.total) {
      total = plant.total;
    }
    const productosDB = [];
    for (const productoInfo of productos) {
      const { _id, cantidad } = productoInfo;

      // Buscar el producto en la base de datos por su ID y obtener los campos necesarios
      const producto = await Producto.findById(_id).select('nombre precio');
      if (!producto) {
        return res.status(400).json({
          msg: `El producto con ID ${_id} no existe`,
        });
      }

      // Crear un objeto con los campos necesarios del producto
      const productoDB = {
        _id: producto._id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidad,
      };

      // Agregar el producto al array productosDB y actualizar el total
      productosDB.push(productoDB);
      total += producto.precio * cantidad;
    }

    // Obtener los datos completos de los servicios y calcular el total del pago
    for (const citaInfo of citas) {
      const { _id } = citaInfo;

      // Buscar la cita en la base de datos por su ID y obtener los campos necesarios
      const cita = await Cita.findById(_id).select('servicioId');
      if (!cita) {
        return res.status(400).json({
          msg: `La cita con ID ${_id} no existe`,
        });
      }

      // Obtener el precio del servicio asociado a la cita y actualizar el total
      const servicio = await Servicio.findById(cita.servicioId).select('precio');
      if (!servicio) {
        return res.status(400).json({
          msg: `El servicio con ID ${cita.servicioId} no existe`,
        });
      }

      total += servicio.precio;
    }

    // Crear el objeto del pago
    const pago = new Pago({
      estado,
      usuario: usuarioId,
      plan: plan ? plan._id : undefined, // Si se proporciona un plan, usar su ID
      total,
      productos: productosDB,
      citas: citas,
    });

    // Guardar en la base de datos
    await pago.save();

    // Realizar un populate para obtener los campos adicionales de los productos
    await pago.populate('productos._id', '-__v').execPopulate();

    pago.productos.forEach((producto) => {
      producto._id = producto._id.toObject();
      delete producto._id.usuario;
    });

    // Realizar un populate para obtener los campos adicionales del usuario
    await pago.populate('usuario', 'nombre').execPopulate();

    // Realizar un populate para obtener los campos adicionales de las citas
    await pago.populate('citas._id', '-__v').execPopulate();

    // Realizar un populate para obtener los campos adicionales de las citas y sus productos asociados
    await pago
      .populate({
        path: 'citas._id',
        select: '-__v',
        populate: {
          path: 'servicioId',
          select: '-__v',
        },
      })
      .execPopulate();

    pago.citas.forEach((cita) => {
      if (cita && cita._id && cita._id.servicioId) {
        cita._id.servicioId = cita._id.servicioId.toObject();
      }
    });

    res.status(201).json(pago);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const borrarCarrito = async(req, res = response ) => {

    const { id } = req.params;
    const carritoBorrado = await Carrito.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.json( carritoBorrado );
}




module.exports = {
    crearPago,
    obtenerPagos,
    obtenerCarrito,
     borrarCarrito,
    obtenerCarritosPorUsuario
}