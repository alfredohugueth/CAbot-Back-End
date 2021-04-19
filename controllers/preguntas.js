const { json } = require("express");
const Respuestas = require("../models/Respuestas");
const dialogflow = require("../public/javascripts/dialogflow");

exports.BuscarPreguntasMasComunes = async (req, res) => {
  let information = {};
  let valores = [];
  await Respuestas.aggregate(
    [
      {
        $group: { _id: "$user.texto", count: { $sum: 1 } },
      },
      {
        $sort: { count: -1 },
      },
    ],
    function (err, docs) {
      if (docs.length > 0) {
        let i = 0;
        information = { informacion: docs, fechas: [] };
      } else {
        console.log("No hay datos en DB ");
      }
    }
  );

  // Ahora llenamos el siguiente vector
  let i = 0;
  information = await cargarFechas(information);

  res.json(information);
};

async function cargarFechas(information) {
  for (let fechas of information.informacion) {
    await Respuestas.find({ "user.texto": fechas._id }).then(
      async (respuestas, error) => {
        if (error) {
          console.log(error);
        } else {
          information = await iterarValores(respuestas, information);
        }
      }
    );
  }
  console.log(information);
  return information;
}

async function iterarValores(respuestas, information) {
  for (respuesta of respuestas) {
    //Busquemos el valor de la fecha y la pregunta.
    information.fechas.push({
      respuesta: respuesta.user.texto,
      fecha: respuesta.boot.fecha,
    });
  }
  return information;
}

exports.RevisaMensajesAnterioresConID = async (req, res) => {
  console.log(req.body);
  const userID = req.body.id;
  const MensajesAnteriores = await Respuestas.find({ userId: userID });
  console.log(MensajesAnteriores);
  if (MensajesAnteriores.length == 0) {
    console.log("No hay mensajes anteriores con este Id");
    let msgBienve =
      "Hola nuevo usuario, mi nombre es CAbot tu asistente de control automatico";
    let msgEnviado = {
      boot: {
        estado: true,
        texto: msgBienve,
        fecha: new Date(),
      },
      user: {
        estado: false,
        texto: "",
      },
    };

    res.json(msgEnviado);
  } else {
    console.log("Hay mensajes anteriores con este id");
    res.json(MensajesAnteriores);
  }
};

exports.mensajeBienvenidaUsuario = (req, res) => {
  // Consultamos a la base de datos si el usuario ha hablado con el bot con anterioridad.

  console.log(
    "Ingreso nuevo usuario a la pagina, enviar primer mensaje del bot."
  );
  let msgBienve =
    "Hola nuevo usuario, mi nombre es CAbot tu asistente de control automatico";
  let msgEnviado = {
    boot: {
      estado: true,
      texto: msgBienve,
      fecha: new Date(),
    },
    user: {
      estado: false,
      texto: "",
    },
  };

  res.json(msgEnviado);
};

