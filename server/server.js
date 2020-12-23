require('./config/config');
const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path')

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// habilitar la carpeta public
app.use( express.static( path.resolve(__dirname, '../public') ) );

// Configuracion global de rutas
app.use( require('./routes/index') );

mongoose.connect(process.env.URL_DB, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true}, (err, resp) => {
  
  if( err ) throw err;

  console.log('Base de datos Online');

} );
 
app.listen(process.env.PORT, () => console.log('Escuchando puerto:', process.env.PORT) )