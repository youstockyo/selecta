// Setup
//---------------------------
var audio = new Audio();
var trackDetails = [];
var trackURLs = [];
var trackIndex = 0;
var wavyPool;

var fbRef = new Firebase('https://selecta-574e0.firebaseio.com/');

SC.initialize({
	client_id: 'a6fd7031f106d30cca0acc1b77431c13'
});



// Structure
//---------------------------
var bgContainer     = document.querySelector('.background-image');
var form            = document.querySelector('form');
var submitButton    = document.querySelector('form button');
var genreGroup      = document.querySelectorAll('input[name=genre-group]');
var djPool          = document.querySelectorAll('.dj-pool');
var playPauseButton = document.querySelector('.play-pause');
var next            = document.querySelector('.next');
var previous        = document.querySelector('.previous');
var audioPlayer     = document.querySelector('.audio-player');
var trackTitle      = document.querySelector('.track--title');
var trackUser       = document.querySelector('.track--user');
var trackArt        = document.querySelector('.track--art');
var trackInfo       = document.querySelector('.track--info');
var upNext = document.querySelector('.up-next');
var upNextArt = document.querySelector('.up-next--art');
var upNextTitle = document.querySelector('.up-next--title');


// Events
//---------------------------
form.addEventListener('submit', makePlaylist);
form.addEventListener('click', showSubmit);
audio.addEventListener('ended', playNextTrack);
audio.addEventListener('error', skipTrack);
next.addEventListener('click', playNextTrack);
previous.addEventListener('click', playLastTrack);
playPauseButton.addEventListener('click', togglePlayPause);


// TODO: Firebase data
//---------------------------


// Playlist Construction
//---------------------------
function showSubmit(e) {
	var djIsChecked     = document.querySelectorAll('input[type="checkbox"]:checked');
	
	if (djIsChecked.length >= 1) {
		submitButton.classList.add('active');
	} else {
		submitButton.classList.remove('active');
	}
}


function makePlaylist(e) {
	e.preventDefault();

	var djs = [];
	var poolTracks = [];
	var finalPlaylist;

	// Safari does not allow forEach method on a nodeList (djPool),
	// so convert djPool to an array
	djPoolArray = [].slice.call(djPool);

	// Get selected DJs, push the selection(s)
	// to the djs array
	djPoolArray.forEach(isChecked);
	function isChecked(i) {
		if (i.checked) {
			djs.push(i.value);
		}
	}

	console.log('DJs:', djs);

	// Get each selected DJs playlist and push
	// those tracks to the poolTracks array
	djs.forEach(getPoolTracks);
	function getPoolTracks(i) {
		poolTracks.push(wavy[i]);

		// Flatten poolTracks as it is initially
		// an array of arrays
		poolTracks = [].concat.apply([], poolTracks);

		// Shuffle the poolTracks playlist
		poolTracks.sort(shuffle);

		// The first 12 tracks of poolTracks
		// will be the final playlist
		finalPlaylist = poolTracks.slice(0, 12);
	}

	console.log('finalPlaylist: playlist created', finalPlaylist);

	// get track details
	finalPlaylist.forEach(pushTrackDetails);
	function pushTrackDetails(trackID) {
		var url = 'https://api.soundcloud.com/tracks/' + trackID + '?client_id=a6fd7031f106d30cca0acc1b77431c13';
		$.getJSON(url, compileTrackDetails)
		.fail(function() { console.log('getjson error'); });
	}

	function compileTrackDetails(json) {
		// save track details in trackDetails array
		trackDetails.push(json);
		// save streaming urls for each track in trackURLs array
		trackURLs.push(json.stream_url + '?client_id=a6fd7031f106d30cca0acc1b77431c13');
	}

	console.log('trackDetails', trackDetails);
	console.log('trackURLs', trackURLs);
	form.classList.add('hide');

	// wait a bit before playing the first track
	// (the player tries to load before
	// trackURLs is done compiling)
	setTimeout(initialPlay, 500);
}


// Audio player
//---------------------------
function initialPlay() {
	audio.setAttribute('src', trackURLs[0]);
	audio.load();
	audio.play();
	console.log('trackIndex', trackIndex);

	// add playing class, change icon to 'pause'
	playPauseButton.classList.add('playing');
	playPauseButton.classList.add('fa-pause');

	audioPlayer.classList.add('active');
	bgContainer.classList.add('active');
	showCurrentTrackDetails();
	showNextTrackDetails();
}

