
const express = require('express');
const fs = require('fs');   
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo  = req.params.tipo;
    let img  = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ img }`);

    if (fs.existsSync( pathImagen )) {
        res.sendFile(pathImagen);
    }else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg'); //Esto es un path absoluto, o valido, porque se creó con la libreria de node llamada path.
        res.sendFile(noImagePath); //Este sendFile necesita un path absoluto
    }

})

module.exports = app;
