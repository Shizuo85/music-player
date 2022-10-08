const express = require('express');
const router = express.Router();

const multer = require('multer');
const {memoryStorage} = require('multer');
const storage = memoryStorage();
const upload = multer({ storage });

const {
	uploadMusic,
	getLibrary,
	deleteMusic,
	changeName
} = require('../controllers/libaries');

const { protect } = require('../controllers/users');

router.route('/uploadMusic').post(protect, upload.single('audiofile'), uploadMusic);
router.route('/getLibrary').get(protect, getLibrary);
router.route('/deleteMusic/:id').delete(protect, deleteMusic);
router.route('/changeName/:id').patch(protect, changeName);

module.exports = router;