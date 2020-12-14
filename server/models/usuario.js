const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let rolesValidos ={
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let usuarioSchema = new Schema({
    name: {
        type: String, 
        required: [true, 'Name is necessary']
    },
    email: {
        type: String, 
        unique: true,
        required: [true, 'Email is necessary']
    },
    password: {
        type: String, 
        required: [true, 'Password is necessary']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: [true, 'Role is necessary'], 
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true,
        required: false
    },
    google: {
        type: Boolean,
        default: false,
        required: false
    },
});

usuarioSchema.methods.toJSON = function () {
    
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser único' } )

module.exports = mongoose.model( 'Usuario', usuarioSchema );


