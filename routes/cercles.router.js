var express = require('express');
var router = express.Router();

const controller = require('../controllers/cercles.controller');

//GET /cercles (verified)
router.get('/', controller.getCerclesAll);

//GET /cercles/:id (verified)
router.get('/:id', controller.getCerclesOne);

//GET /cercles/:id/members (verified)
router.get('/:id/members', controller.getCerclesMembers);

//GET /cercles/:id/location (verified)
router.get('/:id/location', controller.getCercleLocation);

//GET /cercles/:id/events (verified)
router.get('/:id/events', controller.getCercleEvents);

//POST / cercles (verified)
router.post('/', controller.createCercle);

//PATCH /cercles/:id (verified)
router.patch('/:id', controller.updateCercle);

//DELETE /cercles/:id (verified)
router.delete('/:id', controller.deleteCercle);

module.exports = router;
