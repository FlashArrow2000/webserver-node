const express = require('express');
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
let Categoria = require('../models/categoria');
const _ = require('underscore');
const categoria = require('../models/categoria');

let app = express();



// TODO: Tenemos que crear 5 servicios, en todas necesito el token

app.get('/categoria', verificaToken, (req, res) => {
    // Aqui muestra todas las categorias

    Categoria.find({})
        .sort('descripcion') //Para ordenar de manera alfabetica la descripcion
        .populate('usuarioDB', 'name email role') // Para mostrar datos que sean tomados por el usuario, en su segundo arg, indica cuales campos deseo mostrar
        .exec( (err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                }) 
            }

            res.json({
                ok: true,
                categorias
            }) 

        } )

});
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Muestra una categoria por ID
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err:{
                    message: 'El id no es correcto'
                }
            }) 
        }

        res.json({
            ok: true,
            categoriaDB
        })

    })

});
app.post('/categoria', verificaToken, (req, res) => {
    // Crea nueva categoria

    let body =  req.body;

    let categoria = new Categoria({

        descripcion: body.descripcion,
        usuarioDB: req.usuarioDB._id

    });

    categoria.save( (err, categoriaDB) => {

        // Si existe un error, manda un bad request y aqui termina
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        // Error si la categoria no se creo
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            }) 
        }

        // Si no hay errores, guarda en BD
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    } )

    // Regresa nueva categoria
});

app.put('/categoria/:id', (req, res) => {
    // Actualiza la categoria

    let id = req.params.id;
    let body = _.pick(req.body, 'descripcion'); 

    Categoria.findByIdAndUpdate( id, body, {new: true, runValidators: true}, (err, categoriaDB) => {

        // Si existe un error, manda un bad request y aqui termina
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        // Error si la categoria no se creo
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            }) 
        }

        // Si no hay errores, guarda en BD
        res.json({
            ok: true,
            categoria: categoriaDB
        })

      } )
});

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // Elimina una categoria
    // Solo un admin puede borrar 

    let id = req.params.id;

    categoria.findByIdAndRemove( id, (err, categoriaDB) => {

        // Si existe un error, manda un bad request y aqui termina
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        // Error si la categoria no se creo
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "El id no existe"
                }
            }) 
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        })

    } )

});

module.exports = app;