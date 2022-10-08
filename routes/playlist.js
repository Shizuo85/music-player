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
router.route('/populatePlaylist').get(protect, populatePlaylist);
router.route('/deletePlaylist').delete(protect, deletePlaylist);
router.route('/changeName').patch(protect, changeName);

module.exports = router;