// Use playNextTrack when current track is finished playing
// or when the Next button is clicked
function playNextTrack() {
	var trackCount = trackURLs.length;

	// Continue to next song
	if ((trackIndex + 1) < trackCount) {
		trackIndex = trackIndex + 1;
		audio.setAttribute('src', trackURLs[trackIndex]);
		audio.load();
		audio.play();
		playPauseButton.classList.add('playing');
		playPauseButton.classList.remove('fa-play');
		playPauseButton.classList.add('fa-pause');
		console.log('trackIndex', trackIndex, 'trackCount', trackCount);

		showCurrentTrackDetails();
		showNextTrackDetails();
	} else {
		audio.pause();
		playPauseButton.classList.remove('playing');
		playPauseButton.classList.remove('fa-pause');
		playPauseButton.classList.add('fa-play');
		trackIndex = 0;
		audio.setAttribute('src', trackURLs[trackIndex]);
		audio.load();
		console.log('trackIndex', trackIndex, 'trackCount', trackCount);

		showCurrentTrackDetails();
		showNextTrackDetails();
	}
	
}

function playLastTrack() {
	var trackCount = trackURLs.length;

	if ((trackIndex - 1) > -1) {
		trackIndex = trackIndex - 1;
		audio.setAttribute('src', trackURLs[trackIndex]);
		audio.load();
		audio.play();
		playPauseButton.classList.add('playing');
		playPauseButton.classList.remove('fa-play');
		playPauseButton.classList.add('fa-pause');
		console.log('trackIndex', trackIndex, 'trackCount', trackCount);

		showCurrentTrackDetails();
		showNextTrackDetails();
	} else {
		audio.pause();
		playPauseButton.classList.remove('playing');
		playPauseButton.classList.remove('fa-pause');
		playPauseButton.classList.add('fa-play');
		trackIndex = 0;
		audio.setAttribute('src', trackURLs[trackIndex]);
		audio.load();
		console.log('trackIndex', trackIndex, 'trackCount', trackCount);

		showCurrentTrackDetails();
		showNextTrackDetails();
	}
}


// Error handling
// If a track can't be played, skip to the next one
function skipTrack() {
	console.log('error playing track');
	trackIndex = trackIndex + 1;
	console.log('trackIndex', trackIndex);
	audio.setAttribute('src', trackURLs[trackIndex]);
	audio.load();
	audio.play();
	playPauseButton.classList.add('playing');
	playPauseButton.classList.remove('fa-play');
	playPauseButton.classList.add('fa-pause');
}


function togglePlayPause(e) {
	e.preventDefault();

	// if playing, pause the player on click
	if (playPauseButton.classList.contains('playing')) {
		audio.pause();
		playPauseButton.classList.remove('playing');
		playPauseButton.classList.remove('fa-pause');
		playPauseButton.classList.add('fa-play');
		console.log('pausing');
	} else {
		audio.play();
		playPauseButton.classList.add('playing');
		playPauseButton.classList.remove('fa-play');
		playPauseButton.classList.add('fa-pause');
		console.log('playing');
	}
}


// Track details
//---------------------------
function showCurrentTrackDetails() {

	// fade in/out track info
	if (trackIndex > 0) {
		trackInfo.classList.remove('show');
		trackInfo.classList.add('hide');
		setTimeout( function() {
			trackTitle.innerHTML = trackDetails[trackIndex].title;
			trackUser.innerHTML = trackDetails[trackIndex].user.username;
			trackInfo.classList.remove('hide');
			trackInfo.classList.add('show');
		}, 500);
	} else {
		trackTitle.innerHTML = trackDetails[trackIndex].title;
		trackUser.innerHTML = trackDetails[trackIndex].user.username;
	}
	

	// display track artwork (grab the bigger size for better quality)
	if (trackDetails[trackIndex].artwork_url !== null) {
		var artwork = trackDetails[trackIndex].artwork_url;
		var newArtwork = artwork.replace(/-large/i, '-t500x500');
		trackArt.style.backgroundImage = 'url("' + newArtwork + '")';
		bgContainer.style.backgroundImage = 'url("' + newArtwork + '")';
	} else {
		trackArt.style.backgroundImage = '';
		bgContainer.style.backgroundImage = '';
		trackArt.style.backgroundColor = '#333';
		bgContainer.style.backgroundColor = '#333';
	}

}

function showNextTrackDetails() {
	var trackCount = trackURLs.length;

	if ((trackIndex + 1) < trackCount) {
		// show next track info
		upNext.classList.add('hide');
		upNext.classList.remove('show');
		// update next track details (with a delay for transition timing)
		setTimeout(function() {
			upNextTitle.innerHTML = trackDetails[trackIndex + 1].title;
			// update next track art thumbnail (if available)
			if (trackDetails[trackIndex + 1].artwork_url !== null) {
				var artwork = trackDetails[trackIndex + 1].artwork_url;
				upNextArt.style.backgroundImage = 'url("' + artwork + '")';
			} else {
				upNextArt.style.backgroundImage = '';
				upNextArt.style.backgroundColor = '#333';
			}
			upNext.classList.remove('hide');
			upNext.classList.add('show');
		}, 1500);
	} else {
		upNext.classList.add('hide');
	}
	
}


// Helper functions
//---------------------------
// Simple shuffle
function shuffle() {
	return 0.5 - Math.random();
}