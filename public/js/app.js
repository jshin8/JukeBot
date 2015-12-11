// CLIENT-SIDE JAVASCRIPT
// On page load
$(document).ready(function(){
  console.log('Hey, Earth!');
  // pageLoad();

  $("#searchstuff").on('submit', function(e){

		$(".showresults").empty();
		e.preventDefault();
		var search = $("#searchInput").val();
		console.log(search);
		$.ajax({
			url: "https://api.spotify.com/v1/search?q=" + search + '&type=artist',
			dataType: 'json',
			success: function(data){
				console.log(data);
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