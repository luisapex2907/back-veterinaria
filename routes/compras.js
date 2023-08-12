const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos } = require('../middlewares');

const {
  crearCompra,
  obtenerCompras,
  obtenerComprasPorUsuario,
  actualizarCompra,
  borrarCompra,
} = require('../controllers/compras');

const { existeProductoPorId } = require('../helpers/db-validators');

const router = Router();

/**
 * {{url}}/api/compras
 */

// Obtener todas las compras - privado
router.get('/', obtenerCompras);

// Obtener una compra por id - privado
router.get('/:id', [

  check('id', 'No es un id de Mongo válido').isMongoId(),
  validarCampos,
], obtenerComprasPorUsuario);

// Crear una compra - privado
router.post('/', [
  validarJWT,
  check('producto', 'El ID del producto es obligatorio').not().isEmpty(),
  check('producto', 'No es un id de Mongo válido').isMongoId(),
  check('producto').custom(existeProductoPorId),
  check('cantidad', 'La cantidad es obligatoria').not().isEmpty(),
  validarCampos,
], crearCompra);

// Actualizar una compra - privado
router.put('/:id', [
  validarJWT,


], actualizarCompra);

// Borrar una compra - privado
router.delete('/:id', [
  validarJWT,
  check('id', 'No es un id de Mongo válido').isMongoId(),
  validarCampos,
], borrarCompra);

module.exports = router;
