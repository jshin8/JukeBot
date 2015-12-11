// CLIENT-SIDE JAVASCRIPT
// On page load
$(document).ready(function(){
  console.log('Hey, Earth!');
  // pageLoad();

  function createHTML(response) {
	// "<div class='product-box'><a target='_blank' href='"+ response.listing_url + "'>"
	return "<div class='thumbnail' id= '" + response.id + "'>"
	+ "<div class = 'imagethumb'><img src='" + response.album.images[2].url + "' width='64' height='64'></div>"
    + "<div><h5 class= 'thumbname'>" + response.name + "</h5></div>"
	+ "<p>" + response.album.name + "<div><h5 class= 'thumbname'>" + response.artists[0].name + "</h5></div><br></p>";
	}

	$("#searchstuff").on('submit', function(e){

		$(".showresults").empty();
		e.preventDefault();
		var search = $("#searchInput").val();
		var searchType = $("input[name=searchType]:checked").val();
		console.log(search);
		console.log(searchType);
		$.ajax({
			url: "https://api.spotify.com/v1/search?q=" + search + '&type=' + searchType + '&limit=5',
			dataType: 'json',
			success: function(data){
				var betterData = data.tracks.items;
				betterData.forEach(function(listing){
					var id = "#"+listing.id;
					$(".showresults").append(createHTML(listing));
					// $(".showresults").append(n.name, n.current_price, n.image_url);
					$(id).on('click', function(e){
						e.preventDefault();
						// $("#track_name").val(listing.name);
						// $("#track_album").val(listing.album.name);
						// $("#track_artist").val(listing.artists[0].name);
						// $("#track_uri").val(listing.uri);
						// $("#track_album_art").val(listing.album.images[2].url);
						// var search = $("#searchInput").val();
					console.log('ugh');
					});
				});
				console.log(betterData);
			}
		});
	});
});

// function pageLoad() {
//   // set event listeners
//   $("#botmaker").on("submit", function(e){
//     // prevent form submission
//     e.preventDefault();
//     // post serialized form to server
//     $.post("/api/jukebots", $(this).serialize(), function(response){
//       // append new post to the page
//       var newJukebot = response;
//       console.log(newJukebot);
//     });
    
//   });
// }