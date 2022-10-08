const Library = require('../models/libaries');
const User = require('../models/users');
const Playlist = require('../models/playlist');
const AWS = require('aws-sdk');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const s3 = new AWS.S3({
	accessKeyId: process.env.ACCESS_KEY_ID,
	secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const uploadMusic = catchAsync(async (req, res, next) => {
	const song = await Library.findOne({name: req.file.originalname, createdBy: req.user._id})
	if(song) {
		return next(new AppError("This song already exists in your library", 404))
	}
	const bucket = 'music-libary';
	const params = {
		Key: req.file.originalname,
		Bucket: bucket,
		Body: req.file.buffer,
		ContentType: 'audio/mpeg',
		ACL: 'public-read',
	};
	const link = await new Promise((resolve, reject) => {
		s3.upload(params, (err, data) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
	const upload = await Library.create({ name: req.file.originalname, link:link.Location, createdBy: req.user._id })
	res.status(200).json({ message: 'uploaded', upload });
});

const getLibrary = catchAsync(async (req, res, next)=> {
	const library = await Library.find({createdBy:req.user._id})
	if(!library){
        return next(new AppError("You do not have any music in your library", 404))
    }
	res.status(200).json({message: "success", library})
})

const deleteMusic = catchAsync( async (req, res, next)=> {
	const deleteSong = await Library.findOneAndDelete({_id : req.params.id, createdBy: req.user._id})
    if(!deleteSong){
        return next(new AppError(`No song in your Library with id : ${req.params.id}`, 404))
    }
	await Playlist.deleteMany({createdBy: req.user._id, musicID : req.params.id})
    res.status(200).json({message: "success"})
})

const changeName = catchAsync( async (req, res, next)=> {
	const song = await Library.findOne({_id : req.params.id, createdBy: req.user._id})
    if (!song){
        return next(new AppError(`no song with id : ${req.params.id}`, 404))
    }
	if(req.body.name==undefined || typeof req.body.name!="string" || req.body.name.length<2){
		return next(new AppError('name field invalid', 404))
	}
	const newName = await Library.findOne({createdBy: req.user._id, name: req.body.name})
	if (newName){
		return next(new AppError("Name already exists", 404))
	}

	song.name = req.body.name
	song.save({validateBeforeSave: false})
    res.status(200).json(song)
})

module.exports = {
	uploadMusic,
	getLibrary,
	deleteMusic,
	changeName
};
