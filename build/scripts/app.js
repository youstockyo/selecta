// DJ Selection
//---------------------------
var SplashSubmit = (function() {

  // Structure
  var form         = document.querySelector('form');
  var submitButton = document.querySelector('form button');

  // Events
  var uiActions = function() {
    form.addEventListener('click', showSubmit);
  };

  // Function(s)
  var showSubmit = function() {
    var djIsChecked = document.querySelectorAll('input[type="checkbox"]:checked');
    if (djIsChecked.length >= 1) {
      submitButton.classList.add('active');
    } else {
      submitButton.classList.remove('active');
    }
  };

  var init = function() {
    uiActions();
  };

  return init();

})();


// Playlist Creation
//---------------------------
var PlaylistMaker = (function(){

  // Structure
  var finalPlaylist;
  var fbTracks = [];
  var fbRef    = new Firebase('https://selecta-574e0.firebaseio.com/');
  var form     = document.querySelector('form');
  var djPool   = document.querySelectorAll('.dj-pool');

  // Events
  var uiActions = function() {
    form.addEventListener('submit', makePlaylist);
  };

  // Functions
  var makePlaylist = function(e) {
    e.preventDefault();
    var djs = [];
    var poolTracks = [];

    // Safari does not allow forEach method on a nodeList (djPool),
    // so convert djPool to an array
    djPoolArray = [].slice.call(djPool);

    // Get selected DJs, push the selection(s)
    // to the djs array
    djPoolArray.forEach(function(i) {
      if (i.checked) {
        djs.push(i.value);
      }
    });

    // Get each selected DJs playlist and push
    // those tracks to the poolTracks array
    djs.forEach(function(i) {
      poolTracks.push(fbTracks.wavy[i]);

      // Flatten poolTracks as it is initially
      // an array of arrays
      poolTracks = [].concat.apply([], poolTracks);
    });

    // Shuffle poolTracks
    poolTracks.sort(function() {
      return 0.5 - Math.random();
    });

    // The first 12 tracks of poolTracks
    // will be the final playlist
    finalPlaylist = poolTracks.slice(0, 12);
  };


  var init = function() {
    uiActions();

    // firebase data
    fbRef.on('value', function(snapshot) {
      fbTracks = snapshot.val();
    });
  };

  return {
    init: init(),
    finalPlaylist: function() { return finalPlaylist }
  };

})();


var GetTrackDetails = (function(){

  // Structure
  var trackDetails = [];
  var trackURLs    = [];
  var form = document.querySelector('form');

  // Events
  var uiActions = function() {
    form.addEventListener('submit', getTrackData);
  };

  // Function(s)
  var getTrackData = function() {
    PlaylistMaker.finalPlaylist().forEach(function(trackID) {
      var url = 'https://api.soundcloud.com/tracks/' + trackID + '?client_id=a6fd7031f106d30cca0acc1b77431c13';
      $.getJSON(url, compileTrackDetails)
      .fail(function() { console.log('getJSON error') });
    });
  };

  var compileTrackDetails = function(json) {
    // save track details in trackDetails array
    trackDetails.push(json);
    // save individual streaming urls in trackURLs array
    trackURLs.push(json.stream_url + '?client_id=a6fd7031f106d30cca0acc1b77431c13');
    // hide dj selection
    form.classList.add('hide');
  };

  
  var init = function() {
    uiActions();
  };

  return {
    init: init(),
    trackDetails: function() { return trackDetails },
    trackURLs: function() { return trackURLs },
    trackCount: function() { return trackURLs.length }
  };

})();


