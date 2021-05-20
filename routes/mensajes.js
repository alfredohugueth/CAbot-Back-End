var express = require('express');
var router = express.Router();
const mensajes = require('../controllers/preguntas');

// Ruta para /botmsg

// Primer mensaje del servidor.
router.post('/',mensajes.mensajeBienvenidaUsuario);

router.post('/usuario',mensajes.PreguntaTextoDeCliente);

router.post('/audio',mensajes.PreguntaVozCliente);


router.get('/preguntas-comunes',mensajes.PreguntasRepetidasConRespuesta);

// router.post('/more_questions',mensajes.QuieroPreguntarMas);


// router.post('/gradebot',mensajes.calificarSi);

// router.post('/califica',mensajes.calificacion);

// router.post('/nocalifica',mensajes.noCalifica);

router.get('/numero-preguntas',mensajes.NumeroPreguntasConFundamentoRealizadas);






module.exports= router;
