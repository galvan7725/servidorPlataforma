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
        .populate("items", "title created")
        .populate("comments", "text created")
        .populate('comments.postedBy', '_id name')
        .select("_id title description created mode expiration status comments")
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
    }


}

module.exports = controller;