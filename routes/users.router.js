var express = require('express');
var router = express.Router();

const controller = require('../controllers/users.controller');

//GET / users(verified);
router.get('/', controller.getUsersAll);

//GET /users/:id (verified)
router.get('/:id', controller.getUsersOne);

//GET/users/:id/full (verified)
router.get('/:id/full', controller.getUserFull);

//GET /users/:id/friends (verified)
router.get('/:id/friends', controller.getUserFriends);

//GET /users/:id/events (verified)
router.get('/:id/events', controller.getUserEvents);

//POST /users (verified)
router.post('/', controller.createUser);

//PATCH /usesrs/:id (verified)
router.patch('/:id', controller.updateUser);

//DELETE /users/:id (verified)
router.delete('/:id', controller.deleteUser);

//add /friend (verified)
router.patch('/:id/addFriend', controller.userAddFriend);

// remove /friend (verified)
router.patch('/:id/removeFriend', controller.userRemoveFriend);

module.exports = router;
