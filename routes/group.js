'use strict'

const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const groupController = require('../controllers/group') ;

const router = express.Router();

router.post("/group/new",authController.requireSingin,groupController.newGroup);
router.get("/group",authController.requireSingin,groupController.allGroups);
router.get("/groups/:userId",authController.requireSingin,groupController.groupsByUser);
router.get("/groups/student/:userId",authController.requireSingin,groupController.groupsByStudent);
router.get("/group/photo/:groupId",groupController.groupPhoto);
router.get("/group/:groupId",authController.requireSingin,groupController.singleGroup);
router.put("/group/newUser",authController.requireSingin,groupController.addUser);
router.delete("/group/removeUser/:userId",[authController.requireSingin,userController.hasAuthorization],groupController.deleteUser);

router.param("userId", userController.userById);
router.param("groupId",groupController.groupById);

module.exports = router;