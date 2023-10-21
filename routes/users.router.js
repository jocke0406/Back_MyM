var express = require('express');
var router = express.Router();
const authenticateJWT = require('./authenticateJWT.js');

const controller = require('../controllers/users.controller');

//GET / users(verified);
router.get('/', authenticateJWT, controller.getUsersAll);

//GET /users/:id (verified)
router.get('/:id', authenticateJWT, controller.getUsersOne);

//GET/users/:id/full (verified)
router.get('/:id/full', authenticateJWT, controller.getUserFull);

//GET /users/:id/friends (verified)
router.get('/:id/friends', authenticateJWT, controller.getUserFriends);

//GET /users/:id/events (verified)
router.get('/:id/events', authenticateJWT, controller.getUserEvents);

//POST /users (verified)
router.post('/', controller.createUser);

//PATCH /usesrs/:id (verified)
router.patch('/:id', authenticateJWT, controller.updateUser);

//DELETE /users/:id (verified)
router.delete('/:id', authenticateJWT, controller.deleteUser);

//add /friend (verified)
router.patch('/:id/addFriend', authenticateJWT, controller.userAddFriend);

// remove /friend (verified)
router.patch('/:id/removeFriend', authenticateJWT, controller.userRemoveFriend);

module.exports = router;
