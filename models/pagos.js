const { Schema, model } = require('mongoose');

const PagoSchema = Schema({
    estado: {
      type: Boolean,
      default: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,

    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'PlanesC',
      required: false,

    },
    fechaIngreso: {
      type: Date,
      default: Date.now() - (5 * 60 * 60 * 1000),
      required: true
    },
    total: {
      type: Number,
      default: 0
    },
    productos: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Producto',
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
        },
      },
    ],
    
    citas: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Cita',
          required: true,
        },
      },
    ],
    
  });
  


PagoSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Pago', PagoSchema );
