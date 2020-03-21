'use strict'

const express = require('express');
const app = express();
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const fs = require('fs');
const SocketIO = require('socket.io');

dotenv.config();

const port = process.env.PORT || 4000;
const server = app.listen(port, () =>{
    console.log('Api node js is listening on port:'+ port);
    
});


mongoose.connect('mongodb://142.93.9.136/dbplataforma',{ useNewUrlParser: true,useUnifiedTopology: true})
    .then(() =>{
        console.log("la conexion a mongodb se ha realizado correctamente"); 
        });
  
       mongoose.connection.on('error' , err => {
        console.log('DB connection error: ${err.message}');
       }); 


//configuracion de las rutas
const authRoutes = require('./routes/auth');


//API docs
app.get('/', (req, res) =>{
    fs.readFile('docs/apiDocs.json', (err, data) => {
        if(err){
            return res.status(400).json({
                error: err
            });
        }
        const docs = JSON.parse(data);
        return res.json(docs);
    });
});
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

//cargar rutas
app.use("/", authRoutes);



app.use(function(err,req,res,next){
    if(err.name === 'UnauthorizedError'){
        res.status(401).json({
            message: 'Sin autorizacion'
        });
    }
});









