const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const { crearMascota,obtenerMascotas,
  obtenerMascota, actualizarMascota,borrarMascota,buscarMascotasPorUsuario} = require('../controllers/mascotas');
const { existeMascotaPorId,existeUsuarioPorId } = require('../helpers/db-validators');

const router = Router();

router.get('/',obtenerMascotas);

router.get('/:id',[
  check('id', 'No es un id de Mongo válido').isMongoId(),
  check('id').custom( existeMascotaPorId ),
  validarCampos,
], obtenerMascota );

router.get('/usuario/:idUsuario',[
check('idUsuario','No es un id de Mongo Válido').isMongoId(),
check('idUsuario').custom( existeUsuarioPorId ),
], buscarMascotasPorUsuario);


router.post('/', [
  validarJWT,
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('raza', 'La raza es obligatoria').not().isEmpty(),
  check('edad_mascota', 'La edad de la mascota es obligatoria').not().isEmpty(),
  check('sexo', 'El sexo de la mascota es obligatoria').not().isEmpty(),
  check('color', 'El color de la mascota es obligatoria').not().isEmpty(),
  validarCampos
], crearMascota);

router.put('/:id',[
  validarJWT,
  check('id').custom( existeMascotaPorId ),
  validarCampos
],actualizarMascota );


router.delete('/:id',[
  validarJWT,
  check('id', 'No es un id de Mongo válido').isMongoId(),
  check('id').custom( existeMascotaPorId ),
  validarCampos,
],borrarMascota);


module.exports = router;
