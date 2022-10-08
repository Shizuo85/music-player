const express = require('express');
const router = express.Router();

const {
	createPlaylist,
	getPlaylist,
    populatePlaylist,
	deletePlaylist,
	changeName,
    addToPlaylist,
    removeFromPlaylist
} = require('../controllers/playlist');

const { protect } = require('../controllers/users');

router.route('/createPlaylist').post(protect, createPlaylist);
router.route('/getPlaylist').get(protect, getPlaylist);
router.route('/populatePlaylist/:id').get(protect, populatePlaylist);
router.route('/deletePlaylist/:id').delete(protect, deletePlaylist);
router.route('/changeName/:id').patch(protect, changeName);
router.route('/addToPlaylist/:id').post(protect, addToPlaylist);
router.route('/removeFromPlaylist/:id').post(protect, removeFromPlaylist);

module.exports = router;