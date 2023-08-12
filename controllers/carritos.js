const { response } = require('express');
const { Carrito,Producto,Usuario,Servicio } = require('../models');


const obtenerCarritos = async (req, res = response) => {
  try {
    const carritos = await Carrito.find()
      .populate('usuario', 'nombre')
      .populate('productos._id', '-__v');

    // Eliminar el campo "usuario" de los productos de cada carrito y mostrar el campo "id" y "cantidad"
    carritos.forEach((carrito) => {
      carrito.productos.forEach((producto) => {
        producto._id = producto._id.toObject();
        delete producto._id.usuario;
        producto.id = producto._id._id;
        producto.cantidad = producto.cantidad;
      });
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

const crearCarrito = async (req, res = response) => {
  try {
    const { estado } = req.body;
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

    // Buscar si existe un carrito previo para el usuario
    let carrito = await Carrito.findOne({ usuario: usuarioId });

    // Si no hay carrito previo, crear uno nuevo
    if (!carrito) {
      // Obtener los datos completos de los productos y calcular el total del carrito
      let total = 0;
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

      // Crear el objeto del carrito
      carrito = new Carrito({
        estado,
        usuario: usuarioId,
        total,
        productos: productosDB,
        citas: citas,
      });

      // Guardar en la base de datos
      await carrito.save();
    } else {
      // Actualizar el carrito existente con los nuevos datos
      carrito.estado = estado;
      carrito.productos = productos;
      carrito.citas = citas;

      // Recalcular el total del carrito
      let total = 0;
      for (const productoInfo of productos) {
        const { _id, cantidad } = productoInfo;

        // Buscar el producto en la base de datos por su ID y obtener los campos necesarios
        const producto = await Producto.findById(_id).select('precio');
        if (!producto) {
          return res.status(400).json({
            msg: `El producto con ID ${_id} no existe`,
          });
        }

        // Actualizar la cantidad del producto en el carrito
        const productoDB = carrito.productos.find((p) => p._id.toString() === _id);
        if (productoDB) {
          productoDB.cantidad = cantidad;
        }

        // Actualizar el total del carrito
        total += producto.precio * cantidad;
      }

      carrito.total = total;

      // Guardar en la base de datos
      await carrito.save();
    }
    // Realizar un populate para obtener los campos adicionales de los productos
    await carrito.populate('productos._id', '-__v').execPopulate();

    carrito.productos.forEach((producto) => {
      producto._id = producto._id.toObject();
      delete producto._id.usuario;
    });

    // Realizar un populate para obtener los campos adicionales del usuario
    await carrito.populate('usuario', 'nombre').execPopulate();

    // Realizar un populate para obtener los campos adicionales de las citas
    await carrito.populate('citas._id', '-__v').execPopulate();

    // Realizar un populate para obtener los campos adicionales de las citas y sus productos asociados
    await carrito
    .populate({
      path: 'citas._id',
      select: '-__v',
      populate: {
        path: 'servicioId',
        select: '-__v',
      },
    })
    .execPopulate();
  
  carrito.citas.forEach((cita) => {
    if (cita && cita._id && cita._id.servicioId) {
      cita._id.servicioId = cita._id.servicioId.toObject();
    }
  });
  

    res.status(201).json(carrito);

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
    crearCarrito,
    obtenerCarritos,
    obtenerCarrito,
     borrarCarrito,
    obtenerCarritosPorUsuario
}