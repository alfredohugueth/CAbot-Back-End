const mongoose = require('mongoose');
require('dotenv').config({path:'dbinfo.env'});
const conectarDB = async () =>{
    try{
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useFindAndModify:false
        });
        console.log('Base de datos conectada correctamente');

    }catch(error){
        console.log(error);
        process.exit(1); // detenemos la api
    }
}

module.exports = conectarDB;