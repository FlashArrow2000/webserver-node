const express = require('express')
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

module.exports = app;