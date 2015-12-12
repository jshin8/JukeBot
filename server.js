var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose"),
    db = require("./models/index"),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    swig = require('swig'),
    SpotifyWebApi = require('spotify-web-api-node'),
    SpotifyStrategy = require('./lib/index').Strategy;

var consolidate = require('consolidate');
// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : '7c0d997aa1764b11a50b0796b1304cbe',
  clientSecret : 'e0eb14b86b024b8db3eb270df7906d20',
  redirectUri : 'http://localhost:3000/callback'
});



var appKey = '7c0d997aa1764b11a50b0796b1304cbe';
var appSecret = 'e0eb14b86b024b8db3eb270df7906d20';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and spotify
//   profile), and invoke a callback with a user object.
passport.use(new SpotifyStrategy({
  clientID: appKey,
  clientSecret: appSecret,
  callbackURL: 'http://localhost:3000/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
    	spotifyApi.setAccessToken(accessToken);
    	console.log('this is the', accessToken);
      // To keep the example simple, the user's spotify profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the spotify account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }));

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(session({
 saveUninitialized: true,
 resave: true,
 secret: 'SuperSecretCookie',
 cookie: { maxAge: 18000000 }
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

app.engine('html', consolidate.swig);

app.get('/', function(req, res){
  res.render('index.html', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account.html', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login.html', { user: req.user });
});

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['playlist-modify-public', 'user-read-private'], showDialog: true}),
  function(req, res){
// The request will be redirected to spotify for authentication, so this
// function will not be called.
});

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



// API ROUTES


// show all jukebots
// app.get('/api/jukebots', function (req, res) {
//   db.Jukebot.find(function (err, jukebots) {
//     res.send(jukebots);
//   });
// });
 
// create new jukebot
app.post('/api/jukebots', function (req, res) {
  // create new post with form data (`req.body`)
  var newJukebot = req.body;
  console.log(newJukebot);
  
  // save new jukebot
  db.Jukebot.create(newJukebot, function(err, jukebot){
    if (err) { return console.log("create error: " + err); }
    console.log("created ", jukebot.name);
    // res.json(jukebot);
	});

  // Create a private playlist
	spotifyApi.createPlaylist(req.body.spotifyID, req.body.spotifyPlaylistName, { 'public' : true })
	  .then(function(data) {
	    console.log(data.body.id);
	  }, function(err) {
	    console.log('Something went wrong!', err);
	  });
	res.redirect('/'+ req.body.name);  
});

//get jukebot page with unique url(name of jukebot)
app.get('/:name', function(req,res){
	res.render('jukebot.html', { user: req.user });
});




// create new track
app.post('/api/tracks', function (req, res) {
  // create new post with form data (`req.body`)
  var newTrack = req.body;
  console.log(newTrack);
  
  // save new track
  db.Track.create(newTrack, function(err, track){
    if (err) { return console.log("create error: " + err); }
    console.log("created ", track.trackName);
    // console.log("testing", db.jukebot.name);
     res.json(track);
  });

  // Add track to playlist
  // spotifyApi.addTracksToPlaylist('thelinmichael', '5ieJqeLJjjI8iJWaxeBLuK', "spotify:track:4iV5W9uYEdYUVa79Axb7Rh")
  // .then(function(data) {
  //   console.log('Added tracks to playlist!');
  // }, function(err) {
  //   console.log('Something went wrong!', err);
  // });
});

// app.post('/searching', function (req, res) {
//   var newSearch = req.body;



//   spotifyApi.searchTracks(req.body.search)
//     .then(function(data) {
//       var results = data.body.tracks.items[0].name;
//       console.log(results);
//       // res.send('jukebot.html', {data: data.body.tracks.items[0]});
//       // console.log('Search by "Love"', data.body.tracks.items[0]);
//     }, function(err) {
//       console.error(err);
//     });
// });





app.listen(process.env.PORT || 3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
