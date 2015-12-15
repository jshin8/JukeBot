// require mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define post schema
var JukebotSchema = new Schema({
	  spotifyID: String,
	  spotifyPlaylistID: String,
	  spotifyPlaylistName: String,
	  tracks: [{type: Schema.Types.ObjectId, ref: 'Track'}]
});

// create and export Log model
var Jukebot = mongoose.model('Jukebot', JukebotSchema);
module.exports = Jukebot;