const Group = require("../models/group");
const Publication = require("../models/publication");
const dotenv = require("dotenv");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

dotenv.config();

const controller = {
    publicationById : (req, res, next, id)=>{
        Publication.findById(id)
        .populate("group", "_id name teacher users")
        .populate("group.teacher","_id name")
        .select("_id title description created mode expiration status items._id items.file.contentType items.title group.users._id itemLinks comments")
        .exec((err, publication) => {
            if (err || !publication) {
              return res.status(400).json({
                error: "Publication not found",
              });
            }
    
            req.publication = publication; //Agrega una propiedad llamada publication con la informacion de la publicacion
            next();
          });

    },
    singlePublication : (req, res)=>{
    return res.json(req.publication);
    },

    publicationFile : (req, res,next,id)=>{
      console.log("publicationFile");
      Publication.findById(req.publication._id).select("items")
      .exec((err,result)=>{
        if(err || !result){
          return res.status(400).json({error:err})
        }else{
          req.fileId = id;
          req.files= result.items;
          next();
           
        }

      })
    },
    publicationSingleFile : (req, res,next)=>{
      //console.log(req.files,req.fileId);
      let aux = {};
      for (let index = 0; index < req.files.length; index++) {
        if(req.files[index]._id == req.fileId){
          aux = req.files[index];
        }
        
      }
      //console.log("Aux:",aux);
      if(aux.file){
        aux.file.data = undefined;
        //res.set("Content-Type", aux.file.contentType);
        return res.send(aux);
      }
      next();
      
    },
    publicationSinglePath:(req, res, next) =>{
      let aux = {};
      for (let index = 0; index < req.files.length; index++) {
        if(req.files[index]._id == req.fileId){
          aux = req.files[index];
        }
        
      }
      //console.log("Aux:",aux);
      if(aux.file.data){
        
        res.set("Content-Type", aux.file.contentType);
        return res.send(aux.file.data);
      }
      next();
      
    },
    publicationFileName : (req, res, next,name)=>{
      if(name){
        req.fileName = name;
        next();
      }else{
        res.status(400).json({
          error:"Faltan parametros"
        })
      }
      
    },
    newComment: (req, res)=>{
      const { publicationId,userId,text } = req.body;
      if(publicationId && userId && text){
        const comment = { text,
        postedBy:userId
      }
          Publication.findByIdAndUpdate(publicationId,{ $push: { comments: comment } },{ new: true })
          .populate('comments.postedBy', '_id name')
          .select("_id comments comments.id comments.text comments.created comments.postedBy")
          .exec((err,result) =>{
            if(err || !result){
              return res.status(400).json({
                error:err
              })
            }else{
              return res.status(200).json(result);
            }
          })
      }else{
        res.status(400).json({
          error:"Informacion incompleta"
        })
      }
    },
    
    getComments : (req, res, next, id) => {
      console.log("getComments",id);
      Publication.findById(id)
      .populate('comments.postedBy', '_id name')
      .select("_id comments comments.id comments.text comments.created comments.postedBy")
      .exec((err,result)=>{
        if(err || !result){
          
          return res.status(400).json({
            error: err
          })
        }else{
          req.comments = result;
          next();
        }
      })
    },
    getCommentsPublication : (req, res)=>{
      return res.status(200).json(req.comments);
    }



}

module.exports = controller;