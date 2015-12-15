// require mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define post schema
var TrackSchema = new Schema({
	  trackName: String,
	  album: String,
	  artist: String,
	  spotifyTrackURI: String,
	  voteCount: Number,
	  sspotifyPlaylistID: String,
	  sspotifyID: String,
});

// create and export Log model
var Track = mongoose.model('Track', TrackSchema);
module.exports = Track;