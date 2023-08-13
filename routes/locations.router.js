var express = require('express');
var router = express.Router();

const controller = require('../controllers/locations.controller');

//GET /locations (verified)
router.get('/', controller.getLocationsAll);

//GET /locations/:id (verified)
router.get('/:id', controller.getLocationsOne);

//GET /locations/:id full with events (verified)
router.get('/:id/full', controller.getLocationFull);

//POST /locations (verified)
router.post('/', controller.createLocation);

//PATCH /locations/:id (verified)
router.patch('/:id', controller.updateLocation);

//DELETE /locations/:id (verified)
router.delete('/:id', controller.deleteLocation);

//PATCH locations/:id/events Supprime un événement spécifique d'une location
//router.patch('/:id/events', controller.modifyEventsForLocation);
module.exports = router;
