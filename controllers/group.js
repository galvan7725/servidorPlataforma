const Group = require("../models/group");
const User = require("../models/user");
const Publication = require("../models/publication");
const dotenv = require("dotenv");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

dotenv.config();

const controller = {
  groupById: (req, res, next, id) => {
    Group.findById(id)
      //.populate('publications', '_id')
      .populate("users", "_id name noControl email")
      .populate("publications","_id title description created mode status comments expiration")
      .populate("teacher", "_id name")
      .select("_id name created photo description career")
      .exec((err, group) => {
        if (err || !group) {
          return res.status(400).json({
            error: "Group not found",
          });
        }

        req.group = group; //Agrega una propiedad llamada profile con la informacion del usuario
        next();
      });
  },

  newGroup: async (req, res) => {
    //console.log(req);

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "La foto no pudo ser guardada",
        });
      }
      console.log("fields:", fields);
      console.log("files:", files);
      //save user with foto

      let group = new Group();
      group = _.extend(group, fields);
      //group.updated = Date.now();
      group.career = fields.carrer;
      // console.log("group:",group);

      if (files.photo) {
        group.photo.data = fs.readFileSync(files.photo.path);
        group.photo.contentType = files.photo.type;
      }

      group.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: err,
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

  editGroup : async(req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "La foto no pudo ser guardada",
        });
      }
      console.log("fields:", fields);
      console.log("files:", files);
      //save user with foto

      let group = new Group();
      group = _.extend(group, fields);
      group.updated = Date.now();
      group.career = fields.carrer;
      group._id = undefined;
      console.log("group:",group);

      if (files.photo) {
        group.photo.data = fs.readFileSync(files.photo.path);
        group.photo.contentType = files.photo.type;
        Group.findByIdAndUpdate(req.group._id, {name:group.name,description:group.description,photo:group.photo,career:group.carrer},(err,result)=>{
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }else{
          res.json(result);
          }
        });

      }else{
        Group.findByIdAndUpdate(req.group._id, {name:group.name,description:group.description,career:group.carrer},(err,result)=>{
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }else{
          res.json(result);
          }
        });

      }
      
  
    });
      
     /*
      group.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }else{
        res.json(result);
        }
      });
      */
    

  },

  allGroups: (req, res) => {
    Group.find()
      .populate("teacher", "_id name")
      .select("_id name created description career")
      .exec((err, result) => {
        if (err) {
          res.status(404).json({
            error: err,
          });
        } else {
          res.status(200).json({
            result,
          });
        }
      });
  },
  groupsByUser: (req, res) => {
    const user = req.profile;
    Group.find({ teacher: user._id })
      .populate("teacher", "_id name")
      .select("_id name created description career")
      .exec((err, result) => {
        if (err) {
          res.status(404).json({
            error: err,
          });
        } else {
          res.status(200).json({
            result,
          });
        }
      });
  },
  groupsByStudent: (req, res) => {
    const user = req.profile;
    Group.find({ users: user._id })
      .populate("teacher", "_id name")
      .select("_id name created description career")
      .exec((err, result) => {
        if (err) {
          res.status(404).json({
            error: err,
          });
        } else {
          res.status(200).json({
            result,
          });
        }
      });
  },
  groupPhoto: (req, res, next) => {
    if (req.group.photo.data) {
      res.set("Content-Type", req.group.photo.contentType);
      return res.send(req.group.photo.data);
    }
    next();
  },
  singleGroup: (req, res) => {
    req.group.photo = undefined;
    return res.json(req.group);
  },
  addUser: (req, res) => {
    Group.find({ users: req.body.userId }).exec((error, response) => {
      if (error || !response) {
        console.log("Error:", error);
      } else {
        console.log("Response", response);
        if (response.length === 0) {
          //el usuario no esta agregado en el grupo
          console.log("El usuario no existe en el grupo");
          Group.findByIdAndUpdate(
            req.body.groupId,
            { $push: { users: req.body.userId } },
            { new: true }
          )
            .populate("users", "_id name email noControl")
            .populate("teacher", "_id name")
            .populate("publications","_id title description created mode status comments expiration")
            .select("_id name created description career")
            .exec((err, rss2) => {
              let auxr2 = rss2;
              if (err || !rss2) {
                console.log(err);
                return res.status(400).json({ error: err });
              } else {
                User.findByIdAndUpdate(req.body.userId,{$push :{followingGroup:req.body.groupId}})
                .exec((error2, response2)=>{
                  if(error2 || !response2){
                    console.log(error2);
                    return res.status(400).json({ error: error2 });
                  }else{
                    console.log("aux",auxr2);
                    return res.status(200).json({ result:rss2 });
                  }
                })

              }
            });
        } else {
          //el usuario ya existe en el grupo
          console.log("El usuario ya existe en el grupo");
          return res.status(400).json({
            error: "El usuario ya existe en el grupo",
          });
        }
      }
    });
  },
  deleteUser: (req, res) => {
    Group.findByIdAndUpdate(
      req.body.groupId,
      { $pull: { users: req.body.userId } },
      { new: true }
    )
      .populate("users", "_id name email noControl")
      .populate("teacher", "_id name")
      .populate("publications","_id title description created mode status comments expiration")
      .select("_id name created  description career")
      .exec((err, rss1) => {
        let auxr = rss1;
        if (err || !rss1) {
          console.log(err);
          return res.status(400).json({ error: err });
        } else {
          
          User.findByIdAndUpdate(req.body.userId,{$pull :{followingGroup:req.body.groupId}})
          .exec((error2, response2)=>{
            if(error2 || !response2){
              console.log(error2)
              return res.status(400).json({ error: error2 });
            }else{
              return res.status(200).json({ result: rss1 });
            }
          })
          //return res.status(200).json(result);
        }
      });
  },
  newPublication: (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "La foto no pudo ser guardada",
        });
      }
      console.log("fields:", fields);
      console.log("files:", files);
      

      
      //save user with foto
      /*
      return res.status(200).json({ 
        message:"success"
      });
      */
      let publication = new Publication();
      publication = _.extend(publication,fields);
      if(fields.countFiles > 0){
        let aux = [];
        let auxField = {};
        let auxWord = "";
        for(const file in files){
          console.log(`file.${file} = ${files[file].name}`);
          auxField = {
            title: files[file].name,
            file:{
              data : fs.readFileSync(files[file].path),
              contentType: files[file].type
            }
          }
          aux.push(auxField);
        }

        publication.items = aux;

      }
      publication.mode = fields.type;
      publication.title = fields.title;
      publication.description = fields.descriptionN;
      publication.group = req.group._id;
      console.log("ItemLinks:",fields.itemLinks.split(","));

      let auxLinks = [];
      const it = fields.itemLinks.split(",");
      for (let index = 0; index < it.length; index++) {
        auxLinks.push({url:it[index]});
        
      }

      publication.itemLinks = auxLinks;
      if(fields.type == "activity"){
        publication.expiration = fields.expiration;
      }
      publication.save((err, result)=>{
        if(err || !result){
          return res.status(400).json({
            error: err,
          });
        }else{
          console.log("Result1: ",result);
          //La publicacion se realizo de manera correcta.
          //procedemos a agregar la  publication a su respectivo grupo de trabajo
          console.log("ResultID: ",result._id);
          Group.findByIdAndUpdate(
            req.group._id,
            { $push: { publications: result._id } },
            { new: true }
          ).populate("users", "_id name email noControl")
          .populate("publications","_id title description items")
          .populate("teacher", "_id name")
          .select("_id name created photo description career")
          .exec((err, result) => {
            if (err || !result) {
              return res.status(400).json({ error: err });
            } else {
              console.log("Result", result);
              return res.status(200).json(result);
            }
          });
        }
      })

    });
  },
};

module.exports = controller;
