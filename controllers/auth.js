'use strict'

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
var expressJwt = require('express-jwt');
//const { sendEmail } = require("../helpers");
// load env
const dotenv = require("dotenv");
dotenv.config();


var controller = {

    singup: async (req, res) => {
        const userExists = await User.findOne({
            email: req.body.email
        });
        if (userExists) {
            return res.status(403).send({
                error: "El email ya existe"
            });
        }

        const user = await new User(req.body);
        await user.save();
       return res.status(200).json({
            message: "Registro exitoso!!! Por favor acceda"
        })
    },

    singin: (req, res) => {
        //find the user based in the email
        const {
            email,
            password
        } = req.body;
        User.findOne({
            email
        }, (err, user) => {

            if (err || !user) {
                return res.status(401).json({
                    error: "El usuario con ese email no existe"
                });
            }
            //Si el usuario existe, comprobar email y contraseña
            if (!user.authenticate(password)) {
                return res.status(401).json({
                    error: "La contraseña no coincide"
                });
            }

            //generate token with user id and secret
            const token = jwt.sign({_id: user.id}, process.env.JWT_SECRET);
            //persist the token with expiry date
            res.cookie("t",token,{expire: new Date() + 9999});
            //return response with user an token 
            const {_id, name, email,role} = user;
            return res.json({token,
                user: {_id, name, email, role}
            });
        });

    },

    singout: (req, res) => {
        res.clearCookie("t");
        return res.json({
            message: "Singout success"
        });
    },
    forgotPassword : (req, res) => {
        if (!req.body) return res.status(400).json({ message: "No request body" });
        if (!req.body.email)
            return res.status(400).json({ message: "No Email in request body" });
     
        console.log("forgot password finding user with that email");
        const { email } = req.body;
        console.log("signin req.body", email);
        // find the user based on email
        User.findOne({ email }, (err, user) => {
            // if err or no user
            if (err || !user)
                return res.status("401").json({
                    error: "User with that email does not exist!"
                });
     
            // generate a token with user id and secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );
     
            // email data
            const emailData = {
                from: "galvan7725@gmail.com",
                to: email,
                subject: "Password Reset Instructions",
                text: `Please use the following link to reset your password: ${
                    process.env.CLIENT_URL
                }/reset-password/${token}`,
                html: `<p>Please use the following link to reset your password:</p> <p>${
                    process.env.CLIENT_URL
                }/reset-password/${token}</p>`
            };
     
            return user.updateOne({ resetPasswordLink: token }, (err, success) => {
                if (err) {
                    return res.json({ message: err });
                } else {
                    sendEmail(emailData);
                    return res.status(200).json({
                        message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                    });
                }
            });
        });
    },
    socialLogin : (req, res) => {
        // try signup by finding user with req.email
        let user = User.findOne({ email: req.body.email }, (err, user) => {
            if (err || !user) {
                // create a new user and login
                user = new User(req.body);
                req.profile = user;
                user.save();
                // generate a token with user id and secret
                const token = jwt.sign(
                    { _id: user._id, iss: "NODEAPI" },
                    process.env.JWT_SECRET
                );
                res.cookie("t", token, { expire: new Date() + 9999 });
                // return response with user and token to frontend client
                const { _id, name, email } = user;
                return res.json({ token, user: { _id, name, email } });
            } else {
                // update existing user with new social info and login
                req.profile = user;
                user = _.extend(user, req.body);
                user.updated = Date.now();
                user.save();
                // generate a token with user id and secret
                const token = jwt.sign(
                    { _id: user._id, iss: "NODEAPI" },
                    process.env.JWT_SECRET
                );
                res.cookie("t", token, { expire: new Date() + 9999 });
                // return response with user and token to frontend client
                const { _id, name, email } = user;
                return res.json({ token, user: { _id, name, email } });
            }
        });
    },
    resetPassword : (req, res) => {
        const { resetPasswordLink, newPassword } = req.body;
        console.log(req.body);
     
        User.findOne({ resetPasswordLink }, (err, user) => {
            // if err or no user
            if (err || !user)
                return res.status("401").json({
                    error: "Invalid Link!"
                });
     
            const updatedFields = {
                password: newPassword,
                resetPasswordLink: ""
            };
     
            user = _.extend(user, updatedFields);
            user.updated = Date.now();
     
            user.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    });
                }
                res.json({
                    message: `Great! Now you can login with your new password.`
                });
            });
        });
    },
    
    requireSingin: expressJwt({
        secret: process.env.JWT_SECRET,
        userProperty: "auth"
    })

};

module.exports = controller;