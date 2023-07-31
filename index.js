// Helper function prints events to the console
// Will be passed as callback to callFrame event handlers
function showEvent(e) {
  console.log('video call event -->', e);
}

//async function createRoom() {
  // This endpoint is using the proxy as outlined in netlify.toml
  // If you prefer to use the Netlify function then update the path below accordingly
  
  /*const newRoomEndpoint = `${window.location.origin}/api/rooms`;
  try {
    let response = await fetch(newRoomEndpoint, {
        method: 'POST',
      }),
      room = await response.json();
    return room.url;
  } catch (e) {
    console.error(e);
  }*/

  // Comment out the above and uncomment the below, using your own URL
  // if you prefer to test with a hardcoded room
  // return { url: "https://line.daily.co/testLine" };
//}

async function run() {
  // we're assuming an incoming url from the chrome extension
  // in the following format:
  // https://some-netlify-url.com/?room=https://mysubdomain.daily.co/roomname&screenshare=true
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room') /*|| (await createRoom())*/;
  const token = params.get('token') /*|| (await createRoom())*/;
  //const shareScreenOnJoin = params.get('screenshare');

  // Create the DailyIframe, passing styling properties to make it fullscreen
  window.callFrame = window.DailyIframe.createFrame({
    iframeStyle: {
      position: 'fixed',
      border: 0,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
  });

  function doAfterJoin(e) {
    showEvent(e);

    const header = document.getElementById('header');
    header.style.visibility = 'hidden';

    //update query param so url is shareable
   /* const url = new URL(window.location);
    url.searchParams.set('room', room);
    window.history.pushState({}, '', url);

    if (shareScreenOnJoin) {
      callFrame.startScreenShare();
    }*/
  }

  // Install event handlers
  callFrame
    .on('loading', showEvent)
    .on('loaded', showEvent)
    .on('started-camera', showEvent)
    .on('camera-error', showEvent)
    .on('joining-meeting', showEvent)
    .on('joined-meeting', doAfterJoin)
    .on('participant-joined', showEvent)
    .on('participant-updated', showEvent)
    .on('participant-left', showEvent)
    .on('recording-started', showEvent)
    .on('recording-stopped', showEvent)
    .on('recording-stats', showEvent)
    .on('recording-error', showEvent)
    .on('recording-upload-completed', showEvent)
    .on('app-message', showEvent)
    .on('input-event', showEvent)
    .on('error', showEvent)
    // Add a leave handler to clean things up
    .on('left-meeting', leave);

  // Join the room
  try {
    await callFrame.join({
      url: room,
      token: token,
      // Comment out the above and uncomment the below, if you hard-coded a room for local testing (line 24)
      // url: room.url,
      showLeaveButton: true,
    });
  } catch (error) {
    // Handle the error here and display an appropriate error message
    console.error('Error joining the room:', error);}

    // For example, you can update the page text to show the error message
    const pageText = document.getElementById('page-text');
    pageText.innerHTML = 'Error joining the room. Please check the room URL and token.';
    pageText.style.color = 'red';


  // Leave handler
  
  function leave(e) {
    showEvent(e);
    callFrame.destroy();
    document.getElementById('header').style.visibility = 'visible';
    document.getElementById('page-text').innerHTML = `Thanks for using Line's telemedicine platform!`;
  
    // Replace the 'your_app_deeplink_url' with your actual app's deep link URL
   // window.location.href = 'your_app_deeplink_url';
  }

  // Log information about the call to the console
  console.log(
    ' You are connected to',
    callFrame.properties.url,
    '\n',
    'Use the window.callFrame object to experiment with',
    '\n',
    'controlling this call. For example, in the console',
    '\n',
    'try',
    '\n',
    '    callFrame.participants()',
    '\n',
    '    callFrame.setLocalVideo(false)',
    '\n',
    '    callFrame.startScreenShare()'
  );
}
