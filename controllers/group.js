const Group = require("../models/group");
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
            .select("_id name created photo description career")
            .exec((err, result) => {
              if (err) {
                return res.status(400).json({ error: err });
              } else {
                return res.status(200).json({ result });
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
      .select("_id name created photo description career")
      .exec((err, result) => {
        if (err) {
          return res.status(400).json({ error: err });
        } else {
          return res.status(200).json(result);
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
  },
};

module.exports = controller;
