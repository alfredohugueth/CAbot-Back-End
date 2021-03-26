const { json } = require('express');
const Respuestas = require('../models/Respuestas');
const dialogflow = require('../public/javascripts/dialogflow');

exports.BuscarPreguntasMasComunes = async (req, res) => {
  let information = {};
  let valores = [];
  await Respuestas.aggregate([{
    "$group": { _id: "$user.texto", count: { "$sum": 1 } }
  }, {
    "$sort": { count: -1 }
  }],function (err, docs) {
    if (docs.length > 0) {
      let i = 0;
      information = { "informacion": docs, "fechas": [] };
      
    } else {
      console.log("No hay datos en DB ");
    }

    



  });

  // Ahora llenamos el siguiente vector
  let i=0;
  information = await cargarFechas(information);
  
  res.json(information);
}

async function cargarFechas(information){
  for(let fechas of information.informacion){
    await Respuestas.find({ "user.texto": fechas._id }).then(async (respuestas, error) => {
    if(error){
      console.log(error);
    }else{
      information = await iterarValores(respuestas,information);
      
    }
  });
  
};
console.log(information)
return information;

}

async function iterarValores(respuestas,information){
  for(respuesta of respuestas){
    //Busquemos el valor de la fecha y la pregunta.
    information.fechas.push({"respuesta":respuesta.user.texto,"fecha":respuesta.boot.fecha});
  }
  return information
}

exports.RevisaMensajesAnterioresConID = async (req, res) => {
  console.log(req.body);
  const userID = req.body.id;
  const MensajesAnteriores = await Respuestas.find({ userId: userID });
  console.log(MensajesAnteriores);
  if (MensajesAnteriores.length == 0) {
    console.log("No hay mensajes anteriores con este Id");
    let msgBienve = 'Hola nuevo usuario, mi nombre es CAbot tu asistente de control automatico';
    let msgEnviado = {
      "boot": {
        "estado": true,
        "texto": msgBienve,
        "fecha": new Date()
      },
      user: {
        estado: false,
        texto: ''
      }
    }

    res.json(msgEnviado);
  } else {
    console.log("Hay mensajes anteriores con este id");
    res.json(MensajesAnteriores);
  }
}

exports.mensajeBienvenidaUsuario = (req, res) => {

  // Consultamos a la base de datos si el usuario ha hablado con el bot con anterioridad.

  console.log('Ingreso nuevo usuario a la pagina, enviar primer mensaje del bot.');
  let msgBienve = 'Hola nuevo usuario, mi nombre es CAbot tu asistente de control automatico';
  let msgEnviado = {
    "boot": {
      "estado": true,
      "texto": msgBienve,
      "fecha": new Date()
    },
    user: {
      estado: false,
      texto: ''
    }
  }

  res.json(msgEnviado);
}

exports.PreguntaTextoDeCliente = async (req, res) => {
  try {
    console.log('Mensaje de usuario recibido...');

    let mensaje;
    let msgUsuario = req.body.texto;
    let userID = req.body.userid;
    let fecha = req.body.fechauser;
    // Una vez obtenemos el id para identificar al usuario, realizamos el siguiente cambio.
    // Consultamos a dialogflow la respuesta a la pregunta realizada por el usuario.
    let respuesta = await dialogflow.sendToDialogFlow(msgUsuario, userID, "Angular");
    let tipoPregunta = respuesta[0].queryResult.action;
    console.log(typeof (tipoPregunta));
    console.log(typeof (respuesta[0].outputAudio));
    console.log(typeof (respuesta[0].outputAudioConfig));
    let mensajeRecibido = {
      "userId": userID,
      "tipoPregunta": tipoPregunta,
      "boot": {
        "estado": true,
        "texto": respuesta[0].queryResult.fulfillmentText,
        "voz": respuesta[0].outputAudio,
        "configAudio": respuesta[0].outputAudioConfig,
        "fecha": new Date()
      },
      "user": {
        estado: true,
        texto: respuesta[0].queryResult.queryText,
        fecha: fecha

      }
    }
    console.log(mensajeRecibido);

    // Guardamos respuesta completa en la base de datos.
    mensaje = new Respuestas(mensajeRecibido);

    await mensaje.save();

    // Cambiamos estado de user.
    mensajeRecibido.user.estado = false;


    // Mandamos el mensaje json recibido en el formato establecido por el front de angular
    res.json(mensajeRecibido);
  } catch (error) {
    console.log(error);
    res.status(500).send('Hubo un error en la recepcion del mensaje del cliente');
  }
}

exports.PreguntaVozCliente = async (req, res) => {
  let userID = req.body.id;
  let audioInput = req.files.pregunta.data;
  let respuesta = await dialogflow.sendAudioToDialogflow(audioInput, userID);
  console.log(respuesta);
  let datosPregunda = respuesta[0].queryResult;
  let mensajeAudio = {
    "userId": userID,
    "boot": {
      "estado": true,
      "texto": respuesta[0].queryResult.fulfillmentText,
      "voz": respuesta[0].outputAudio,
      "configAudio": respuesta[0].outputAudioConfig,
      "fecha": new Date()
    },
    user: {
      estado: false,
      texto: datosPregunda.queryText,
      fecha: new Date()
    }
  }
  res.json(mensajeAudio);
}


exports.PreguntasRepetidasConRespuesta = async (req,res)=>{
  await Respuestas.aggregate([
      {"$group": { _id: {"tipo":"$tipoPregunta","Pregunta":"$user.texto","Respuesta":"$boot.texto"} ,count: { "$sum": 1 } }
    }, {
      "$sort": { count: -1 }
    }],
    function (err, docs) {
    if (docs.length > 0) {
      setTimeout(()=>{
        res.json(docs); 
      },1000)
      
    } else {
      console.log("No hay datos en DB ");
      res.end();
    }
   
})
}