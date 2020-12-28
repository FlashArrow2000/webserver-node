const jwt = require("jsonwebtoken");


// ============= 
// Verificar Token 
// =============

let verificaToken = (req, res, next) => {

    let token = req.get('token'); //El req.get() sirve para obtener del request, los headers. 

    jwt.verify( token, process.env.SEED_JWT, (err, decoded) => {
        // El segundo argumento del callback llamado decoded es el payload, es decir, contiene toda la info del usuario

        if (err) {
            return res.status(401).json({
                ok: false,
                err:{
                    message: 'Token no valido'
                }
            })
        }

        req.usuarioDB = decoded.usuarioDB;

        next();

    })

};

// ============= 
// Verificar Admin 
// =============

let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuarioDB;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    }else{
        return res.status(401).json({
            ok: false,
            err:{
                message: 'El usuario no tiene permisos'
            }
        })
    }

};

// ============= 
// Verificar token para imagen 
// =============

let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify( token, process.env.SEED_JWT, (err, decoded) => {
        // El segundo argumento del callback llamado decoded es el payload, es decir, contiene toda la info del usuario

        if (err) {
            return res.status(401).json({
                ok: false,
                err:{
                    message: 'Token no valido'
                }
            })
        }

        req.usuarioDB = decoded.usuarioDB;

        next();

    })

};

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}