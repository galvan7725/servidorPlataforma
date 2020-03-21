'use strict'

const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
//const validator = require('../validator')

const router = express.Router();


router.put('/user/follow', authController.requireSingin, userController.addFollowing, userController.addFollower);
router.put('/user/unfollow', authController.requireSingin, userController.removeFollowing, userController.removeFollower);


router.get("/users",userController.allUsers);
router.get("/user/:userId",authController.requireSingin,userController.getUser);
router.put("/user/:userId",authController.requireSingin,userController.updateUser);
router.delete("/user/:userId",[authController.requireSingin,userController.hasAuthorization],userController.deleteUser);
//photo
router.get("/user/photo/:userId",userController.userPhoto);
router.get("/user/name/:userId",userController.userName);
//who to follow
router.get('/user/findpeople/:userId',authController.requireSingin,userController.findPeople);

router.param("userId", userController.userById);

module.exports = router;