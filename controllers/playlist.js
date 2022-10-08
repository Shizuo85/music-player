const Library = require('../models/libaries');
const User = require('../models/users');
const Playlist = require('../models/playlist');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const isEqual = require('lodash.isequal');

const createPlaylist = catchAsync(async (req, res, next) => {
    if(req.body.name==undefined || typeof req.body.name!="string" || req.body.name.length<2){
		return next(new AppError('name field invalid', 404))
	}
	const newName = await Playlist.findOne({createdBy: req.user._id, name: req.body.name})
	if (newName){
		return next(new AppError("Playlist already exists", 404))
	}
	const playlist = await Playlist.create({ name: req.body.name, createdBy: req.user._id })
	res.status(200).json({ message: 'created', playlist });
});

const getPlaylist = catchAsync(async (req, res, next)=> {
	const playlist = await Playlist.find({createdBy:req.user._id})
	if(!playlist){
        return next(new AppError("You do not have any playlist", 404))
    }
	res.status(200).json({message: "success", playlist})
})

const populatePlaylist = catchAsync(async (req, res, next)=> {
	const playlist = await Playlist.findOne({createdBy:req.user._id, _id: req.params.id}).populate({
        path: "musicID",
        select: "-__v -createdAt -updatedAt -_id"
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

const addToPlaylist = catchAsync( async (req, res, next)=> {
    const playlist = await Playlist.findOne({_id : req.params.id, createdBy: req.user._id})
    if (!playlist){
        return next(new AppError(`no playlist with id : ${req.params.id}`, 404))
    }
    const song = await Library.findOne({_id : req.body.musicID, createdBy: req.user._id})
    if (!song){
        return next(new AppError(`no song with id : ${req.body.musicID}`, 404))
    }
    musicIndex = playlist.musicID.findIndex(el => isEqual(el, song._id))
    if (musicIndex!=-1){
        return next(new AppError('Song already added to this playlist', 404))
    }
    playlist.musicID.push(song._id)
    await playlist.save({validateBeforeSave:false})
    res.status(200).json({message:"song added successfully"})
})

const removeFromPlaylist = catchAsync( async (req, res, next)=> {
    const playlist = await Playlist.findOne({_id : req.params.id, createdBy: req.user._id})
    if (!playlist){
        return next(new AppError(`no playlist with id : ${req.params.id}`, 404))
    }
    const song = await Library.findOne({_id : req.body.musicID, createdBy: req.user._id})
    if (!song){
        return next(new AppError(`no song with id : ${req.body.musicID}`, 404))
    }
    musicIndex = playlist.musicID.findIndex(el => isEqual(el, song._id))
    if (musicIndex==-1){
        return next(new AppError(`No song with id: ${song._id} in this playlist`, 404))
    }
    playlist.musicID.splice(musicIndex,1)
    await playlist.save({validateBeforeSave:false})
    res.status(200).json({message:"song removed successfully"})
})

module.exports = {
	createPlaylist,
	getPlaylist,
    populatePlaylist,
	deletePlaylist,
	changeName,
    addToPlaylist,
    removeFromPlaylist,
};
