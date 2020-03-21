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
    created:{
        type: Date,
        default: Date.now
    },
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