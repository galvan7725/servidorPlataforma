const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const publicationSchema = new mongoose.Schema({
    group:{
        type: ObjectId,
        ref: "Group"
    },
    created:{
        type: Date,
        default: Date.now
    },
    items:[{
        title:String,
        created:{type: Date, default: Date.now},

    }],
    mode:{
        type:String,
        required:true
    },
    expiration:{
        type:Date
    },
    evaluatios:[
        {
        type:ObjectId,
        ref:"Evaluation"
        }
    ],
    comments:[
        {
            text: String,
            created:{type: Date, default: Date.now},
            postedBy:{
                type: ObjectId,
                ref: "User"
            }
        }
    ]

});

module.exports = mongoose.model('Publication', publicationSchema);