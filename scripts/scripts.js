// socket connect info
// var socket = io.connect('http://192.168.1.59:3000/');
var controllerID = 1;
var raceDistance = 5000;

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
var startTime;
var assets = [
  // {id: "player", url: "images/player.png", image: {}, d: {w: 920, h: 137, fw: 115}, frames: 8},
  {id: "player", url: "images/adain.png", image: {}, d: {w: 1600, h: 200, fw: 155}, frames: 8},
  {id: "player2", url: "images/guma.png", image: {}, d: {w: 1600, h: 200, fw: 155}, frames: 8},
  {id: "track", url: "images/track.png", image: {}, d: {w: 960, h: 640}, frames: 1},
  {id: "trackStart", url: "images/track-start.png", image: {}, d: {w: 960, h: 640}, frames: 1}
];
var assetsById = {};
var player1 = {id: 1, x: 0, y: 0, state: STATE.standing, frame: 0, xOffset: 400, yOffset: 240, tweenDist: 0, distance: 0, lastDistance: 0, left: false};
var player2 = {id: 2, x: 0, y: 0, state: STATE.standing, frame: 0, xOffset: 450, yOffset: 300, tweenDist: 0, distance: 0, lastDistance: 0, left: false};


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
  var p = pl.id === 1 ? assetsById['player'] : assetsById['player2'];
  var player = pl;
  gCtx.save();
  // if (pl === player2) {
  //   gCtx.filter = 'hue-rotate(180deg)';
  // }
  switch (player.state) {
    case STATE.standing:
      gCtx.drawImage(p.image, 0, 0, p.d.fw, p.d.h, player.xOffset - STATE.distance + player.distance, player.yOffset * STATE.ratio, p.d.fw * STATE.ratio, p.d.h * STATE.ratio);
      p.frame = 0;
      break;
    case STATE.running:

      player.frame = Math.floor(player.distance/30) % 8;
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
  if (!paused && started) {
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
  startButton.style.display = 'none';
  startOverlay.style.display = "block";
  setTimeout(countDown, 1000);
}

function countDown() {
  countdown--;
  if (countdown === 0) {
    startOverlay.style.display = "none";
    started = true;
    startTime = Number(new Date());
    player1.state = STATE.running;
    player2.state = STATE.running;
    window.requestAnimationFrame(render);
  } else {
    startText.innerHTML = countdown;
    setTimeout(countDown, 1000);
  }
}
function controlsInput(e) {
  switch(e.keyCode) {
    case 65:
      checkFoot(1, 0)
      break;
    case 68:
      checkFoot(1, 1)
      break;
    case 37:
      checkFoot(2, 0)
      break;
    case 39:
      checkFoot(2, 1)
      break;
    case 13:

      break;
  }
}

function initControls() {
  document.addEventListener('keydown', controlsInput, false);
}

function reset() {
  players.forEach((player) => {
    player.distance = 0;
    player.tweenDist = 0;
    player.state = STATE.standing;
  });
  startText.innerHTML = 'Ready';
  resetButton.style.display = 'none';
  startButton.style.display = 'block';
  startOverlay.style.display = "none";
  render();
}

function init() {
  pauseButton = document.getElementById("pauseBtn");
  startButton = document.getElementById("startBtn");
  resetButton = document.getElementById("resetBtn");
  pauseButton.onclick = pause;
  startButton.onclick = startRace;
  resetButton.onclick = reset;
  gameCanvas = document.getElementById("gameCanvas");
  scoreBoard = document.getElementById('scoreBoard');
  startOverlay = document.getElementById('startOverlay');
  startText = document.getElementById('startText');
  initControls();
  resize();
  gCtx = gameCanvas.getContext("2d");
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
    scoreString += '<div class="playerBlock"><div class="label label_' + players[i].id + '">Player ' + players[i].id + ': </div><div class="playerScore">' + Math.floor(players[i].distance) + '</div></div>';
  }
  var time = Number(new Date()) - startTime
  var minutes = String(Math.floor(time/60000));
  var seconds = String(Math.floor(time/1000) % 60);
  var miliseconds = String(Math.floor(time/100) % 10);
  if(seconds.length === 1) {
    seconds = '0' + seconds;
  }
  if(started) {
    scoreString += '<div class="time">Time: ' + Math.floor(time/60000) + ':' + seconds + ':' + (Math.floor(time/100) % 10) + '</div>';
  }
  scoreBoard.innerHTML = scoreString;
  players.forEach((player) => {
    if(player.distance >= raceDistance) {
      started = false;
      startText.innerHTML = player.id + ' won';
      startOverlay.style.display = "block";
      resetButton.style.display = 'block';
    }
  });
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
  player1.xOffset = 450 * STATE.ratio;
  player2.xOffset = 400 * STATE.ratio;
  if (gCtx) {
    render();
  }
}

function checkFoot(id, key){
  if (playersById["player" + id].left && key === 1) {
    playersById["player" + id].left = false;
    TweenMax.killTweensOf(playersById["player" + id]);
    TweenMax.to(playersById["player" + id], 0.05, {distance: playersById["player" + id].distance  + 30});
  }
  if (!playersById["player" + id].left && key === 0) {
    playersById["player" + id].left = true;
    TweenMax.killTweensOf(playersById["player" + id]);
    TweenMax.to(playersById["player" + id], 0.05, {distance: playersById["player" + id].distance  + 30});
  }
}


// if alternate foot, return true
// function checkFoot(data){
//   if(playersById["player" + data.id].left && data.b0 === 1){
//     playersById["player" + data.id].left = false;
//     TweenMax.killTweensOf(playersById["player" + data.id]);
//     TweenMax.to(playersById["player" + data.id], 0.05, {distance: playersById["player" + data.id].distance  + 30});
//   }if(!playersById["player" + data.id].left && data.b1 === 1){
//     playersById["player" + data.id].left = true;
//     TweenMax.killTweensOf(playersById["player" + data.id]);
//     TweenMax.to(playersById["player" + data.id], 0.05, {distance: playersById["player" + data.id].distance  + 30});
//   }
// }

// function cleanControllerInput(data){
//   if(data.id === 1){
//     return {id:1, b0: data.b1 , b1: data.b0 , b2: data.b2 , b3: data.b3};
//   }else{
//     return data;
//   }
// }

// socket.on('buttonUpdate', (data) => {
//   data = cleanControllerInput(data);
//   if(started && !paused) {
//     if (players.indexOf(data.id != -1)) {
//       players.forEach(function(player) {
//         if(player.id === data.id){
//           checkFoot(data);
//         }
//       }, this);
//     }
//   }
// });

window.onload = init;
window.onresize = resize;
