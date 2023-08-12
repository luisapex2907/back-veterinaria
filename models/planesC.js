const { Schema, model } = require('mongoose');

const PlanesCSchema = Schema({
    estado: {
      type: Boolean,
      default: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,

    },
    nombre: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      default: 0
    },
    servicios: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Servicio',
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
        },
      },
    ],
    
  
  });
  


PlanesCSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'PlanesC', PlanesCSchema );
