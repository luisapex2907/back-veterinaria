const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos } = require('../middlewares');

const { crearPlanC,
        obtenerPlanesC,
        obtenerPlanesCUsuario,
        borrarPlan,
        disminuirCantidadServicio 
         } = require('../controllers/planesU');

const { existeCarritoPorId } = require('../helpers/db-validators');

const router = Router();

router.get('/', obtenerPlanesC );

router.get('/:id', obtenerPlanesCUsuario );


router.post('/',validarJWT,  validarCampos, crearPlanC);


router.delete('/:id',[
    validarJWT,

    check('id', 'No es un id de Mongo válido').isMongoId(),

    validarCampos,
], borrarPlan);

router.put('/:planId/disminuir-cantidad', async (req, res) => {
    const { planId } = req.params;
    const { servicioId } = req.body;
  
    try {
      // Agregar aquí la lógica para disminuir la cantidad del servicio en el plan
      // Utiliza la función disminuirCantidadServicio que definimos previamente
      await disminuirCantidadServicio(planId, servicioId);
      res.json({ msg: "Cantidad del servicio disminuida exitosamente en el plan" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


module.exports = router;