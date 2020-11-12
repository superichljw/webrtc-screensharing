const express = require('express')
const { request } = require('http')
const { url } = require('inspector')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const { v4: uuidV4 } = require('uuid')
const nodeStatic = require('node-static');

http.listen(3000)

app.set('view engine', 'ejs')
app.use(express.static('public'))

// app.get('/', (req, res) => {
//   res.redirect(`/${uuidV4()}`)
// })
var arr = new Array();
app.get('/:name', (req, res) => {
    var adres = arr.push(req.params.name)
    var count = 0;
    for(var i=0;i<arr.length;i++){
      if(arr[i]===req.params.name){
        count++;
      }
    }
    if(count==1){
      res.render('host', { roomId: req.params.name, roomType: 'host' })
      // res.redirect({ roomId: req.params.name, roomType: 'host' },'http://localhost:3000/admin')
    }else{
      res.render('room', { roomId: req.params.name, roomType: 'guest' })
    }
    // var adres = req.params.name.toString();
    // var roomType = adres.substring(adres.indexOf('-'),adres.lastIndexOf('-')+1);
    // console.log(roomType)
    // if(roomType=='-host-'){
    //   var roomadres = req.params.name.toString().replace('-host-','');
    //   console.log(roomadres + '1');
    //   res.render('host', { roomId: roomadres, roomType: 'host' })
     
    // }else if(roomType=='-guest-'){
    //   var roomadres = req.params.name.toString().replace('-guest-','');
    //   console.log(roomadres + '22222');
    //   res.render('room', { roomId: roomadres, roomType: 'guest' })
    // }else{
    //   console.log('?');
    // }
})

var arraylist = new Array();


io.on('connection', socket => {

  socket.on('create or join', (roomId, userId) => {
    arraylist.push(roomId)
    var count = 0;
    for(var i=0;i<arraylist.length;i++){
      if(arraylist[i]===roomId){
        count++;
      }
    }
    console.log(count)
    if (count == 1) {
      console.log(roomId + ' 의 방이 생성되었습니다');
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('room-created', userId, roomId)
      socket.to(roomId).broadcast.emit('screen-share', userId, roomId)
    } else {
      
      console.log('한 명의 유저가 접속을 했습니다.');
      console.log(roomId, userId);
      // console.log('randomId : ' + uuidV4())

      socket.emit('sendId', userId)

      socket.join(roomId)
      socket.to(roomId).broadcast.emit('user-connected', userId, roomId)

      socket.to(roomId).broadcast.emit('screen-share', userId, roomId)
    }


    socket.on('disconnect', () => {
      arraylist.pop(roomId)
      arr.pop(roomId)
      console.log('유저가 방을 나갔습니다');
      socket.to(roomId).broadcast.emit('user-disconnect', userId)
    })
  })


  socket.on('send_msg', (msg, roomId) => {
    //콘솔로 출력을 한다.
    console.log(msg);

    //다시, 소켓을 통해 이벤트를 전송한다.
    io.to(roomId).emit('send_msg', msg);

  });

})

