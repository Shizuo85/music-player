const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
	{
		name:{
			type: String,
		},
        musicID: [{
			type: mongoose.Schema.ObjectId,
			ref: 'Library',
		}],
		createdBy: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			select: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
