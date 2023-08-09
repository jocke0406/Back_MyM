var express = require('express');
var router = express.Router();

const controller = require('../controllers/events.controller');

//GET /events (verified)
router.get('/', controller.getEventsAll);

module.exports = router;
