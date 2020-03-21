'use strict'

const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;


const chatSchema = new mongoose.Schema({
    user1:{
        type: ObjectId,
        ref: "User"
    },
    user2:{
        type: ObjectId,
        ref: "User"
    },
    created:{
        type: Date,
        default: Date.now
    },
    messages:[
        {
            text: String,
            created:{type: Date, default: Date.now},
            from:{
                type: ObjectId,
                ref: "User"
            },
            to:{
                type: ObjectId,
                ref: "User"
            }
        }
    ],

});

module.exports = mongoose.model('Chat', chatSchema);