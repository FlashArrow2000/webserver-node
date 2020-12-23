const express = require('express')
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        // Valida que un usuario exista en la BD
        if( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            }) 
        }
        // Valida que la contraseña encriptada sea igual a la contraseña en BD
        if (!bcrypt.compareSync( body.password, usuarioDB.password )){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            }) 
        } 

        let token = jwt.sign({
            usuarioDB //este es el payload
        }, process.env.SEED_JWT /*Este es el seed*/, { expiresIn: process.env.CADUCIDAD_TOKEN /*esto es en cuanto expira */ } ); // ¿Como se define en cuanto expira? expiresIn: seg * min * horas * dias

        res.json({
            ok: true,
            usuarioDB,
            token
        })

    });

})

// Configuracions de Google

async function verify( token ) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  return {
      name: payload.name,
      email: payload.email,
      img: payload.picture,
      google: true
  }

}

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token) //Aqui llamamos a la funcion verify que verifica el token de nuestro frontend de Google y lo validamos con el de nuestro backend de google
                        .catch( err => {
                            return res.status(403).json({
                                ok: false,
                                err: {
                                    message: err
                                }
                            })
                        } ); //Con el catch manejamos el error de la promesa

    Usuario.findOne( { email: googleUser.email }, (err, usuarioDB) => { // Aqui ponemos en validacion el email que viene desde Google

        //Aqui, muestra un error si paso algo
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        // Valido el usuario
        if ( usuarioDB ) {
            
            // Si no se encuentra BD un usuario con el correo de google, pero si el usuario ya esta autenticado con google, tira un error
            if ( usuarioDB.google === false ) {

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El usuario ya se registró, debe usar la autenticacion normal'
                    }
                })

            } else { //Aqui le renuevo al ususario que se registro por google desde un inicio, el token

                let token = jwt.sign({
                    usuarioDB
                }, process.env.SEED_JWT, { expiresIn: process.env.CADUCIDAD_TOKEN } ); 
        
                return res.json({
                    ok: true,
                    usuarioDB,
                    token
                })

            }

        } else { //Si no se hizo match del correo de google con uno registrado en la DB, y no estaba registrado antes con el sistema de registro nuestro, procedo a guardar el usuario de BD

            let usuario = new Usuario();

            usuario.name = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save( (err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    }) 
                };

                let token = jwt.sign({
                    usuarioDB
                }, process.env.SEED_JWT, { expiresIn: process.env.CADUCIDAD_TOKEN } ); 
        
                return res.json({
                    ok: true,
                    usuarioDB,
                    token
                })

            } )

        }


    } )

});

module.exports = app;