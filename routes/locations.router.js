var express = require('express');
var router = express.Router();
const authenticateJWT = require('./authenticateJWT.js');

const controller = require('../controllers/locations.controller');

//GET /locations (verified)
router.get('/', authenticateJWT, controller.getLocationsAll);

//GET /locations/:id (verified)
router.get('/:id', authenticateJWT, controller.getLocationsOne);

//GET /locations/:id full with events (verified)
router.get('/:id/full', authenticateJWT, controller.getLocationFull);

//POST /locations (verified)
router.post('/', authenticateJWT, controller.createLocation);

//PATCH /locations/:id (verified)
router.patch('/:id', authenticateJWT, controller.updateLocation);

//DELETE /locations/:id (verified)
router.delete('/:id', authenticateJWT, controller.deleteLocation);


module.exports = router;
