const { Schema, model } = require('mongoose');

const CarritoSchema = Schema({
    estado: {
      type: Boolean,
      default: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      unique:true
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
  


CarritoSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Carrito', CarritoSchema );