exports.PreguntaTextoDeCliente = async (req, res) => {
  try {
    console.log("Mensaje de usuario recibido...");
    let mensajeRecibido;
    let mensaje;
    let msgUsuario = req.body.texto;
    let userID = req.body.userid;
    let fecha = req.body.fechauser;
    // Una vez obtenemos el id para identificar al usuario, realizamos el siguiente cambio.
    // Consultamos a dialogflow la respuesta a la pregunta realizada por el usuario.
    let respuesta = await dialogflow.sendToDialogFlow(
      msgUsuario,
      userID,
      "Angular"
    );
    //Buscamos el payload ...
    console.log('Hasta aca bien');
    let payload;
    try{
     payload =
      respuesta[0].queryResult.fulfillmentMessages[1].payload.fields.element
        .structValue.fields;
        console.log(payload);
        //Verificamos que tenga Imagen, caso contrario
        if (payload.image) {
          //Buscamos el fundamento ...
          let fundamento = Boolean(payload.Fundamento.stringValue);
          mensajeRecibido = {
            userId: userID,
            tipoPregunta: respuesta[0].queryResult.intent.displayName,
            boot:{
              estado: true,
              texto: respuesta[0].queryResult.fulfillmentText,
              voz: respuesta[0].outputAudio,
              configAudio: respuesta[0].outputAudioConfig,
              fecha: new Date(),
              mostrarImagen:true,
              imagen: payload.image.stringValue,
              fundamento: fundamento
            },
            user: {
              estado: true,
              texto: respuesta[0].queryResult.queryText,
              fecha: fecha,
            },
          };
        }else{
        //console.log(JSON.stringify(respuesta[0].queryResult.fulfillmentMessages));
        let tipoPregunta = respuesta[0].queryResult.intent.displayName;
        mensajeRecibido = {
          userId: userID,
          tipoPregunta: tipoPregunta,
          boot: {
            estado: true,
              texto: respuesta[0].queryResult.fulfillmentText,
              voz: respuesta[0].outputAudio,
              configAudio: respuesta[0].outputAudioConfig,
              fecha: new Date(),
              mostrarImagen:false,
              imagen: '',
              MasPreguntas: true
          },
          user: {
            estado: true,
            texto: respuesta[0].queryResult.queryText,
            fecha: fecha,
          },
        }
      }
    
        // Guardamos respuesta completa en la base de datos.
        mensaje = new Respuestas(mensajeRecibido);
    
        await mensaje.save();
    
        // Cambiamos estado de user.
        mensajeRecibido.user.estado = false;
    
        // Mandamos el mensaje json recibido en el formato establecido por el front de angular
        res.json(mensajeRecibido);
        
    }catch(err){
      console.log('No hay payload en el mensaje');
      //Ejecuto normalmente la respuesta
      let tipoPregunta = respuesta[0].queryResult.action;
      mensajeRecibido = {
        userId: userID,
        tipoPregunta: respuesta[0].queryResult.intent.displayName,
        boot:{
          estado: true,
          texto: respuesta[0].queryResult.fulfillmentText,
          voz: respuesta[0].outputAudio,
          configAudio: respuesta[0].outputAudioConfig,
          fecha: new Date(),
          mostrarImagen:false,
          imagen: '',
          fundamento: false
        },
        user: {
          estado: true,
          texto: respuesta[0].queryResult.queryText,
          fecha: fecha,
        },
      }

        mensaje = new Respuestas(mensajeRecibido);
    
        await mensaje.save();
    
        // Cambiamos estado de user.
        mensajeRecibido.user.estado = false;
    
        // Mandamos el mensaje json recibido en el formato establecido por el front de angular
        res.json(mensajeRecibido);
    }
    
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send("Hubo un error en la recepcion del mensaje del cliente");
  }
};

exports.PreguntaVozCliente = async (req, res) => {
  let userID = req.body.id;
  let audioInput = req.files.pregunta.data;
  let respuesta = await dialogflow.sendAudioToDialogflow(audioInput, userID);
  console.log(respuesta);
  let datosPregunda = respuesta[0].queryResult;
  let mensajeAudio = {
    userId: userID,
    boot: {
      estado: true,
      texto: respuesta[0].queryResult.fulfillmentText,
      voz: respuesta[0].outputAudio,
      configAudio: respuesta[0].outputAudioConfig,
      fecha: new Date(),
    },
    user: {
      estado: false,
      texto: datosPregunda.queryText,
      fecha: new Date(),
    },
  };
  res.json(mensajeAudio);
};

