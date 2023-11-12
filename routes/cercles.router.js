var express = require('express');
var router = express.Router();
const authenticateJWT = require('./authenticateJWT.js');
const authenticateAdminJWT = require('./authenticateJWT.js');
const controller = require('../controllers/cercles.controller');
const csrfProtection = require('csurf')({ cookie: true });
//GET /cercles (verified)
router.get('/', controller.getCerclesAll);

//GET /cercles/:id (verified)s
router.get('/:id', authenticateJWT, controller.getCerclesOne);

//GET /cercles/:id/members (verified)
router.get('/:id/members', authenticateJWT, controller.getCerclesMembers);

//GET /cercles/:id/location (verified)
router.get('/:id/location', authenticateJWT, controller.getCercleLocation);

//GET /cercles/:id/events (verified)
router.get('/:id/events', authenticateJWT, controller.getCercleEvents);

//POST / cercles (verified)
router.post('/', authenticateAdminJWT, controller.createCercle);

//PATCH /cercles/:id (verified)
router.patch('/:id', authenticateAdminJWT, controller.updateCercle);

//DELETE /cercles/:id (verified)
router.delete('/:id', authenticateAdminJWT, controller.deleteCercle);

module.exports = router;
