// CLIENT-SIDE JAVASCRIPT
// On page load
var socket = io();
setTimeout(function(){ console.log(socket.id); }, 500);



$(document).ready(function(){
  console.log('Hey, Earth!');
  	
  	tinysort('.showqueue > div',{attr: 'class'});

 //  	$.each(document.cookie.split(/; */), function()  {
	//   var splitCookie = this.split('=');
	//   console.log(splitCookie,'yayayayayay');
	//   	if(splitCookie!=[]){
	// 	  var formed = $("input#"+splitCookie[0]).val();
	// 	  console.log(splitCookie[0],'pikachu');
	// 	  console.log(formed);
	// 	  // name is splitCookie[0], value is splitCookie[1]
	// 	  if (splitCookie[0]==formed){
	// 	  	console.log('HHHOOOOOOORAY');
	// 	  }
	// 	}
	// });

	function createHTML(response) {
		var spotid = $('#spotid').data().spotid;
		var spotplid = $('#spotplid').data().spotplid;
		
		return "<form id= '" + response.id + "'><input name='trackName' type='hidden' id='track-name' value='" + response.name + "'>"
		+ "<input name='album' type='hidden' id='album-name' value='" + response.album.name + "'><input name='artist' type='hidden' id='artist-name' value='" + response.artists[0].name  + "'>"
		+ "<input name='spotifyTrackURI' type='hidden' id='track-uri' value='" + response.uri + "'><input name='sspotifyID' type='hidden' id='spotifyid' value='" + spotid + "'>"
		+ "<input name='sspotifyPlaylistID' type='hidden' id='spotifyplid' value='" + spotplid + "'><input name='spotifyLinkNumber' type='hidden' id='track-link-number' value='" + response.id + "'>"
		+ "<button type='submit'><div class='thumbnail' id= '" + response.id + "'>"
		+ "<div class = 'imagethumb'><img src='" + response.album.images[2].url + "' width='64' height='64'></div>"
	    + "<div><h5 class= 'thumbname'>" + response.name + "</h5></div>"
		+ "<p>" + response.album.name + "<div><h5 class= 'thumbname'>" + response.artists[0].name + "</h5></div><br></p></button></form>";
	}

	$("#searchstuff").on('submit', function(e){
		e.preventDefault();

		$(".showresults").empty();
		var search = $("#searchInput").val();
		// var searchType = $("input[name=searchType]:checked").val();
		console.log(search);
		// console.log(searchType);
		$.ajax({
			// url: "https://api.spotify.com/v1/search?q=" + search + '&type=' + searchType + '&limit=5',
			url: "https://api.spotify.com/v1/search?q=" + search + '&type=track&limit=5',
			dataType: 'json',
			success: function(data){
				var betterData = data.tracks.items;
				betterData.forEach(function(listing){
					var id = "#"+listing.id;
					$(".showresults").append(createHTML(listing));
					
					$(id).on('submit', function(e){
						e.preventDefault();
						var jukebotid = $('#jukebotid').data().jukebotid;
						$.post('/api/jukebots/'+ jukebotid + '/tracks', $(this).serialize(), function(response){
							var newTrack=response;
							// console.log(newTrack);
							socket.emit('new track post', newTrack);	
						// $(".showqueue").append(moreHTML(newTrack));
						

						});
						$(".showresults").empty();
						console.log('ugh',id);
					});
					

		
				});
				console.log(betterData);
			}
		});
	});
	socket.on('track post', function(tracks){	
		$(".showqueue").append(moreHTML(tracks));
	});

	function moreHTML(response){

		return "<div class='" + response.orderNumber + "'><form class='hella' id='" + response.spotifyLinkNumber + "'>"
		+ "<input name='ordernumber' type='hidden' id='order-number' value='up'><input name='trackId' type='hidden' id='" + response._id + "' value='" + response._id + "'>"
		+ "<input name='sspotifyPlaylistID' type='hidden' id='sspotify-playlist-id' value='" + response.sspotifyPlaylistID + "'>"
		+ "<input name='sspotifyID' type='hidden' id='sspotify-id' value='" + response.sspotifyID + "'>"
		+ "<br><button type='submit' id='" + response.spotifyLinkNumber + " class='" + response.orderNumber + "'>"
		+ "<i class='glyphicon glyphicon-arrow-up'></i></button></form>" + response.orderNumber + ". " + response.trackName + " - " + response.artist + "<form class='hella' id='" + response.spotifyLinkNumber + "'>"
		+ "<input name='ordernumber' type='hidden' id='order-number' value='down'><input name='trackId' type='hidden' id='track-id' value='" + response._id + "'>"
		+ "<input name='sspotifyPlaylistID' type='hidden' id='sspotify-playlist-id' value='" + response.sspotifyPlaylistID + "'>"
		+ "<input name='sspotifyID' type='hidden' id='sspotify-id' value='" + response.sspotifyID + "'>"
		+ "<button type='submit' id='" + response.spotifyLinkNumber + " class='" + response.orderNumber + "'><i class='glyphicon glyphicon-arrow-down'></i></button><br></form></div>";
	}

	$(document).on('submit', '.hella', function(e){
		e.preventDefault();
		console.log('click works on button');
		var trackids = $(this).attr('id');
		var that = this;
		var jukebotid = $('#jukebotid').data().jukebotid;
		$.post('/api/jukebots/'+ jukebotid + '/order', $(this).serialize(), function(response){
			if (response !== null){
			var updateVote=response;
			$(that).children().css( "background-color", "aqua" );
			console.log(updateVote, 'what it is');

			var whatwhatwhat = $.cookie(updateVote._id);
			console.log(whatwhatwhat);
			// socket.emit('new vote', updateVote);
			// $('.showqueue').load('/1211055838/300 .showqueue', function(){
			// });
			}
		});
	});

	// socket.on('vote', function(data){
	
	// });

	
});


