const { response } = require('express');
const { Producto } = require('../models');


const obtenerProductos = async(req, res = response ) => {


    const query = { estado: true };

    const [ total, productos ] = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
            .populate('usuario', 'nombre')

    ]);

    res.json({
        total,
        productos
    });
}

const obtenerProducto = async(req, res = response ) => {

    const { id } = req.params;
    const producto = await Producto.findById( id )
                            .populate('usuario', 'nombre');

    res.json( producto );

}

const crearProducto = async (req, res = response) => {
    const { estado, usuario, ...body } = req.body;
  
    // Generar la data a guardar
    const data = {
      ...body,
      nombre: body.nombre,
      usuario: req.usuario._id,
    };
  
    const producto = new Producto(data);
  
    // Guardar en la base de datos
    const nuevoProducto = await producto.save();
    await nuevoProducto.populate("usuario", "nombre").execPopulate();
  
    res.status(201).json(nuevoProducto);
  };
  

const actualizarProducto = async( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;


    data.usuario = req.usuario._id;

    const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

    await producto
        .populate('usuario', 'nombre')

        .execPopulate();
        
    res.json( producto );

}

const borrarProducto = async(req, res = response ) => {

    const { id } = req.params;
    const productoBorrado = await Producto.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.json( productoBorrado );
}




module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    borrarProducto
}