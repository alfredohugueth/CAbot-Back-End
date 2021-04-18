const mongoose = require('mongoose');

const RespuestasSchema = mongoose.Schema({
    "userId":{
        type:String,
        required:true
    },
    "tipoPregunta":{
        type:String,
        required:false
    },
    "boot":{
        "estado":{
            type:Boolean,
            required:true
        },
        "texto":{
            type:String,
            required:true
        },
        "voz":{
            type:Object,
            required:true
        },
        "configAudio":{
            type:Object,
            required:true
        },
        "fecha":{
            type:Date,
            required:true
        },
        "fundamento":{
            type:Boolean,
            
        },
        "mostrarImaneg":{
            type:Boolean
        },
        "imagen":{
            type:String
        }
        
    },
    "user":{
        "estado":{
            type:Boolean,
            required:true
        },
        "texto":{
            type:String,
            required:true
        },
        "fecha":{
            type:Date,
            required:true
        }
    }


});

module.exports = mongoose.model('preguntas',RespuestasSchema);



