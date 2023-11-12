var express = require('express');
var router = express.Router();
const controller = require('../controllers/login.controller');
const authenticateJWT = require('./authenticateJWT.js');

router.post('/', controller.login);
router.post('/changePassword', authenticateJWT, controller.changePassword);
router.post('/forgotPassword', controller.forgotPassword);
router.post('/reinitializePassword', controller.reinitializePassword);


module.exports = router;
