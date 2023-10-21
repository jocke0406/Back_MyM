var express = require('express');
var router = express.Router();
const authenticateJWT = require('./authenticateJWT.js');
const controller = require('../controllers/cercles.controller');

//GET /cercles (verified)
router.get('/', authenticateJWT, controller.getCerclesAll);

//GET /cercles/:id (verified)
router.get('/:id', authenticateJWT, controller.getCerclesOne);

//GET /cercles/:id/members (verified)
router.get('/:id/members', authenticateJWT, controller.getCerclesMembers);

//GET /cercles/:id/location (verified)
router.get('/:id/location', authenticateJWT, controller.getCercleLocation);

//GET /cercles/:id/events (verified)
router.get('/:id/events', authenticateJWT, controller.getCercleEvents);

//POST / cercles (verified)
router.post('/', authenticateJWT, controller.createCercle);

//PATCH /cercles/:id (verified)
router.patch('/:id', authenticateJWT, controller.updateCercle);

//DELETE /cercles/:id (verified)
router.delete('/:id', authenticateJWT, controller.deleteCercle);

module.exports = router;