exports.PreguntasRepetidasConRespuesta = async (req, res) => {
  await Respuestas.aggregate(
    [
      {$match: {"boot.fundamento":true}},
       {
        $group: {
          _id: {
            Pregunta: "$tipoPregunta",
            Respuesta: "$boot.texto",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      { $limit:5}
    ],
    function (err, docs) {
      console.log(docs);
      if (docs.length > 0) {
        res.json(docs);
      } else {
        console.log("No hay datos en DB ");
        res.end();
      }
    }
  );
};

exports.NumeroPreguntasConFundamentoRealizadas = async (req,res)=>{
  let numeroDePreguntasConFundamento = await Respuestas.countDocuments({"boot.fundamento":true});
  res.json({numeroPreguntasFundamentos:numeroDePreguntasConFundamento});
}


exports.QuieroPreguntarMas = async (req,res)=>{
  /* Recibimos respuesta del usuario sobre su deseo de realizar mas preguntas*/
  let msgUsuario = req.body.text;
  
  let userID = req.body.userID;
  console.log(msgUsuario);
  console.log(userID);
  let respuesta = await dialogflow.sendToDialogFlow(
    msgUsuario,
    userID,
    "Angular"
  );

  /* Enviamos información de vuelta al usuario */
  let tipoPregunta = respuesta[0].queryResult.action;
  let mensajeRecibido = {
    userId: userID,
    tipoPregunta: tipoPregunta,
    boot: {
      estado: true,
        texto: respuesta[0].queryResult.fulfillmentText,
        voz: respuesta[0].outputAudio,
        configAudio: respuesta[0].outputAudioConfig,
        fecha: new Date(),
        mostrarImagen:false,
        imagen: '',
        MasPreguntas: false
    },
    user: {
      estado: false,
      texto: '',
      fecha: '',
    },
  }

  /* Enviamos nuevamente al cliente */

  res.json(mensajeRecibido);
  

}


exports.calificarSi = async (req,res) =>{
  /* Recibimos deseo de calificacion y lo enviamos a dialogflow */

  let msgUsuario = req.body.text;
  
  let userID = req.body.userID;
  console.log(msgUsuario);
  console.log(userID);
  let respuesta = await dialogflow.sendToDialogFlow(
    msgUsuario,
    userID,
    "Angular"
  );
  
  /* En este caso no es necesario el proyectar esta respuesta en el html, por lo tanto, enviamos status*/
  
  res.json({texto:'Realiza la calificacion'});

}


exports.calificacion = async (req,res)=>{
  /* Recibimos calificacion del usuario */

  let msgUsuario = req.body.text;
  
  let userID = req.body.userID;
  console.log(msgUsuario);
  console.log(userID);
  let respuesta = await dialogflow.sendToDialogFlow(
    msgUsuario,
    userID,
    "Angular"
  );

  /* Enviamos respuesta en el formato elegido para el proyecto*/

  let mensajeRecibido = {
    userId: userID,
    
    boot: {
      estado: true,
        texto: respuesta[0].queryResult.fulfillmentText,
        voz: respuesta[0].outputAudio,
        configAudio: respuesta[0].outputAudioConfig,
        fecha: new Date(),
        mostrarImagen:false,
        imagen: '',
        MasPreguntas: false
    },
    user: {
      estado: false,
      texto: '',
      fecha: '',
    },
  }

  res.json(mensajeRecibido)


}


exports.noCalifica = async(req,res) =>{

  let msgUsuario = req.body.text;
  
  let userID = req.body.userID;
  console.log(msgUsuario);
  console.log(userID);
  let respuesta = await dialogflow.sendToDialogFlow(
    msgUsuario,
    userID,
    "Angular"
  );

  /* Enviamos respuesta en el formato elegido para el proyecto*/

  let mensajeRecibido = {
    userId: userID,
    
    boot: {
      estado: true,
        texto: respuesta[0].queryResult.fulfillmentText,
        voz: respuesta[0].outputAudio,
        configAudio: respuesta[0].outputAudioConfig,
        fecha: new Date(),
        mostrarImagen:false,
        imagen: '',
        MasPreguntas: false
    },
    user: {
      estado: false,
      texto: '',
      fecha: '',
    },
  }

  res.json(mensajeRecibido)




}
