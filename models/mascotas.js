const { Schema, model } = require('mongoose');

const mascotaSchema = Schema({
  estado: {
    type: Boolean,
    default: true,
    required: true
},
  nombre: {
    type: String,
    required: true
  },
  raza: {
    type: String,
    required: true
  },
  edad_mascota: {
    type: Number,
    required: true
  },
  sexo: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },

  fechaIngreso: {
    type: Date,
    default: Date.now,
    required: true
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
}
});

mascotaSchema.methods.toJSON = function() {
    const { __v, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Mascotas', mascotaSchema );

