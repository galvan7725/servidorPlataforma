const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const evaluationSchema = new mongoose.Schema({

        user:{
            type:ObjectId,
            ref:"User"
        },
        items:[{
            title:String,
            created:{type: Date, default: Date.now}
        }],
        calificacion:String,
        comment:{
            type:String
        }

});

module.exports = mongoose.model('Evaluation',evaluationSchema);