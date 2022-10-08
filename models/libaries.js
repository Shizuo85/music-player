const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema(
	{
		name:{
			type: String,
		},
		link: String,
		createdBy: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			select: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Library', librarySchema);
