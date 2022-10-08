const express = require('express');
const router = express.Router();

const {
	signup,
	login,
	forgotPassword,
	resetPassword,
	updatePassword,
	protect,
	logout,
	updateMe
} = require('../controllers/users');


router.route('/login').post(login);
router.route('/signup').post(signup);
router.route('/forgotPassword').post(forgotPassword);
router.route('/updatePassword').post(protect, updatePassword);
router.route('/updateMe').patch(protect, updateMe);
router.route('/resetPassword/:token').post(resetPassword);
router.route('/logout').get(protect, logout);

module.exports = router;
