'use strict'

const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const publicationController = require('../controllers/publication');

const router = express.Router();

router.get("/publication/:publicationId",authController.requireSingin)