const Group = require('../models/group');
const dotenv = require("dotenv");
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');


dotenv.config();


const controller = {

newGroup : async(req,res) =>{
    
    //console.log(req);
    
    let form = new formidable.IncomingForm();
    form.keepExtensions= true;
    form.parse(req, (err, fields, files) =>{
        if(err){
            return res.status(400).json({
                error: "La foto no pudo ser guardada"
            });
        }
        console.log("fields:",fields);
        console.log("files:",files);
        //save user with foto
        
        let group = new Group;
        group= _.extend(group, fields);
        //group.updated = Date.now();
        group.career = fields.carrer;
       // console.log("group:",group);

        if(files.photo){
            group.photo.data = fs.readFileSync(files.photo.path);
            group.photo.contentType = files.photo.type;
        }

        group.save((err, result) =>{
            if(err){
                return res.status(400).json({
                    error: err
                });
            }
            res.json(group);
        });
           


    });
    /*
    const group = await new Group(req.body);
    await group.save();
    return res.status(200).json({
        message: "El grupo se ha creado con exito"
    })
    */
},
allGroups : (req,res) =>{
    Group.find()
    .populate('teacher','_id name')
    .select("_id name created description career")
    .exec((err,result)=>{
        if(err){
            res.status(404).json({
                error:err
            })
        }else{
            res.status(200).json({
                result
            })
        }
    });
},
groupsByUser: (req,res) =>{
    const user = req.profile;
    Group.find({"teacher":user._id})
    .populate('teacher','_id name')
    .select("_id name created description career")
    .exec((err,result)=>{
        if(err){
            res.status(404).json({
                error:err
            })
        }else{
            res.status(200).json({
                result
            })
        }
    });
}
}

module.exports = controller;