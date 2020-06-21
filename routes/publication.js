'use strict'

const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const publicationController = require('../controllers/publication');

const router = express.Router();

router.get("/publication/:publicationId",authController.requireSingin,publicationController.singlePublication);
router.get("/publication/file/:publicationId/:fileId",publicationController.publicationSingleFile);


//middleware
router.param("publicationId",publicationController.publicationById);
router.param("fileId",publicationController.publicationFile);



module.exports = router;