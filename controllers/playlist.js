const Library = require('../models/libaries');
const User = require('../models/users');
const Playlist = require('../models/playlist');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createPlaylist = catchAsync(async (req, res, next) => {
    if(req.body.name==undefined || typeof req.body.name!="string" || req.body.name.length<2){
		return next(new AppError('name field invalid', 404))
	}
	const newName = await Playlist.findOne({createdBy: req.user._id, name: req.body.name})
	if (newName){
		return next(new AppError("Playlist already exists", 404))
	}
	const playlist = await playlist.create({ name: req.body.name, createdBy: req.user._id })
	res.status(200).json({ message: 'uploaded', upload });
});

const getPlaylist = catchAsync(async (req, res, next)=> {
	const playlist = await Playlist.find({createdBy:req.user._id})
	if(!playlist){
        return next(new AppError("You do not have any playlist", 404))
    }
	res.status(200).json({message: "success", playlist})
})

const populatePlaylist = catchAsync(async (req, res, next)=> {
	const playlist = await Playlist.find({createdBy:req.user._id, _id: req.params._id}).populate({
        path: "musicID",
        select: "-__v"
    })
	if(!playlist){
        return next(new AppError(`You do not have any playlist with id: ${req.params.id}`, 404))
    }
    if(playlist.musicID.length==0){
        return next(new AppError("You do not have any song in this playlist", 404))
    }
	res.status(200).json({message: "success", music: playlist.musicID})
})

const deletePlaylist = catchAsync( async (req, res, next)=> {
	const deletePlaylist = await Playlist.findOneAndDelete({_id : req.params.id, createdBy: req.user._id})
    if(!deletePlaylist){
        return next(new AppError(`No playlist with id : ${req.params.id}`, 404))
    }
    res.status(200).json({message: "success"})
})

const changeName = catchAsync( async (req, res, next)=> {
	const playlist = await Playlist.findOne({_id : req.params.id, createdBy: req.user._id})
    if (!playlist){
        return next(new AppError(`no playlist with id : ${req.params.id}`, 404))
    }
	if(req.body.name==undefined || typeof req.body.name!="string" || req.body.name.length<2){
		return next(new AppError('name field ivalid', 404))
	}
	const newName = await Playlist.findOne({createdBy: req.user._id, name: req.body.name})
	if (newName){
		return next(new AppError("Name already exists", 404))
	}

	playlist.name = req.body.name
	playlist.save({validateBeforeSave: false})
    res.status(200).json(playlist)
})

module.exports = {
	createPlaylist,
	getPlaylist,
    populatePlaylist,
	deletePlaylist,
	changeName
};
