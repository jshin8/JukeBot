// CLIENT-SIDE JAVASCRIPT
// On page load
$(document).ready(function(){
  console.log('Hey, Earth!');
  pageLoad();
});

function pageLoad() {
  // set event listeners
  $("#botmaker").on("submit", function(e){
    // prevent form submission
    e.preventDefault();
    // post serialized form to server
    $.post("/api/jukebots", $(this).serialize(), function(response){
      // append new post to the page
      var newJukebot = response;
      console.log(newJukebot);
    });
    $.ajax({
		type: 'POST',
		url: 'https://api.spotify.com/v1/users/{user_id}/playlists',
		success: function(object, status){
			that.parseObject(object);
		},
	    error: function(object, status){
	        console.log("There was an error!");
	    }
	});
  });
}