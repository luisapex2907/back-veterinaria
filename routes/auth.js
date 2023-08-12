const { Router } = require('express');
const { check } = require('express-validator');

require('dotenv').config();

const { validarCampos, validarJWT } = require('../middlewares');


const { login, googleSignin, validarTokenUsuario,resetPassword,resetPasswordChange } = require('../controllers/auth');


const router = Router();

router.post('/login',[
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
],login );
router.post('/ressetPassword',[
    check('email', 'El correo es obligatorio').isEmail(),

    validarCampos
],resetPassword );

router.post('/ressetPasswordChange/:token',[

    validarCampos
],resetPasswordChange );

router.post('/google',[
    check('id_token', 'El id_token es necesario').not().isEmpty(),
    validarCampos
], googleSignin );


router.get('/',[
    validarJWT
], validarTokenUsuario );



module.exports = router;