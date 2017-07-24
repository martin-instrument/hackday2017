// socket connect info
var socket = io.connect('http://10.0.0.145:3000/');
var controllerID = 1;

var gameCanvas;
var gCtx;
var d;
var paused = false;
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
var assets = [
  {id: "player", url: "images/player.png", image: {}, d: {w: 920, h: 137, fw: 115}, frames: 8},
  {id: "track", url: "images/track.png", image: {}, d: {w: 960, h: 640}, frames: 1},
  {id: "trackStart", url: "images/track-start.png", image: {}, d: {w: 960, h: 640}, frames: 1}
];
var assetsById = {};
var player1 = {id: players[0], x: 0, y: 0, state: STATE.running, frame: 0, xOffset: 100, yOffset: 300, distance: 0};
var player2 = {id: players[1], x: 0, y: 0, state: STATE.running, frame: 0, xOffset: 50, yOffset: 360, distance: 0};

var players = [player1, player2];

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
      gCtx.drawImage(p.image, 0, 0, p.d.fw, p.d.h, player.xOffset, player.yOffset * STATE.ratio, p.d.fw * STATE.ratio, p.d.h * STATE.ratio);
      p.frame = 0;
      break;
    case STATE.running:
      if (frame % 4 === 0) {
        player.frame++;
        if (player.frame >= p.frames) {
          player.frame = 0;
        }
      }

      gCtx.drawImage(p.image, p.d.fw * player.frame, 0, p.d.fw, p.d.h, player.xOffset, player.yOffset * STATE.ratio, p.d.fw * STATE.ratio, p.d.h * STATE.ratio);
      break;
  }
  gCtx.restore();
  // gCtx.drawImage(assetsById['player'].image, 0, 0);
}

function render() {
  // gCtx.clearRect(0, 0, d.w, d.h);
  frame++;
  STATE.distance += 10;
  gCtx.fillStyle = '#000000';
  gCtx.fillRect(0, 0, d.w, d.h);
  drawField();
  drawPlayer(player1);
  drawPlayer(player2);
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

function init() {
  pauseButton = document.getElementById("pauseBtn");
  pauseButton.onclick = pause;
  gameCanvas = document.getElementById("gameCanvas");
  resize();
  gCtx = gameCanvas.getContext("2d");
  console.log('filters - ');
  console.log(gCtx);
  loadAssets();
}

function assetLoaded() {
  assetsLoaded++;
  if (assetsLoaded === assets.length) {
    for(var i=0; i<assets.length; i++){
      assetsById[assets[i].id] = assets[i];
    }
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

socket.on('buttonUpdate', (data) => {
    if (players.indexOf(data.id != -1)) {
        console.log(data);
    }
});

window.onload = init;
<<<<<<< HEAD
window.onresize = resize;
=======
window.resize = resize;
>>>>>>> added sockets
