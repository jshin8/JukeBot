// require mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define post schema
var JukebotSchema = new Schema({
	  name: String,
	  spotifyID: String,
	  spotifyPlaylistID: String,
	  spotifyPlaylistName: String
});

// create and export Log model
var Jukebot = mongoose.model('Jukebot', JukebotSchema);
module.exports = Jukebot;