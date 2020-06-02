const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const groupSchema = new mongoose.Schema({
    teacher:{
        type: ObjectId,
        ref: "User"
    },
    name:{
        type:String,
        required:true
    },
    photo:{
        data: Buffer,
        contentType: String
    },
    description:{
        type:String
    },
    created:{
        type: Date,
        default: Date.now
    },
    career:{
        type:String
    },
    updated: Date,
    users:[
        {
            type: ObjectId,
            ref: "User"
        }
    ],
    publications:[
        {
            type: ObjectId,
            ref: "Publication"
        }
    ]

});

module.exports = mongoose.model('Group', groupSchema);