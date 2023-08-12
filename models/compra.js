const { Schema, model } = require('mongoose');

const CompraSchema = Schema({
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    comprobante: {
        type: Boolean,
        default: false,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    fechaIngreso: {
        type: Date,
        default: Date.now,
        required: true
      },
      
});


CompraSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Compra', CompraSchema );
