const express = require('express');
const router = express.Router();

const {
	createPlaylist,
	getPlaylist,
    populatePlaylist,
	deletePlaylist,
	changeName
} = require('../controllers/playlist');

const { protect } = require('../controllers/users');

router.route('/createPlaylist').post(protect, createPlaylist);
router.route('/getPlaylist').get(protect, getPlaylist);
router.route('/populatePlaylist/:id').get(protect, populatePlaylist);
router.route('/deletePlaylist/:id').delete(protect, deletePlaylist);
router.route('/changeName/:id').patch(protect, changeName);

module.exports = router;