const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const evaluationSchema = new mongoose.Schema({

        user:{
            type:ObjectId,
            ref:"User"
        },
        publication:{
            type:ObjectId,
            ref:"Publication"
        },
        items:[{
            title:String,
            created:{type: Date, default: Date.now}
        }],
        calification:String,
        comment:{
            type:String
        }

});

module.exports = mongoose.model('Evaluation',evaluationSchema);