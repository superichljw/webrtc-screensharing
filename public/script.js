const socket = io('/')
// const videoGrid = document.getElementById('video-grid')

const remoteVideo = document.getElementById("remoteVideo");
const screenVideo = document.getElementById('screenVideo')
const localVideo = document.getElementById('localVideo')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
// const myVideo = document.createElement('video')
// myVideo.muted = true
const peers = {}
//이렇게 하니까 방을 만들고 들어가는 접속이 일어날때마다 피어가 2개씩 열리게 된다, 즉 접속할때 create-room 열리고 아래에 있는 join-room 으로 열리게 된다
const Roomtype = Rtype;
if (Roomtype === 'host') {

  myPeer.on('open', id => {
    socket.emit('create or join', ROOM_ID, id)
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then(stream => {
      addVideoStream(localVideo, stream)

      myPeer.on('call', call => {
        call.answer(stream)
        // const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(localVideo, userVideoStream)
          // addVideoStream(screenVideo,userVideoStream)
        })
      })

      socket.on('room-created', (userId, roomId) => {
        console.log('user-connected : ' + userId)
        connectHost(userId, stream)
        // connectScreen(userId,stream)
      })

    })
  })
} else {
  myPeer.on('open', id => {
    socket.emit('create or join', ROOM_ID, id)
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then(stream => {
      // addVideoStream(remoteVideo, stream)

      myPeer.on('call', call => {
        call.answer(stream)
        // const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(localVideo, userVideoStream)
          // addVideoStream(screenVideo, userVideoStream)
        })
      })

    })
    socket.on('user-connected', (userId, roomId) => {
      console.log('user-connected : ' + userId)
      connectToNewUser(userId, stream)
      // connectScreen(userId,stream)
    })
  })
}





socket.on('user-disconnect', userId => {
  if (peers[userId]) peers[userId].close()

})
socket.on('sendId', userId => {
  $('#myid').val(userId)
})




function connectHost(userId, stream) {
  const call = myPeer.call(userId, stream)
  // const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(localVideo, userVideoStream)
    // addVideoStream(screenVideo, userVideoStream)
  })
  call.on('close', () => {
    localVideo.remove()
    // screenVideo.remove()
  })
  peers[userId] = call;
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  // const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(remoteVideo, userVideoStream)
    // addVideoStream(screenVideo, userVideoStream)
  })
  call.on('close', () => {
    remoteVideo.remove()
    // screenVideo.remove()
  })

  peers[userId] = call;

}
function connectScreen(userId, stream) {
  const call = myPeer.call(userId, stream)
  // const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(screenVideo, userVideoStream)
  })
  call.on('close', () => {
    screenVideo.remove()
  })

  peers[userId] = call;

}
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  // videoGrid.append(video)
}

$(document).ready(function () {

  //msg에서 키를 누를떄
  $("#msg").keydown(function (key) {
    //해당하는 키가 엔터키(13) 일떄
    if (key.keyCode == 13) {
      //msg_process를 클릭해준다.
      msg_process.click();
    }
  });

  //msg_process를 클릭할 때
  $("#msg_process").click(function () {
    //소켓에 send_msg라는 이벤트로 input에 #msg의 벨류를 담고 보내준다.
    var content = $("#myid").val() + " : " + $("#msg").val();
    socket.emit("send_msg", content, ROOM_ID);
    //#msg에 벨류값을 비워준다.
    $("#msg").val("");
    $("#msg").focus();
  });

  //소켓 서버로 부터 send_msg를 통해 이벤트를 받을 경우 
  socket.on('send_msg', function (msg) {
    //div 태그를 만들어 텍스트를 msg로 지정을 한뒤 #chat_box에 추가를 시켜준다
    var id = msg.split(':')[0].toString().trim();
    var myMsg = msg.split(':')[1].toString().trim();

    if (id == $("#myid").val()) {
      $("#chat_box").append("<div class='me'>나 : " + myMsg + "</div>");
    } else {
      $("#chat_box").append("<div class='other'>" + id + " : " + myMsg + "</div>");
    }
    // $('<div></div>').text(msg).appendTo("#chat_box");
    var top = document.getElementById('chat_box');
    top.scrollTop = top.scrollHeight;
  });

  $('#btn-start').click(function () {
    const screenHandler = new ScreenHandler();
    function onLocalStream(stream) {
      console.log('onLocalStream', stream);

      setVideoStream({
        el: screenVideo,
        stream: stream,
      });
    }
    function setVideoStream(data) {
      const video = data.el;
      video.srcObject = data.stream;
    }
    screenHandler.start((stream) => {
      onLocalStream(stream);
    });
  })
  $('#video-start').click(function () {
    
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then(stream => {
      // addVideoStream(localVideo, stream)

      myPeer.on('call', call => {
        call.answer(stream)
        // const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(localVideo, userVideoStream)
          // addVideoStream(screenVideo,userVideoStream)
        })
      })

      socket.on('user-connected', (userId, roomId) => {
        console.log('user-connected : ' + userId)
        connectToNewUser(userId, stream)
        // connectScreen(userId,stream)
      })

    })

  })
});


/**
* ScreenHandler
* @constructor
*/

function ScreenHandler() {
  console.log('Loaded ScreenHandler', arguments);

  // REF https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_shared_screen_tracks
  const constraints = {
    video: {
      width: 1980, // 최대 너비
      height: 1080, // 최대 높이
      frameRate: 10, // 최대 프레임
    }, audio: true
  };
  // let localStream = null;

  /**
   * 스크린캡쳐 API를 브라우저 호환성 맞게 리턴합니다.
   * navigator.mediaDevices.getDisplayMedia 호출 (크롬 72 이상 지원)
   * navigator.getDisplayMedia 호출 (크롬 70 ~ 71 실험실기능 활성화 or Edge)
   *
   * @returns {*}
   */
  function getCrossBrowserScreenCapture() {
    if (navigator.getDisplayMedia) {
      return navigator.getDisplayMedia(constraints);
    } else if (navigator.mediaDevices.getDisplayMedia) {
      return navigator.mediaDevices.getDisplayMedia(constraints);
    }
  }
  var screenStream = null;
  /**
   * 스크린캡쳐 API를 호출합니다.
   * @param callback
   */
  function start(callback) {
    getCrossBrowserScreenCapture().then(
      (stream) => {
        console.log('Success getDisplayMedia', stream);
        // const video = document.createElement('video')
        // myPeer.on('open', id => {
        //   socket.emit('join-room', ROOM_ID, id)
        // })
        screenStream = stream;
        // addVideoStream(screenVideo, screenStream);

        socket.on('screen-share', (userId, roomId) => {
          console.log('screen-connected : ' + userId)

          connectToNewUser(userId, screenStream)
          // connectScreen(userId,screenStream)
        })

        callback(screenStream);
      },
      (error) => {
        console.error('Error getDisplayMedia', error);
      }
    );
  }

  /**
  * 스트림의 트렉을 stop() 시켜 더이상 스트림이 전송되는것을 중지합니다.
  * @param callback
  */
  function end(callback) {
    screenStream.getTracks().forEach((track) => {
      track.stop();
    });

    callback && callback();
  }

  /**
   * extends
   */
  this.start = start;
  this.end = end;
}


