const express = require('express')
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const _ = require('underscore');   

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express()

    app.get('/usuario', verificaToken, (req, res) => {
    
        let desde = req.query.desde || 0;
        desde = Number(desde);

        let limite = req.query.limite || 5;
        limite = Number(limite);

        //Esto es para hacer un GET paginado. Donde la func exec recibe como argumento un error y un arreglo de usuarios. 
        // Lo que esta despues de la coma y entre comillas, son los campos o propiedades que quiero devolver.
        // En este caso, solo quiero devolver los usuarios y sus propiedades mientras el estado sea true
        Usuario.find({estado: true}, 'name email role estado google img')
                .skip(desde)
                .limit(limite)
                .exec( (err, usuarios) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        }) 
                    }

                    // Aqui contamos cuantos registros hay, y la func .conuntDocuments debe de tener la misma condicion que el .find de arriba.
                    Usuario.countDocuments({estado: true}, (err, conteo) => {

                        res.json({
                            ok: true,
                            usuarios,
                            cantidad: conteo
                        });

                    })

                } )
    
    })
  
  app.post('/usuario', [verificaToken, verificaAdmin_Role], function (req, res) {
    
      let body = req.body;
  
        let usuario = new Usuario({
            name: body.name,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            role: body.role
        });

        // Asi se guarda en BD
        usuario.save( (err, usuarioDB) => {

            // Si existe un error, manda un bad request y aqui termina
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                }) 
            }
            // Si no hay errores, guarda en BD
            res.json({
                ok: true,
                usuario: usuarioDB
            })
        } )
  
  })
  
    // ACtualiza en BD
  app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
      let id = req.params.id;
      let body = _.pick(req.body, ['name','email','img','role','estado']); //Aqui utilizamos la libreria Underscore.js, y utilizamos la funcion pick, para devolver solo las propiedades que necesitamos

      Usuario.findByIdAndUpdate( id, body, {new: true, runValidators: true}, (err, usuarioDB) => {

        // Si existe un error, manda un bad request y aqui termina
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            }) 
        }
        
        res.json({
            ok: true,
            usuario: usuarioDB
        })

      } )

  })
  
    //Usualmente no se eliminar registros de la base de datos, solamente se desactiva. Esto para mantener la integridad de los datos y llevar registros.   
    // Para eso usamos la func findByIdAndUpdate. Ya si queremos eliminar el usuario fisicamente, utilizamos el findByIdAndRemove 
  app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {

    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    }

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true, useFindAndModify: true}, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            }) 
        }

        if( !usuarioBorrado ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }
        
        res.json({
            ok: true,
            usuarioBorrado
        })

    })

  })

  module.exports = app;