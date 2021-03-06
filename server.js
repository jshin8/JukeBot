require('dotenv').load();
var express = require('express'),
    app = express(),
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


// @SOCKETS
// require built-in http module and set up an http server with our app
  // (so we can reuse same server for socket handshake)
var http = require('http');
var httpServer = http.Server(app);
// pull in socket.io module's "Server" constructor
var ioServer = require('socket.io');
// create an io server for us to use, and attach it to our http server
var io = new ioServer(httpServer);

// @SOCKETS
// listen for a connection event
io.on('connection', function(socket){
  console.log('a user was connected');
   // listen for a custom event type - new chat message
    socket.on('new track post', function(trackPost){
      console.log("emit works");
      console.log(trackPost);
      io.emit('track post', trackPost);
 
    });
   
    // socket.on('new vote', function(newVote){
    //   io.emit('vote', newVote);
    //   console.log("IS ANYTHNG WORKING???",newVote);
    // });
});


// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.clientId,
  clientSecret : process.env.clientSecret,
  redirectUri : 'https://jukebot.herokuapp.com/callback'
});



var appKey = process.env.appKey;
var appSecret = process.env.appSecret;

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
  callbackURL: 'https://jukebot.herokuapp.com/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);
      console.log('this is the accessToken and refreshToken', accessToken, refreshToken);
      // To keep the example simple, the user's spotify profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the spotify account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }));



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
  // create new jukebot with form data (`req.body`)
  var newJukebot = req.body;
  // console.log(newJukebot);
  
  // save new jukebot
  db.Jukebot.create(newJukebot, function(err, jukebot){
    if (err) { return console.log("create jukebot error: " + err); }
    console.log("created ", jukebot);
    // res.json(jukebot);
	});

  // Create a public playlist
	spotifyApi.createPlaylist(req.body.spotifyID, req.body.spotifyPlaylistName, { 'public' : true })
	  .then(function(data) {

      db.Jukebot.findOneAndUpdate({spotifyPlaylistName: req.body.spotifyPlaylistName}, {spotifyPlaylistID: data.body.id}, {new:true}, function(err, jukebot){
          if(jukebot===null){
          console.log("something went wrong bro");
          }
          console.log('da', jukebot);
          res.redirect('/' + req.body.spotifyID + '/' + req.body.spotifyPlaylistName); 
      });

    }, function(err) {
      console.log('Something went wrong!', err);
    });
});




//get jukebot page with unique url(name of jukebot)
app.get('/:spotifyID/:spotifyPlaylistName', function(req,res){
  // res.cookie('voteBoolean', 'true', { expires: new Date(Date.now() + 20000000), httpOnly: true });
  console.log(req.cookies, 'cookie look here nowwww');
  db.Jukebot.findOne({spotifyID: req.params.spotifyID, spotifyPlaylistName: req.params.spotifyPlaylistName}, function (err, jukebot) {
    if (jukebot === null){
      console.log('database error: ', err);
      res.redirect('/');

    } else {
      // render profile template with user's data
      console.log(jukebot);
      console.log('loading jukebot');
      // console.log('lookhere', jukebot.tracks[0]);
	   res.render('jukebot.html', { user: req.user, jukebot:jukebot });
     // db.Jukebot.findOne().exec(function(err, tracks){
     //  res.render('jukebot.html', { user: req.user, jukebot:jukebot, tracks:tracks });
     //  });
    }
  }).populate('tracks').exec(function(err, jukebots){});
});




// create new track
app.post('/api/jukebots/:jukebotId/tracks', function (req, res) {
  // create new post with form data (`req.body`)
  var newTrack = req.body;
  newTrack.orderNumber = 0;
  console.log('this is newTrack', newTrack);
  // console.log('this is jukebot._id', req.params.jukebotId);
  
  // Add track to playlist
  spotifyApi.addTracksToPlaylist(req.body.sspotifyID, req.body.sspotifyPlaylistID, req.body.spotifyTrackURI)
  .then(function(data) {
    console.log('Added tracks to playlist!');
    // save new track
    db.Track.create(newTrack, function(err, track){
      if (err) { return console.log("create track error: " + err); }
      console.log("created ", track);
      // console.log("testing", db.jukebot.name);
       db.Jukebot.findOneAndUpdate({_id: req.params.jukebotId}, {$push:{tracks:track._id}}, {safe:true, upsert:true, new:true}, function(err, jukebot){
        if(jukebot===null){
        console.log("something really went wrong bro");
        }
        console.log(jukebot, 'with tracks'); 

        
        track.orderNumber = jukebot.tracks.length;
        track.save(function(err,newnewTrack){
          console.log('1',newnewTrack);
          // console.log('2',err);
        });


         
        res.json(track);
        });
    });
  
  }, function(err) {
    console.log('Something went wrong!', err);
    alert("Host is logged off! Tell him/her to relog/reauthenticate!!!");
  });
});


 //change order of track on playlist
