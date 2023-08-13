var express = require('express');
var router = express.Router();

const controller = require('../controllers/events.controller');

//GET /events (verified)
router.get('/', controller.getEventsAll);

//GET /events/:id (verified)
router.get('/:id', controller.getEventsOne);

//GET /events/:id with location / organizer / participants (verified)
router.get('/:id/full', controller.getEventFull);

//POST /events (verified)
router.post('/', controller.createEvent);

//PATCH /events/:id (verified)
router.patch('/:id', controller.updateEvent);

//DELETE /events/:id (verified)
router.delete('/:id', controller.deleteEvent);

//PATCH /events/:id/addParticipant (verified)
router.patch('/:id/addParticipant', controller.eventAddParticipant);

//PATCH /events/:id/removeParticipant (verified)
router.patch('/:id/removeParticipant', controller.eventRemoveParticipant);

module.exports = router;
