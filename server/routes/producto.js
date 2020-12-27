
const express = require('express');
let { verificaToken } = require('../middlewares/autenticacion');
const _ = require('underscore');
let Producto = require('../models/producto');

let app = express();


/**
 * Obtener todos los productos
 */
 app.get('/producto', verificaToken, (req, res) => {
    //  Trae todos los productos de forma paginada

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({disponible: true})
    .sort('nombre')
    .skip(desde)
    .limit(limite)
    .populate('usuarioDB', 'name email role') // Para mostrar datos que sean tomados por el usuario, en su segundo arg, indica cuales campos deseo mostrar
    .populate('categoria', 'descripcion') // Para mostrar datos que sean tomados por el usuario, en su segundo arg, indica cuales campos deseo mostrar
    .exec( (err, productos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        Producto.countDocuments({disponible: true}, (err, conteo) => {

            res.json({
                ok: true,
                productos,
                cantidad: conteo
            });

        })

    } )

 }); 
 
 /**
 * Obtener un producto por id
 */
app.get('/producto/:id', verificaToken, (req, res) => {
    //  Trae productos por id

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err:{
                    message: 'El id no es correcto'
                }
            }) 
        }

        res.json({
            ok: true,
            productoDB
        })

    })//Aqui hacemos los populates
    .populate('usuarioDB', 'name email role') 
    .populate('categoria', 'descripcion') 

 });

 /**
  * Buscar productos por el nombre
  */
  app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = RegExp( termino, 'i' ); //Esto crea una nueva expresion regular. En donde recibimos el termino, y ponemos una 'i' para que sea insensible a las mayuscalas

    Producto.find({nombre: regex})
    .populate('categoria', 'descripcion')
    .exec((err, productos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        res.json({
            ok: true,
            productos
        })

    })

  })

/**
 * Crear un nuevo producto
 */
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    // Se hace una nueva instancia del producto
    let producto = new Producto({

        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuarioDB: req.usuarioDB._id

    });

    producto.save( (err, productoDB) => {

        // Si existe un error, manda un bad request y aqui termina
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        // Error si la categoria no se creo
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            }) 
        }

        // Si no hay errores, guarda en BD
        res.json({
            ok: true,
            producto: productoDB
        })
    } )

 });

/**
 * Actualizar un producto 
 */
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']); 

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoDB) => {

        // Si existe un error, manda un bad request y aqui termina
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }) 
        }

        // Error si la categoria no se creo
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `El producto con el ID ${id} no existe`
                }
            }) 
        }

        // Si no hay errores, guarda en BD
        res.json({
            ok: true,
            producto: productoDB
        })

    })

 });

/**
 * Borrar un producto 
 */
app.delete('/producto/:id', verificaToken, (req, res) => {
    // disponible debe pasar a falso

    let id = req.params.id;

    let cambiaDisponibilidad = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambiaDisponibilidad, {new: true, useFindAndModify: true}, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            }) 
        }

        if( !productoBorrado ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            })
        }
        
        res.json({
            ok: true,
            productoEliminado: productoBorrado
        })

    })


});


module.exports = app;