app.post('/api/jukebots/:jukebotId/order', function (req, res){
    var updateOrder = req.body;
    console.log(updateOrder,'lookhere');
  db.Jukebot.findOne({spotifyPlaylistID:req.body.sspotifyPlaylistID}, function (err,jukebot){

    db.Track.findOne({_id:req.body.trackId}, function(err,track){
      var targetTrack = track;
      console.log(req.cookies[track._id],"LOOOOOOOOOOOOOOOK");
      console.log(track._id, 'goooooooooooood');
      if (req.body.ordernumber=='up' && track.orderNumber!==1 && req.cookies[track._id]!=track._id){
        var options = { "range_length" : 1 };
        spotifyApi.reorderTracksInPlaylist(req.body.sspotifyID, req.body.sspotifyPlaylistID, track.orderNumber-1, track.orderNumber-2, options)
          .then(function(data) {
            console.log('Tracks reordered in playlist!');
            db.Track.findOne().and([
              {orderNumber: track.orderNumber-1},{sspotifyPlaylistID:req.body.sspotifyPlaylistID}, {_id: { $ne: req.body.trackId}}
              ]).exec(function (err, results) {
                console.log(results, 'higher track');
                var higherTrack = results;

                  higherTrack.orderNumber = higherTrack.orderNumber+1;
                  console.log(higherTrack);
                  higherTrack.save(function(err,newLowerTrack){
                    if (newLowerTrack!==null){
                      console.log('Higher Track successfully lowered', newLowerTrack);
                      targetTrack.orderNumber = targetTrack.orderNumber-1;
                      targetTrack.save(function(err,newTargetTrack){
                        if (newTargetTrack!==null){
                          res.cookie(newTargetTrack._id, newTargetTrack._id, { expires: new Date(Date.now() + 20000000), httpOnly: true });
                          res.json(track);
                        console.log('Target Track successfully upvoted',newTargetTrack);
                        }
                      });
                    } 
                    else { return console.log("update track order error");
                    }
                  });    
              });
          }, function(err) {
            console.log('Something went wrong!', err);
          });
      }

      if (req.body.ordernumber=='down' && track.orderNumber < jukebot.tracks.length && req.cookies[track._id]!=track._id){
        var options = { "range_length" : 1 };
        spotifyApi.reorderTracksInPlaylist(req.body.sspotifyID, req.body.sspotifyPlaylistID, track.orderNumber-1, track.orderNumber+1, options)
          .then(function(data) {
            console.log('Tracks reordered in playlist!');
            db.Track.findOne().and([
              {orderNumber: track.orderNumber+1},{sspotifyPlaylistID:req.body.sspotifyPlaylistID}, {_id: { $ne: req.body.trackId}}
              ]).exec(function (err, results) {
                console.log(results, 'lower track');
                var lowerTrack = results;

                  lowerTrack.orderNumber = lowerTrack.orderNumber-1;
                  console.log(lowerTrack);
                  lowerTrack.save(function(err,newHigherTrack){
                    if (newHigherTrack!==null){
                      console.log('Lower Track successfully highered', newHigherTrack);
                      targetTrack.orderNumber = targetTrack.orderNumber+1;
                      targetTrack.save(function(err,newTargetTrack){
                        if (newTargetTrack!==null){
                          res.cookie(newTargetTrack._id, newTargetTrack._id, { expires: new Date(Date.now() + 20000000), httpOnly: true });
                          res.json(track);
                        console.log('Target Track successfully downvoted',newTargetTrack);
                        }
                      });
                    } 
                    else { return console.log("update track order error");
                    }
                  });    
              });
          }, function(err) {
            console.log('Something went wrong!', err);
          });
      }      
    });
  });    
});


// var through = require('through2');
// var LastfmExportStream = require('lastfmexportstream');
 
// var jshin8 = new LastfmExportStream({
//   apiKey: '6ce885678c6801ed66c70ade6dab113c',
//   user: 'jshin8',
//   reverse: 'true',
//   tracksPerRequest: 2
// });
// jshin8
//   .pipe(through.obj(function (track, enc, callback) {
//     console.log(track);
//     callback();
//   }));
 






httpServer.listen(process.env.PORT || 3000, function () {
  console.log('server started on locahost:3000');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
