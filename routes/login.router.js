var express = require('express');
var router = express.Router();
const controller = require('../controllers/login.controller');

router.get('/', controller.login);
module.exports = router;
