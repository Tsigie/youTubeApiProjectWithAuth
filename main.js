// Options
const CLIENT_ID = '';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const cannelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('vidio-container');

const defaultChannel = 'techguyweb';

// Form submit and change channel
channelForm.addEventListner('submit', e => {
  e.preventDefault();

  const channel = channelInput.value;
  getChannel(channel);
});

// Load auth2 library
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
  gapi.client.init({
    discovryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPE
  }).then(() => {
    // Listen for sign in state changes
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // Handle initial sign in state
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

// Upodate UI sign in state changes
function updateSignStatus(isSignedIn) {
  if(isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    content.style.display = 'block';
    videoContainer.style.display = 'block';
    getChannel(defaultChannel);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    content.style.display = 'none';
    videoContainer.style.display = 'none';
  }
}

// Handle login
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}

// Display cannel data
function showChannelData(data) {
 const channelData = document.getElementById('channel-data');
 channelData.innerHTML = data;
}

// Get channel from API
function getChannel(channel) {
  gapi.client.youtube.channels
  .list({
    part: 'snippet, contentDetails,statistics',
    forUsername: channel
  })
  .then(response => {
    console.log(response);
    const channel = response.result.items[0];

    const output = `
    <ul class="collection">
      <li class="collection-item">Title: ${channel.snippet.title}</li>
      <li class="collection-item">ID: ${channel.id}</li>
      <li class="collection-item">Subscribers: ${
        numberWithCommas(channel.statisatics.subscriberCount)}</li>
      <li class="collection-item">Views: ${
        numberWithCommas(channel.statistics.viewCount
        )} < /li>
      <li class="collection-item">Vidios: ${
        numberWithCommas(channel.statistics.videoCount
        )} < /li>
    </ul>
    <p>${channel.snippet.description}</p>
    <hr>
    <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${
      channel.snippet.customUrl
    }">Visit Channel</a>
    `;
    showChannelData(output);
  })
  .catch(err => alert('No Channel By That Name'));
}
// Add commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function requestVidioPlaylist(playlistId) {
  const requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 10
  }

  const request = gapi.client.youtube.playlistItem.list(requestOptions);

  request.execute(response => {
    console.log(response);
    const playlistItems = response.result.items;
    if(playlistItems) {
      let output = '<br><h4 class="center-align">Latest Vidios</h4>';

      // Loop throug videios and append output
      playListItems.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;

        output += `
          <div class="col s3">
          <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}"
          frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        `;
      });

      // Output videios
      videoContainer.innerHTML = output;
    } else {
      videoContainer.innerHTML = 'No Uploaded Videos';
    }
  });
}