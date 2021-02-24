var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  let Tprueba = "informacion de prueba";
  let textoPrueba = "En esta parte ira la información de la base de datos";
  let jsonRes = {
    "nombre": Tprueba,
    "información": textoPrueba
  };
  res.json(jsonRes);
});

module.exports = router;
