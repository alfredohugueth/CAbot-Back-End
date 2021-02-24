var express = require('express');
var router = express.Router();

// Primer mensaje del servidor.
router.get('/',(req,res)=>{
    console.log('Ingreso nuevo usuario a la pagina, enviar primer mensaje del bot.');
    let msgBienve = 'Hola nuevo usuario, mi nombre es CAbot tu asistente de control automatico';
    let botmsg = {
        "texto":msgBienve
    }
    res.json(botmsg);
});


module.exports= router;