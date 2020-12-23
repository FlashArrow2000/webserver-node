

//  =================
//  Puerto
//  =================

process.env.PORT = process.env.PORT || 3000;

//  =================
//  Entorno
//  =================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; 

//  =================
//  Vencimiento del Token
//  =================

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//  =================
//  SEED de autenticacion del JWT
//  =================

process.env.SEED_JWT = process.env.SEED_JWT || 'PgIdBvInYjbFFBm'

//  =================
//  Ambiente Base de datos
//  =================

let urlDB;

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe' 
} else{
    urlDB = process.env.MONGO_URI;
}

process.env.URL_DB = urlDB;

//  =================
//  Google Client
//  =================

process.env.CLIENT_ID = process.env.CLIENT_ID || '530021207507-q89b0a0ofkhlfcqobue45gsbqqvv0kkj.apps.googleusercontent.com';
