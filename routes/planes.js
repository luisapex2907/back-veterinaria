const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos } = require('../middlewares');

const { crearPlanC,
        obtenerPlanesC,
        borrarPlan
         } = require('../controllers/planesC');

const { existeCarritoPorId } = require('../helpers/db-validators');

const router = Router();

router.get('/', obtenerPlanesC );


router.post('/',validarJWT,  validarCampos, crearPlanC);


router.delete('/:id', [
    check('id', 'No es un id de Mongo válido').isMongoId(),
    validarCampos, // Asegúrate de que validarCampos no bloquee la ejecución de borrarPlan
  ], borrarPlan);
  


module.exports = router;