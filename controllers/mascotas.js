const { response } = require('express');
const { Mascotas } = require('../models');


const obtenerMascotas = async(req, res = response ) => {

    // const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, mascotas ] = await Promise.all([
        Mascotas.countDocuments(query),
        Mascotas.find(query)
            .populate('usuario', 'nombre')

    ]);

    res.json({
        total,
        mascotas
    });
}

const obtenerMascota = async(req, res = response ) => {

    const { id } = req.params;
    const mascota = await Mascotas.findById( id )
                            .populate('usuario', 'nombre');

    res.json( mascota );

}

const crearMascota = async (req, res) => {
    try {
      const { nombre, raza, edad_mascota,sexo,color } = req.body;
  

  
      const fechaIngreso = new Date();
  
      // Obtener el usuario actual del request (asumiendo que se ha configurado previamente el middleware para autenticación y que se encuentra disponible en req.usuario)
      const usuario = req.usuario._id;
  
      const mascota = new Mascotas({
        nombre,
        raza,
        edad_mascota,
        sexo,
        color,
        fechaIngreso,
        usuario
      });
  
      await mascota.save();
  
      // Poblar el campo 'usuario' con los detalles del usuario correspondiente
      await mascota.populate('usuario', 'nombre').execPopulate();
  
      res.status(201).json(mascota);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  

  const actualizarMascota = async (req, res = response) => {
    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;
  
    // Eliminar la propiedad 'usuario' del objeto 'data'
    delete data.usuario;
  
    // Realizar la actualización en la base de datos
    const mascota = await Mascotas.findByIdAndUpdate(id, data, { new: true });
  
    // Puedes continuar con el código para poblar el objeto 'mascota.usuario' si lo deseas
    mascota.populate('usuario', 'nombre').execPopulate();
  
    res.json(mascota);
  };
  

const borrarMascota = async(req, res =response ) => {

    const { id } = req.params;
    const mascotaBorrada = await Mascotas.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.json( mascotaBorrada );
}
const buscarMascotasPorUsuario = async (req, res) => {
    try {
      const idUsuario = req.params.idUsuario; // Obtén el idUsuario de los parámetros de la URL
  
      // Busca las mascotas que tengan el mismo idUsuario
      const mascotas = await Mascotas.find({ usuario: idUsuario, estado: true }).populate('usuario', 'id nombre');
  
      const total = mascotas.length; // Obtén el total de mascotas
  
      res.status(200).json({ total , mascotas});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  


module.exports = {
     crearMascota,
     obtenerMascotas,
     obtenerMascota,
     actualizarMascota,
     borrarMascota,
     buscarMascotasPorUsuario,
}