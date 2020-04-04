'use strict'

const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const groupController = require('../controllers/group') ;

const router = express.Router();

router.post("/group/new",authController.requireSingin,groupController.newGroup);
router.get("/group",authController.requireSingin,groupController.allGroups);


router.param("userId", userController.userById);

module.exports = router;