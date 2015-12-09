var mongoose = require("mongoose");
mongoose.connect(	process.env.MONGOLAB_URI ||
					process.env.MONGOHQ_URI ||
					"mongodb://localhost/Project3");

// After creating a new model, require and export it:
// module.exports.Tweet = require("./tweet.js");
