'use strict'

const User = require('../models/user');
const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');

var controller = {

    userById: (req, res, next, id) =>{
        User.findById(id)
        .populate('following', '_id name about email created')
        .populate('followers', '_id name about email created')
        .exec((err, user) =>{
            if(err || !user){
                return res.status(400).json({
                    error: 'User not found'
                });
            }

            req.profile = user; //Agrega una propiedad llamada profile con la informacion del usuario
            next();
        });
    },
    hasAuthorization: (req, res, next) =>{
        const authorized = req.profile && req.auth && req.profile._id === req.auth._id;

        if(!authorized){
            return res.status(403).json({
                error: "User isnt authorized for this action"
            });
        }
    },
    allUsers: (req, res) =>{
        User.find((err, users) =>{
            if(err){
                return res.status(400).json({
                    error: err
                });
            }
            res.json(users)
        }).select("name email updated created");
    },
    getUser: (req, res) =>{
        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;

        return res.json(req.profile);
    },
    updateUser : (req, res, next) =>{
        let form = new formidable.IncomingForm();
        form.keepExtensions= true;
        form.parse(req, (err, fields, files) =>{
            if(err){
                return res.status(400).json({
                    error: "La foto no pudo ser guardada"
                });
            }
            //save user with foto

            let user = req.profile;
            user = _.extend(user, fields);
            user.updated = Date.now();


            if(files.photo){
                user.photo.data = fs.readFileSync(files.photo.path);
                user.photo.contentType = files.photo.type;
            }

            user.save((err, result) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    });
                }
                user.hashed_password = undefined;
                user.salt = undefined;
                res.json(user);
            });
        });

        /*
        let user = req.profile;

        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.save((err) =>{
            if(err){
                console.log(err);
                
                return res.status(400).json({
                    error: "No estas autorizado para realizar esta accion"
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;

            res.json({
                user
            });
        });
        */
    },
    deleteUser : (req, res, next) =>{
        let user = req.profile;
        user.remove((err, user) => {
            if(err){
                return res.status(400).json({
                    error: err
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;

            res.json({
                message: "user delete successfuly"
            });

        });
    },
    userPhoto : (req, res, next) =>{
        if(req.profile.photo.data){
            res.set("Content-Type", req.profile.photo.contentType);
            return res.send(req.profile.photo.data);
        }
         next();

    },
    userName : (req,res, next) =>{
        //res.set("Content-Type", "text/plain");
        return res.json(req.profile);
    },
    hasAuthorization : (req, res, next) => {
        let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
        let adminUser = req.profile && req.auth && req.auth.role === "admin";
     
        const authorized = sameUser || adminUser;
     
        // console.log("req.profile ", req.profile, " req.auth ", req.auth);
        console.log("SAMEUSER", sameUser, "ADMINUSER", adminUser);
     
        if (!authorized) {
            return res.status(403).json({
                error: "User is not authorized to perform this action"
            });
        }
        next();
    },
    addFollowing : (req, res, next) =>{
        User.findByIdAndUpdate(req.body.userId, {$push: {following: req.body.followId}}, (err,result) => {
            console.log(req.body.userId,  req.body.followId);
            if(err){
                return res.status(400).json({
                    error: err
                });
            }
            next();
        });
    },
    addFollower : (req, res) =>{
        User.findByIdAndUpdate(req.body.followId, {$push: {followers: req.body.userId}},
            {new: true}
            
            
            ).populate('following', '_id name')
            .populate('followers', '_id name')
            .exec((err, result) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    });
                }
                 result.hashed_password = undefined;
                 result.salt = undefined;
                 res.json(result);
            })
    },
    removeFollowing : (req, res, next) =>{
        User.findByIdAndUpdate(req.body.userId, {$pull: {following: req.body.unfollowId}}, (err,result) => {
            if(err){
                return res.status(400).json({
                    error: err
                });
            }
            next();
        });
    },
    removeFollower : (req, res) =>{
        User.findByIdAndUpdate(req.body.unfollowId, {$pull: {followers: req.body.userId}},
            {new: true}
            
            
            ).populate('following', '_id name')
            .populate('followers', '_id name')
            .exec((err, result) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    });
                }
                 result.hashed_password = undefined;
                 result.salt = undefined;
                 res.json(result);
            })
    },
    findPeople : (req, res) =>{
        let following = req.profile.following;
        following.push(req.profile._id);
        User.find({_id:{$nin: following}}, (err, users)=>{
            if(err){
                return res.status(400).json({
                    error: err
                });

            }
            res.json(users);
        }).select('name');
    }
}

module.exports =controller;