// Audio Player
//---------------------------
var PlayerControls = (function() {

  // Structure
  var audio      = new Audio();
  var tracks     = GetTrackDetails.trackURLs();
  var details    = GetTrackDetails.trackDetails();
  var trackIndex = 0;
  var form            = document.querySelector('form');
  var playPauseButton = document.querySelector('.play-pause');
  var next            = document.querySelector('.next');
  var previous        = document.querySelector('.previous');
  var logo            = document.querySelector('h1');
  var audioPlayer     = document.querySelector('.audio-player');
  var bgContainer     = document.querySelector('.background-image');
  var trackTitle      = document.querySelector('.track--title');
  var trackUser       = document.querySelector('.track--user');
  var trackArt        = document.querySelector('.track--art');
  var trackInfo       = document.querySelector('.track--info');
  var upNext          = document.querySelector('.up-next');
  var upNextArt       = document.querySelector('.up-next--art');
  var upNextTitle     = document.querySelector('.up-next--title');

  // Events
  var uiActions = function() {
    form.addEventListener('submit', function() {
      // wait a bit before playing the first track
      // (the player tries to load before
      // trackURLs is done compiling)
      setTimeout(firstPlay, 500);
    });
    audio.addEventListener('ended', playNextTrack);
    audio.addEventListener('error', errorSkipTrack);
    next.addEventListener('click', playNextTrack);
    previous.addEventListener('click', playPreviousTrack);
    playPauseButton.addEventListener('click', togglePlayPause);
  };

  // Function(s)
  var firstPlay = function() {
    // load first track
    audio.setAttribute('src', tracks[0]);
    audio.load();
    audio.play();
    console.log('first play', tracks[0], 'index: ', trackIndex, 'count: ', GetTrackDetails.trackCount());

    // ui changes
    audioPlayer.classList.add('active');
    bgContainer.classList.add('active');
    logo.style.cursor = 'pointer';

    controlsIsPlaying();
    showTrackDetails();
  };

  var playNextTrack = function() {
    if ((trackIndex + 1) < GetTrackDetails.trackCount()) {
      trackIndex = trackIndex + 1;
      audio.setAttribute('src', tracks[trackIndex]);
      audio.load();
      audio.play();
      console.log('next play', tracks[trackIndex], 'index :', trackIndex, 'count: ', GetTrackDetails.trackCount());

      // ui changes
      controlsIsPlaying();
      showTrackDetails();
    } else {
      errorNoNextPrevTrack();
    }
  };

  var playPreviousTrack = function () {
    if ((trackIndex - 1) > -1) {
      trackIndex = trackIndex - 1;
      audio.setAttribute('src', tracks[trackIndex]);
      audio.load();
      audio.play();
      console.log('prev play', tracks[trackIndex], 'index :', trackIndex, 'count: ', GetTrackDetails.trackCount());

      // ui changes
      controlsIsPlaying();
      showTrackDetails();
    } else {
      errorNoNextPrevTrack();
    }
  };

  var togglePlayPause = function() {
    if (playPauseButton.classList.contains('playing')) {
      audio.pause();

      // ui changes
      controlsIsPaused();
    } else {
      audio.play();

      // ui changes
      controlsIsPlaying();
    }
  };

  var showTrackDetails = function() {
    if ((trackIndex >= 0) && ((trackIndex + 1) < GetTrackDetails.trackCount())) {
      // current track details
      trackInfo.classList.remove('show');
      trackInfo.classList.add('hide');
      // update track details (with a delay for transition timing)
      setTimeout(function() {
        trackTitle.innerHTML = details[trackIndex].title;
        trackUser.innerHTML = details[trackIndex].user.username;
        trackInfo.classList.remove('hide');
        trackInfo.classList.add('show');
      }, 500);

      // next track details
      upNext.classList.add('hide');
      upNext.classList.remove('show');
      // update next track details (with a delay for transition timing)
      setTimeout(function() {
        upNextTitle.innerHTML = details[trackIndex + 1].title;
        upNext.classList.remove('hide');
        upNext.classList.add('show');
      }, 1500);
    } else {
      trackTitle.innerHTML = details[trackIndex].title;
      trackUser.innerHTML = details[trackIndex].user.username;
      upNext.classList.add('hide');
    }

    // track artwork
    if ((details[trackIndex].artwork_url !== null) && (details[trackIndex + 1].artwork_url !== null)) {
      var artwork     = details[trackIndex].artwork_url;
      var newArtwork  = artwork.replace(/-large/i, '-t500x500');
      var nextArtwork = details[trackIndex + 1].artwork_url;

      trackArt.style.backgroundImage    = 'url("' + newArtwork + '")';
      bgContainer.style.backgroundImage = 'url("' + newArtwork + '")';

      setTimeout(function() {
        upNextArt.style.backgroundImage   = 'url("' + nextArtwork + '")';
      }, 1500);
    } else {
      trackArt.style.backgroundImage    = '';
      bgContainer.style.backgroundImage = '';
      trackArt.style.backgroundColor    = '#333';
      bgContainer.style.backgroundColor = '#333';

      setTimeout(function() {
        upNextArt.style.backgroundImage   = '';
        upNextArt.style.backgroundColor   = '#333'
      }, 1500);
    }
  };

  // Helpers
  var controlsIsPlaying = function() {
    playPauseButton.classList.add('playing');
    playPauseButton.classList.remove('fa-play');
    playPauseButton.classList.add('fa-pause');
  };

  var controlsIsPaused = function() {
    playPauseButton.classList.remove('playing');
    playPauseButton.classList.remove('fa-pause');
    playPauseButton.classList.add('fa-play');
  };

  // Error handling
  var errorNoNextPrevTrack = function() {
    audio.pause();
    trackIndex = 0;
    audio.setAttribute('src', tracks[trackIndex]);
    audio.load();
    console.log('error: no next/prev', 'index: ', tracks[trackIndex]);

    // ui changes
    controlsIsPaused();
  };

  var errorSkipTrack = function() {
    trackIndex = trackIndex + 1;
    audio.setAttribute('src', trackURLs[trackIndex]);
    audio.load();
    audio.play();

    // ui changes
    controlsIsPlaying();
  };

  var init = function() {
    uiActions();
  };

  return init();

})();
