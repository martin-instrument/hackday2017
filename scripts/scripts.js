// socket connect info
var socket = io.connect('http://192.168.1.59:3000/');
var controllerID = 1;

var gameCanvas;
var gCtx;
var d;
var paused = false;
var scoreBoard;
var STATE = {
  standing: 'standing',
  running: 'running',
  jumping: 'jumping',
  leftFootForward: 'leftFootForward',
  rightFootForward: 'rightFootForward',
  ratio: 1,
  distance: 0,
  player1top: 360,
};
var frame = 0;
var assetsLoaded = 0;
var startOverlay;
var countdown = 4;
var startText;
var started = false;
var assets = [
  {id: "player", url: "images/player.png", image: {}, d: {w: 920, h: 137, fw: 115}, frames: 8},
  {id: "track", url: "images/track.png", image: {}, d: {w: 960, h: 640}, frames: 1},
  {id: "trackStart", url: "images/track-start.png", image: {}, d: {w: 960, h: 640}, frames: 1}
];
var assetsById = {};
var player1 = {id: 1, x: 0, y: 0, state: STATE.standing, frame: 0, xOffset: 100, yOffset: 300, distance: 0, left: false};
var player2 = {id: 2, x: 0, y: 0, state: STATE.standing, frame: 0, xOffset: 50, yOffset: 360, distance: 0, left: false};


var players = [player1, player2];
var playersById = {player1, player2};

for(var i = 0; i < players.length; i++){
  playersById["player" + players[i].id] = players[i];
}

function drawField() {
  t = assetsById.trackStart;
  d = STATE.distance % (960 * STATE.ratio);
  gCtx.drawImage(t.image, 0, 0, t.d.w, t.d.h, 0 - d, 0, t.d.w * STATE.ratio, t.d.h * STATE.ratio);
  gCtx.drawImage(t.image, 0, 0, t.d.w, t.d.h, 0 - d + t.d.w * STATE.ratio, 0, t.d.w * STATE.ratio, t.d.h * STATE.ratio);
  gCtx.drawImage(t.image, 0, 0, t.d.w, t.d.h, 0 - d + t.d.w * 2 * STATE.ratio, 0, t.d.w * STATE.ratio, t.d.h * STATE.ratio);
}

function drawPlayer(pl) {
  var p = assetsById['player'];
  var player = pl;
  gCtx.save();
  if (pl === player2) {
    gCtx.filter = 'hue-rotate(180deg)';
  }
  switch (player.state) {
    case STATE.standing:
      gCtx.drawImage(p.image, 0, 0, p.d.fw, p.d.h, player.xOffset - STATE.distance + player.distance, player.yOffset * STATE.ratio, p.d.fw * STATE.ratio, p.d.h * STATE.ratio);
      p.frame = 0;
      break;
    case STATE.running:
      if (frame % 4 === 0) {
        player.frame++;
        if (player.frame >= p.frames) {
          player.frame = 0;
        }
      }
      gCtx.drawImage(p.image, p.d.fw * player.frame, 0, p.d.fw, p.d.h, player.xOffset - STATE.distance + player.distance, player.yOffset * STATE.ratio, p.d.fw * STATE.ratio, p.d.h * STATE.ratio);
      break;
  }
  gCtx.restore();
}

function render() {
  frame++;
  updateScore();
  STATE.distance = Math.max(player1.distance, player2.distance);
  gCtx.fillStyle = '#000000';
  gCtx.fillRect(0, 0, d.w, d.h);
  drawField();
  drawPlayer(players[0]);
  drawPlayer(players[1]);
  if (!paused) {
    window.requestAnimationFrame(render);
  }
}

function pause() {
  paused = !paused;
  if (!paused) {
    window.requestAnimationFrame(render);
  }
}

function startRace() {
  countdown = 4;
  startOverlay.style.display = "block";
  setTimeout(countDown, 1000);
}

function countDown() {
  countdown--;
  if (countdown === 0) {
    startOverlay.style.display = "none";
    started = true;
  } else {
    startText.innerHTML = countdown;
    setTimeout(countDown, 1000);
  }
}

function init() {
  pauseButton = document.getElementById("pauseBtn");
  startButton = document.getElementById("startBtn");
  pauseButton.onclick = pause;
  startButton.onclick = startRace;
  gameCanvas = document.getElementById("gameCanvas");
  scoreBoard = document.getElementById('scoreBoard');
  startOverlay = document.getElementById('startOverlay');
  startText = document.getElementById('startText');

  resize();
  gCtx = gameCanvas.getContext("2d");
  console.log('filters - ');
  console.log(gCtx);
  loadAssets();
}

function resetScore() {
  for(var i=0; i<players.length; i++) {
    players[i].distance = 0;
  }
}

function updateScore() {
  var scoreString = '';
  for(var i=0; i<players.length; i++){
    scoreString += '<div class="playerBlock"><div class="label label_' + players[i].id + '">Player ' + players[i].id + ': </div><div class="playerScore">' + players[i].distance + '</div></div>';
  }
  // console.log('updateScore');
  scoreBoard.innerHTML = scoreString;
}

function assetLoaded() {
  assetsLoaded++;
  if (assetsLoaded === assets.length) {
    for(var i=0; i<assets.length; i++){
      assetsById[assets[i].id] = assets[i];
    }
    resetScore();
    window.requestAnimationFrame(render);
  }
}

function loadAssets() {
  for(var i=0; i<assets.length; i++) {
    assets[i].image = new Image();
    assets[i].image.onload = assetLoaded;
    assets[i].image.src = assets[i].url;
  }
}

function resize() {
  d = {w: window.innerWidth, h: window.innerHeight};
  gameCanvas.width = d.w;
  gameCanvas.height = d.h;
  STATE.ratio = d.h / 640;
}

// if alternate foot, return true
function checkFoot(data){
  console.log(playersById["player" + data.id].left);
  console.log(data.b0);

  if(playersById["player" + data.id].left && data.b0 === 1){
    // console.log("left foot");
    playersById["player" + data.id].left = false;
    playersById["player" + data.id].distance += 10;
  }if(!playersById["player" + data.id].left && data.b1 === 1){
    playersById["player" + data.id].left = true;
    playersById["player" + data.id].distance += 10;
    // console.log("right foot");
  }
}

function cleanControllerInput(data){
  if(data.id === 1){
    return {id:1, b0: data.b1 , b1: data.b0 , b2: data.b2 , b3: data.b3};
  }else{
    return data;
  }
}

socket.on('buttonUpdate', (data) => {
  data = cleanControllerInput(data);
  console.log(data);
    if (players.indexOf(data.id != -1)) {
        players.forEach(function(player) {
          if(player.id === data.id){
            checkFoot(data);
            // console.log("Player" + player.id + " distance = " + player.distance);
          }
        }, this);
    }
});

window.onload = init;
window.onresize = resize;
