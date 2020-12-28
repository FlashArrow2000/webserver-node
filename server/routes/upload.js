const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');   
const path = require('path');

app.use( fileUpload() );

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;



    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    // Valida tipo usuario o categoria
    let tiposValidos = ['productos', 'usuarios'];

    if(tiposValidos.indexOf( tipo ) < 0 ){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los únicos tipos válidos son: ' + tiposValidos.join(', '),
                tipoRecibido: tipo
            }
        })
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let archivo = req.files.archivo;
  let nombreArchivoSegmentado = archivo.name.split('.'); //Aqui parto el archivo en dos, su nombre y la extencion
  let extencion  = nombreArchivoSegmentado[nombreArchivoSegmentado.length -1]; //Aqui igualo una variable a la extencion del archivo para luego validar

  // Extenciones permitidas
  let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

//   console.log(extencionesValidas.indexOf( extencion )); Este clg es para explicar la validacion a continuacion. Aqui, si la func .indexOf encuentra en el arreglo extencionesValidas, un dato que es igual a la variable extencion, devuelve un 1, sino, un -1

//   Esta condicional es para valdiar cuales extenciones o tipos de archivos queremos
  if( extencionesValidas.indexOf( extencion ) < 0 ){
    return res.status(400).json({
        ok: false,
        err: {
            message: 'Las únicas extenciones permitidas son: ' + extencionesValidas.join(', '),
            extRecibida: extencion
        }
    })
  }

//   Cambia nombre al archivo
     let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencion}`

     archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
         if (err)
         return res.status(500).json({
             ok: false,
             err
         });

         // Aqui llamamos las funcs que actualizan la foto del usuario o del producto. Se necesita el ID, la respuesta del servicio y el nombre del archivo
         if(tipo === 'usuarios'){
             imagenUsuario(id, res, nombreArchivo);
         }else {
             imagenProducto(id, res, nombreArchivo);
         }

     });

});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if(err){

            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            })
        }

        if( !usuarioDB ){

            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            })
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            return res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })

        } )

    })
}

function imagenProducto(id, res, nombreArchivo) {
    
    Producto.findById(id, (err, productoDB) => {

        if(err){

            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            })
        }

        if( !productoDB ){

            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            })
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            return res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })

        } )

    })

}

function borraArchivo(nombreIMG, tipo) {

    // Aqui validamos si ya existe una imagen de BD en una ruta del server
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreIMG }`)

    // La idea de esto es para que cuando yo suba una imagen nueva, no se clone, sino que solo se guarde una img por usuario
    if( fs.existsSync(pathImagen) ){
        fs.unlinkSync(pathImagen); //Esto es para borrar el path, en este caso, la imagen
    }
    
}

module.exports = app;

