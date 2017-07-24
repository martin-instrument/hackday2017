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
  distance: 0,
};
var frame = 0;
var assetsLoaded = 0;
var assets = [
  {id: "player", url: "images/player.png", image: {}, d: {w: 920, h: 137, fw: 115}, frames: 8}
];
var assetsById = {};

var player = {x: 0, y: 0, state: STATE.running, frame: 0};

function drawField() {

}

function drawPlayer() {
  var p = assetsById['player'];
  switch (player.state) {
    case STATE.standing:
      gCtx.drawImage(p.image, 0, 0, p.d.fw, p.d.h, 0, 0, p.d.fw, p.d.h);
      p.frame = 0;
      break;
    case STATE.running:
      player.frame++;
      if (player.frame >= p.frames) {
        player.frame = 0;
      }
      gCtx.drawImage(p.image, p.d.fw * player.frame, 0, p.d.fw, p.d.h, 0, 0, p.d.fw, p.d.h);
      break;
  }
  // gCtx.drawImage(assetsById['player'].image, 0, 0);
}

function render() {
  // gCtx.clearRect(0, 0, d.w, d.h);
  frame++;
  gCtx.fillStyle = '#000000';
  gCtx.fillRect(0, 0, d.w, d.h);
  drawField();
  drawPlayer();
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
}

window.onload = init;
window.resize = resize;