'use strict'

const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const publicationController = require('../controllers/publication');

const router = express.Router();

router.get("/publication/:publicationId",authController.requireSingin,publicationController.singlePublication);
router.get("/publication/file/:publicationId/:fileId",authController.requireSingin,publicationController.publicationSingleFile);
router.get("/publication/file/path/:publicationId/:fileId/:fileName",publicationController.publicationSinglePath);
router.get("/publication/pubComments/:pubId",authController.requireSingin, publicationController.getCommentsPublication);
router.post("/publication/newComment",authController.requireSingin,publicationController.newComment);

//middleware
router.param("publicationId",publicationController.publicationById);
router.param("fileId",publicationController.publicationFile);
router.param("fileName",publicationController.publicationFileName);
router.param("pubId",publicationController.getComments);



module.exports = router;