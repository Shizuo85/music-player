const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/users');
const AppError = require('../utils/appError');

const sendEmail = (options) => {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD,
		},
	});
	let mailOptions = {
		from: process.env.MAIL_USERNAME,
		to: options.email,
		subject: options.subject,
		html: options.message,
	};
	transporter.sendMail(mailOptions);
};

const signToken = (id) =>
	jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

const createSendToken = catchAsync(async (user, statusCode, res) => {
	const token = signToken(user._id);

	user.loggedOut = false;
	await user.save({ validateBeforeSave: false });

	user.password = undefined;
	user.confirmEmailToken = undefined;
	user.loggedOut = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user: user,
		},
	});
});

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) {
			newObj[el] = obj[el];
		}
	});

	return newObj;
};

const signup = catchAsync(async (req, res, next) => {
	const user = await User.create(req.body);
	createSendToken(user, 200, res);
});

const login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError('Please provide email and password', 400));
	}

	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401));
	}

	createSendToken(user, 200, res);
});
const forgotPassword = catchAsync(async (req, res, next) => {
	//1 Get user based on email
	const user = await User.findOne({ email: req.body.email });

	if (!user) return next(new AppError('User does not exist', 401));

	//2 Generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	//3 send to user mail
	const resetURL = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/users/resetPassword/${resetToken}`;

	const message = `Forgot your password? Submit a PATCH request with your new password and
     passwordConfirm to: <a href=${resetURL}>Link</a>.\nIf you didn't forget your password, please ignore this email!`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token(valid for 10mins)',
			message,
		});

		res.status(200).json({
			status: 'success',
			message: 'Token sent to mail',
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(
			new AppError('There was an error sending the email. Try again later', 500)
		);
	}
});
const resetPassword = catchAsync(async (req, res, next) => {
	//1 get user based on token
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});
	//2 set new password if user exists and token has not expired
	if (!user) {
		return next(new AppError('Token is invalid or has expired', 400));
	}
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	await user.save();

	//3 log user in
	res.status(200).json({
		message: 'Password succesfully reset!! Proceed to login',
	});
});


const protect = catchAsync(async (req, res, next) => {
	//1). Getting token and check if its there
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(
			new AppError('You are not logged in! Please log in to get access', 401)
		);
	}

	//2). Verification of token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	//3). Checek if user still exists
	const currentUser = await User.findById(decoded.id).select('+loggedOut');
	if (!currentUser) {
		return next(new AppError('The user no longer exists', 401));
	}
	//4). Check if user is logged in
	if (currentUser.loggedOut) {
		return next(
			new AppError('You are not logged in! Please log in to get access', 401)
		);
	}

	req.user = currentUser;
	next();
});

const logout = catchAsync(async (req, res, next) => {
	const user = await User.findOne({
		email: req.user.email,
	});
	user.loggedOut = true;
	await user.save({ validateBeforeSave: false });

	res.status(200).json({
		status: 'success',
		message: 'You have successfully logged out',
	});
});

const updatePassword = catchAsync(async (req, res, next) => {
	//1 Get user from collection
	const user = await User.findOne({ email: req.user.email }).select(
		'+password'
	);
	//2 Check if posted current password is correct
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError('Your current password is wrong', 401));
	}
	//3 if so, update password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;

	await user.save();

	user.loggedOut = true;
	await user.save({ validateBeforeSave: false });

	res.status(200).json({
		status: 'success',
		message: 'Password changed successfully',
	});
});

const updateMe = catchAsync(async (req, res, next) => {
	//1 create error if user POSTs password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(new AppError('This route isnt for updating password', 400));
	}
	//2 Filter unwanted fields
	const filteredBody = filterObj(req.body, 'fullName', 'email');

	//2 Update user data
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	});
});

module.exports = {
	signup,
	login,
	forgotPassword,
	resetPassword,
	updatePassword,
	protect,
	logout,
	updateMe
};
