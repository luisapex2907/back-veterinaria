const { response } = require('express');
const { Compra, Producto } = require('../models');

const obtenerCompras = async (req, res = response) => {
    try {
      const usuario = req.usuario;
  

  
      const compras = await Compra.find({ estado: true })
        .populate('producto', 'nombre precio')
        .populate('usuario', 'nombre');
  
      const cantidadCompras = compras.length;
  
      res.json({
        total: cantidadCompras,
        compras,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: 'Error al obtener las compras',
      });
    }
  };
  

  const obtenerComprasPorUsuario = async (req, res = response) => {
    try {
      const { id } = req.params;
  
      const compras = await Compra.find({ usuario: id, estado: true })
      .populate('producto', 'nombre precio')
        .populate('usuario', 'nombre');
  
      const cantidadCompras = compras.length;
  
      res.json({
        total: cantidadCompras,
        compras,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: 'Error al obtener las compras del usuario',
      });
    }
  };
  

const crearCompra = async (req, res = response) => {
    const { producto, cantidad } = req.body;
  
    try {
      const productoExistente = await Producto.findById(producto);
      if (!productoExistente) {
        return res.status(400).json({
          msg: 'El producto no existe en la base de datos',
        });
      }
  
      const compra = new Compra({
        producto,
        usuario: req.usuario._id,
        cantidad,
      });
  
      await compra.save();
  
      await compra
      .populate('producto', 'nombre precio')
        .populate('usuario', 'nombre')
        .execPopulate();
  
      res.status(201).json(compra);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: 'Error al crear la compra',
      });
    }
  };
  

  const actualizarCompra = async (req, res = response) => {
    const { id } = req.params;
  
    try {
      const compraExistente = await Compra.findById(id);
      if (!compraExistente) {
        return res.status(400).json({
          msg: 'La compra no existe en la base de datos',
        });
      }
  
      const data = {
        comprobante: true,
      };
  
      const compra = await Compra.findByIdAndUpdate(id, data, { new: true })
      .populate('producto', 'nombre precio')
        .populate('usuario', 'nombre');
  
      res.json(compra);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: 'Error al actualizar la compra',
      });
    }
  };
  

const borrarCompra = async (req, res = response) => {
  const { id } = req.params;

  try {
    const compraExistente = await Compra.findById(id);
    if (!compraExistente) {
      return res.status(400).json({
        msg: 'La compra no existe en la base de datos',
      });
    }

    await Compra.findByIdAndDelete(id);

    res.json({
      msg: 'Compra eliminada correctamente',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Error al eliminar la compra',
    });
  }
};

module.exports = {
  obtenerCompras,
  obtenerComprasPorUsuario,
  crearCompra,
  actualizarCompra,
  borrarCompra,
};
