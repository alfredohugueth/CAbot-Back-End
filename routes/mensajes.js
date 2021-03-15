var express = require('express');
var router = express.Router();
var dialogflow = require("../public/javascripts/dialogflow.js");
const fs = require('fs');
const util = require('util');
let wav = require('node-wav');


// Primer mensaje del servidor.
router.get('/',(req,res)=>{
    console.log('Ingreso nuevo usuario a la pagina, enviar primer mensaje del bot.');
    let msgBienve = 'Hola nuevo usuario, mi nombre es CAbot tu asistente de control automatico';
    let msgEnviado = {
        "boot":{
        "estado":true,
        "texto":msgBienve,
        "fecha":new Date()
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
        "configAudio": respuesta[0].outputAudioConfig,
        "fecha": new Date()
      },
      user:{
        estado:false,
        texto:'',
        
      }}
      console.log(mensajeRecibido);
    // Mandamos el mensaje json recibido en el formato establecido por el front de angular
    res.json(mensajeRecibido);
});

router.post('/audio',async(req,res)=>{
  let userID = req.body.id;
  let audioInput = req.files.pregunta.data;
  let respuesta = await dialogflow.sendAudioToDialogflow(audioInput,userID);
  console.log(respuesta);
  let datosPregunda = respuesta[0].queryResult;
  

   let mensaje = {
     "mensajeUsuario":datosPregunda.queryText,
     "respuestaBot":datosPregunda.fulfillmentText,
      "voz": respuesta[0].outputAudio,
      "configAudio": respuesta[0].outputAudioConfig
   }

   let mensajeAudio = {
    "boot":{
    "estado":true,
    "texto":respuesta[0].queryResult.fulfillmentText,
    "voz": respuesta[0].outputAudio,
    "configAudio": respuesta[0].outputAudioConfig
  },
  user:{
    estado:false,
    texto: datosPregunda.queryText
  }}
    res.json(mensajeAudio);
});






module.exports= router;

function convertirBuffer(buffer){
  var buf = Buffer.alloc(buffer.byteLength);
  var vista = new Uint8Array(buffer);
  for(var i = 0; i<buf.length; i++){
    buf[i] = vista[i];
  }
  return buf
}