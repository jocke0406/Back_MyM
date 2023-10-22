var express = require('express');
var router = express.Router();
const authenticateJWT = require('./authenticateJWT.js');
const authenticateAdminJWT = require('./authenticateJWT.js');
const controller = require('../controllers/events.controller');

//GET /events (verified)
router.get('/', authenticateJWT, controller.getEventsAll);

//GET /events/:id (verified)
router.get('/:id', authenticateJWT, controller.getEventsOne);

//GET /events/:id with location / organizer / participants (verified)
router.get('/:id/full', authenticateJWT, controller.getEventFull);

//POST /events (verified)
router.post('/', authenticateAdminJWT, controller.createEvent);

//PATCH /events/:id (verified)
router.patch('/:id', authenticateAdminJWT, controller.updateEvent);

//DELETE /events/:id (verified)
router.delete('/:id', authenticateAdminJWT, controller.deleteEvent);

//PATCH /events/:id/addParticipant (verified)
router.patch('/:id/addParticipant', authenticateJWT, controller.eventAddParticipant);

//PATCH /events/:id/removeParticipant (verified)
router.patch('/:id/removeParticipant', authenticateJWT, controller.eventRemoveParticipant);

module.exports = router;
