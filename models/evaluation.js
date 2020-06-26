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
            created:{type: Date, default: Date.now},
            file: {
                data: Buffer,
                contentType: String
            },
        }],
        calification:String,
        comments:{
            type:String
        }

});

module.exports = mongoose.model('Evaluation',evaluationSchema);