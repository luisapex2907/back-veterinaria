const { Schema, model } = require('mongoose');

const CitaSchema = new Schema({
      nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
      
    },
    servicioId: {
      type: Schema.Types.ObjectId,
      ref: 'Servicio',
      required: true
    },
    fecha: {
      type: Date,
      required: true
    },
    hora: {
      type: String,
      required: true
    },
    estadoP: {
      type: Boolean,
      default: false
    },
    estadoA: {
      type: Boolean,
      default: false
    },
    estadoR: {
      type: Boolean,
      default: false
    },
    estado: {
      type: Boolean,
      default: true
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
  },
  mascota: {
    type: Schema.Types.ObjectId,
    ref: 'Mascotas',
    required: true
  }
  });


  CitaSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Cita', CitaSchema );
