const { response } = require('express');
const bcryptjs = require('bcryptjs')

const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');

const { generarJWT } = require('../helpers/generar-jwt');
const { googleVerify } = require('../helpers/google-verify');
const nodemailer = require('nodemailer');

const resetPassword = async (req, res = response) => {
    const { email } = req.body;
  
    try {
      // Verificar si el email existe
      const usuario = await Usuario.findOne({ correo: email });
      if (!usuario) {
        return res.status(400).json({
          msg: 'El correo electrónico proporcionado no está registrado',
        });
      }
  
      // Generar el token de restablecimiento de contraseña
      const token = jwt.sign(
        { id: usuario._id },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
  
      // Enviar el correo electrónico con el token
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'perros.mas.felices.veterinaria@gmail.com',
          pass: 'dkdidddsbxgjnfoj',
          // pass: 'dr.valencia',
        },
      });
  
      const mailOptions = {
        from: 'perros.mas.felices.veterinaria@gmail.com',
        to: email,
        subject: 'Restablecimiento de Contraseña',
        html: `
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Por favor, haz clic en el siguiente enlace para continuar:</p>
          <a href="https://veterinaria-perros-mas-felices.firebaseapp.com/#/auth/ressetPasswordP/?token=${token}">Restablecer Contraseña</a>
        `,
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            msg: 'Ha ocurrido un error al enviar el correo electrónico',
          });
        }
  
        console.log('Correo electrónico enviado:', info.response);
  
        res.json({
          msg: 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña',
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: 'Ha ocurrido un error al restablecer la contraseña',
      });
    }
  };





  const resetPasswordChange = async (req, res = response) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
          if (error) {
            reject(error);
          } else {
            console.log("DECODED: ", decodedToken);
            resolve(decodedToken);
          }
        });
      }).catch((e) => {
        console.log(e);
        throw new Error("Token is not valid");
      });

      const userId = decoded.id;

      console.log("USER ID DECODED: ", userId);

      const userRetrieved = await Usuario.findOne({ _id: userId });

      if (!userRetrieved) {
        throw new Error("User not found");
      }

      const salt = bcryptjs.genSaltSync();
      // usuario.password = bcryptjs.hashSync( password, salt );
      const hashedPassword = bcryptjs.hashSync(password, salt);

      await Usuario.findByIdAndUpdate(
        userId,
        {
          password: hashedPassword,
        },
        { new: false }
      );

      return res.json("User password updated successfully");
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: "Ha ocurrido un error al restablecer la contraseña",
      });
    }
  };





  
const login = async(req, res = response) => {

    const { correo, password } = req.body;

    try {
      
        // Verificar si el email existe
        const usuario = await Usuario.findOne({ correo });
        if ( !usuario ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - correo'
            });
        }

        // SI el usuario está activo
        if ( !usuario.estado ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - estado: false'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync( password, usuario.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - password'
            });
        }

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        res.json({
            usuario,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }   

}


const googleSignin = async(req, res = response) => {

    const { id_token } = req.body;
    
    try {
        const { correo, nombre, img } = await googleVerify( id_token );

        let usuario = await Usuario.findOne({ correo });

        if ( !usuario ) {
            // Tengo que crearlo
            const data = {
                nombre,
                correo,
                password: ':P',
                img,
                google: true
            };

            usuario = new Usuario( data );
            await usuario.save();
        }

        // Si el usuario en DB
        if ( !usuario.estado ) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }

        // Generar el JWT
        const token = await generarJWT( usuario.id );
        
        res.json({
            usuario,
            token
        });
        
    } catch (error) {

        res.status(400).json({
            msg: 'Token de Google no es válido'
        })

    }



}

const validarTokenUsuario = async (req, res = response ) => {

    // Generar el JWT
    const token = await generarJWT( req.usuario._id );
    
    res.json({
        usuario: req.usuario,
        token: token,
    })

}



module.exports = {
    login,
    googleSignin,
    validarTokenUsuario,
    resetPassword,
    resetPasswordChange
}
