var express = require('express');
var router = express.Router();

const controller = require('../controllers/cercles.controller');

//GET /cercles (verified)
router.get('/', controller.getCerclesAll);

module.exports = router;
