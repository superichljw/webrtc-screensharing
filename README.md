# webrtc-screensharing
webrtc-screensharing 1:1 match

- vs 실행 -> 커맨드창 오픈 -> 아래 명령어 입력하여 nodejs 서버 설치
-npm init -y (package.json 파일 생성)
-npm i express ejs socket.io(package-lock.json 파일 생성)
-npm i uuid
-npm i --save-dev nodemon (node module 저장된 위치 내에 nodemon 폴더 생성)
-npm i -g peer(peer 라이브러리 설치)
- peerjs --port 3001(피어서버 포트 3001번에서 동작)

- 설치완료 후
- node server.js 입력하여 서버 실행
- 다른 커맨드창 추가로 열어서, peerjs --port 3001 실행

- localhost:3000/(방이름)
- 처음에 들어가면 host.ejs 실행
- 동일한 방으로 사람입장 시, room.ejs 실행
- 
