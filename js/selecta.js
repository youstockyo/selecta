// Setup
//---------------------------
var djs = [];
var poolTracks = [];
var finalPlaylist;


// Structure
//---------------------------
var form = document.querySelector('form');
var genreGroup = document.querySelectorAll('input[name=genre-group]');
var djPool = document.querySelectorAll('.dj-pool')


// Events
//---------------------------
form.addEventListener('submit', mixtapeSetup);


// Event Handlers
//---------------------------
function mixtapeSetup(e) {
	e.preventDefault();
	getDJs();
	makePlaylist();
}


// DJ Selection
//---------------------------
function getDJs() {
	djPool.forEach(isChecked);
	function isChecked(i) {
		if (i.checked) {
			djs.push(i.value);
		}
	}
}


// Playlist Construction
//---------------------------
function makePlaylist() {
	console.log('DJs:', djs);

	djs.forEach(getPoolTracks);
	function getPoolTracks(i) {

		// Push each DJs playlist to the poolTracks array
		poolTracks.push(wavy[i]);

		// Flatten poolTracks as it is initially an
		// array of arrays
		poolTracks = [].concat.apply([], poolTracks);

		// Shuffle the poolTracks playlist
		poolTracks.sort(shuffle);

		// The first n tracks of poolTracks will be
		// the final playlist
		finalPlaylist = poolTracks.slice(0, 12);
	}

}


// Audio player
//---------------------------








// Helper functions
//---------------------------
// Simple shuffle
function shuffle() {
	return 0.5 - Math.random()
};

