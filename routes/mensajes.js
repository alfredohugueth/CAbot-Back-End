var express = require('express');
var router = express.Router();
var dialogflow = require("../public/javascripts/dialogflow.js");

// Primer mensaje del servidor.
router.get('/',(req,res)=>{
    console.log('Ingreso nuevo usuario a la pagina, enviar primer mensaje del bot.');
    let msgBienve = 'Hola nuevo usuario, mi nombre es CAbot tu asistente de control automatico';
    let msgEnviado = {
        "boot":{
        "estado":true,
        "texto":msgBienve
      },
      user:{
        estado:false,
        texto:''
      }}
    
    res.json(msgEnviado);
});

router.post('/usuario',async(req,res)=>{


    console.log('Mensaje de usuario recibido...');
    let msgUsuario = req.body.texto;
    let userID = req.body.userID;
    // Una vez obtenemos el id para identificar al usuario, realizamos el siguiente cambio.
    // Consultamos a dialogflow la respuesta a la pregunta realizada por el usuario.
    let respuesta = await dialogflow.sendToDialogFlow(msgUsuario,userID,"Angular");
    let mensajeRecibido = {
        "boot":{
        "estado":true,
        "texto":respuesta[0].queryResult.fulfillmentText,
        "voz": respuesta[0].outputAudio,
        "configAudio": respuesta[0].outputAudioConfig
      },
      user:{
        estado:false,
        texto:''
      }}
      console.log(mensajeRecibido);
    // Mandamos el mensaje json recibido en el formato establecido por el front de angular
    res.json(mensajeRecibido);
});


module.exports= router;