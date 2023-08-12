const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos } = require('../middlewares');

const {crearCita, obtenerHorasDisponibles,obtenerCitas,borrarCita,actualizarCita, obtenerCitasPorUsuario,obtenerCitasFiltradas} = require('../controllers/citas');

const {  } = require('../helpers/db-validators');

const router = Router();

router.get('/horas-disponibles/:fecha', obtenerHorasDisponibles);
router.get('/', obtenerCitas);
router.get('/filtradas', obtenerCitasFiltradas);
router.get('/:id', obtenerCitasPorUsuario);

// Crear una cita - privado - solo para usuarios autenticados
router.post('/', [
    validarJWT,
    // Aquí debes incluir las validaciones necesarias para los campos de la cita
    // Por ejemplo: check('servicioId', 'El servicioId es obligatorio').not().isEmpty(),
    //             check('fecha', 'La fecha es obligatoria').not().isEmpty(),
    //             check('hora', 'La hora es obligatoria').not().isEmpty(),
    //             validarCampos,
  ], crearCita);
  router.put('/:id',[
    validarJWT,

    validarCampos
],actualizarCita );

  router.delete('/:id',[
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),

    validarCampos,
],borrarCita);

  
module.exports = router;
