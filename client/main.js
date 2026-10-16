const a0_0x2caa9e = null; // (ancien décodeur de chaînes supprimé)
import * as a0_0x1dc23f from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
const audio = {
    chest: new Audio("assets/sounds/chest.mp3"),
    correct: new Audio("assets/sounds/correct.mp3"),
    victory: new Audio("assets/sounds/victory.mp3"),
  },
  socket = io({ query: { room: window.ISLAMCRAFT_ROOM }, transports: ["websocket", "polling"] });
let joyActive = ![],
  joyVec = { x: 0x0, y: 0x0 },
  lastMoveSent = 0x0;
const players = {};
let myId = null,
  nickname = "",
  gameStarted = ![];
const treasures = {},
  lobby = document.getElementById("lobby"),
  waitingText = document.getElementById("waiting"),
  joinBtn = document.getElementById("joinBtn"),
  nicknameInput = document.getElementById("nicknameInput"),
  questionBox = document.getElementById("questionBox"),
  questionText = document.getElementById("questionText"),
  answersDiv = document.getElementById("answers"),
  scene = new a0_0x1dc23f.Scene();
scene.background = new a0_0x1dc23f["Color"](0x87ceeb);
const camera = new a0_0x1dc23f["PerspectiveCamera"](
    0x46,
    window.innerWidth / window.innerHeight,
    0.1,
    0x3e8,
  ),
  renderer = new a0_0x1dc23f.WebGLRenderer({
    canvas: document.getElementById("game"),
    antialias: !![],
  });
(renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)),
  renderer.setSize(window.innerWidth, window.innerHeight),
  scene.add(new a0_0x1dc23f["HemisphereLight"](0xffffff, 0x444444, 1.2)));
const sun = new a0_0x1dc23f["DirectionalLight"](0xffffff, 0x1);
(sun.position.set(0xa, 0x14, 0xa), scene.add(sun));
function createPlayer(_0x34378b = 0xff00) {
  const _0x426543 = a0_0x2caa9e,
    _0x296184 = new a0_0x1dc23f.Group(),
    _0x516bd9 = new a0_0x1dc23f.MeshStandardMaterial({ color: _0x34378b }),
    _0x30acaf = new a0_0x1dc23f["Mesh"](
      new a0_0x1dc23f["BoxGeometry"](0x1, 1.5, 0.6),
      _0x516bd9,
    );
  ((_0x30acaf.position.y = 1.5), _0x296184.add(_0x30acaf));
  const _0x4b9b8f = new a0_0x1dc23f["Mesh"](
    new a0_0x1dc23f.BoxGeometry(0.8, 0.8, 0.8),
    _0x516bd9,
  );
  ((_0x4b9b8f.position.y = 2.6), _0x296184.add(_0x4b9b8f));
  const _0x3662f1 = new a0_0x1dc23f["Mesh"](
    new a0_0x1dc23f["BoxGeometry"](0.3, 0x1, 0.3),
    _0x516bd9,
  );
  (_0x3662f1.position.set(-0.8, 1.5, 0x0), _0x296184.add(_0x3662f1));
  const _0x3dde5c = _0x3662f1.clone();
  ((_0x3dde5c.position.x = 0.8), _0x296184.add(_0x3dde5c));
  const _0x41c67b = new a0_0x1dc23f["Mesh"](
    new a0_0x1dc23f["BoxGeometry"](0.4, 0x1, 0.4),
    _0x516bd9,
  );
  (_0x41c67b.position.set(-0.3, 0.5, 0x0), _0x296184.add(_0x41c67b));
  const _0x587f53 = _0x41c67b.clone();
  return (
    (_0x587f53.position.x = 0.3),
    _0x296184.add(_0x587f53),
    (_0x296184.userData = {
      armL: _0x3662f1,
      armR: _0x3dde5c,
      legL: _0x41c67b,
      legR: _0x587f53,
      walkTime: 0x0,
      moving: ![],
    }),
    _0x296184
  );
}
(socket.on("connect", () => {
  const _0x35601f = a0_0x2caa9e;
  console.log("Connecté au serveur avec id", socket.id);
}),
  socket.on("init", (_0x38228f) => {
    const _0x151bd2 = a0_0x2caa9e;
    ((myId = _0x38228f.id),
      questionBox.classList.add("hidden"),
      (lobby.style.display = "none"),
      waitingText.classList.add("hidden"));
  }),
  socket.on("treasures", (_0x35e60e) => {
    const _0x3ee0f8 = a0_0x2caa9e;
    if (!myId) return;
    Object.values(treasures).forEach((_0x19f231) =>
      scene.remove(_0x19f231.mesh),
    );
    for (const _0x22fcc0 in treasures) delete treasures[_0x22fcc0];
    (_0x35e60e.forEach((_0x329a60) => {
      const _0x5af737 = _0x3ee0f8,
        _0x3d7069 = createChest();
      (_0x3d7069.position.set(_0x329a60.x, 0.3, _0x329a60.z),
        scene.add(_0x3d7069),
        (treasures[_0x329a60.id] = { mesh: _0x3d7069, opening: ![] }));
    }),
      (document.getElementById("score1").textContent = "0"),
      (document.getElementById("score2").textContent = "0"),
      Object.keys(players).length < 0x2
        ? ((lobby.style.display = "block"),
          waitingText.classList.remove("hidden"),
          (gameStarted = ![]))
        : ((lobby.style.display = "none"),
          waitingText.classList.add("hidden"),
          (gameStarted = !![])));
  }),
  socket.on("treasureTaken", (_0x19261e) => {
    const _0x10f85d = a0_0x2caa9e;
    if (!treasures[_0x19261e]) return;
    (audio.chest.play(), (treasures[_0x19261e].opening = !![]));
  }),
  socket.on("scores", (_0x3726ef) => {
    const _0x402b31 = a0_0x2caa9e,
      _0x1c679a = _0x3726ef.scores,
      _0x2cc5a0 = _0x3726ef.players;
    document.getElementById("score1").textContent = _0x1c679a[myId] ?? 0x0;
    let _0x1392fc = null;
    for (const _0x2aa0de in _0x2cc5a0) {
      if (_0x2aa0de !== myId) {
        _0x1392fc = _0x2aa0de;
        break;
      }
    }
    _0x1392fc
      ? (document.getElementById("score2").textContent =
          _0x1c679a[_0x1392fc] ?? 0x0)
      : (document.getElementById("score2").textContent = "0");
  }),
  socket.on("players", (_0x53b39e) => {
    const _0x3114e4 = a0_0x2caa9e;
    if (!myId) return;
    for (const _0x11e1df in players) {
      !_0x53b39e[_0x11e1df] &&
        (scene.remove(players[_0x11e1df]), delete players[_0x11e1df]);
    }
    Object.keys(_0x53b39e).forEach((_0xa90447) => {
      const _0x3bfed0 = _0x3114e4;
      if (!players[_0xa90447]) {
        const _0x42def9 = createPlayer(_0xa90447 === myId ? 0xff00 : 0xff);
        (scene.add(_0x42def9), (players[_0xa90447] = _0x42def9));
      }
      {
        const sp = _0x53b39e[_0xa90447], pl = players[_0xa90447];
        if (pl.userData.tx === undefined) {
          pl.position.set(sp.x, 0x0, sp.z);
          pl.rotation.y = sp.rot;
        }
        pl.userData.tx = sp.x;
        pl.userData.tz = sp.z;
        pl.userData.trot = sp.rot;
        pl.userData.moving = sp.moving;
      }
    });
    let _0x464fdc = null;
    for (const _0x2b31b4 in _0x53b39e) {
      if (_0x2b31b4 !== myId) {
        _0x464fdc = _0x2b31b4;
        break;
      }
    }
    (_0x53b39e[myId] &&
      (document.getElementById("name1").textContent =
        _0x53b39e[myId].name || "Moi"),
      _0x464fdc &&
        _0x53b39e[_0x464fdc] &&
        (document.getElementById("name2").textContent =
          _0x53b39e[_0x464fdc].name || "Adversaire"));
  }),
  socket.on("question", (_0x3b7e72) => {
    const _0xc823a5 = a0_0x2caa9e;
    (questionBox.classList.remove("hidden"),
      (questionText.textContent = _0x3b7e72.question.q),
      (answersDiv.innerHTML = ""),
      _0x3b7e72.question.a.forEach((_0x5e17c8, _0x599f43) => {
        const _0xc6d4fb = _0xc823a5,
          _0x24493a = document.createElement("button");
        ((_0x24493a.className = "answerBtn"),
          (_0x24493a.textContent = _0x5e17c8),
          (_0x24493a.onclick = () => {
            const _0x22d139 = _0xc6d4fb;
            (socket.emit("answer", { answer: _0x599f43 }),
              questionBox.classList.add("hidden"));
          }),
          answersDiv.appendChild(_0x24493a));
      }));
  }),
  socket.on("startGame", () => {
    const _0x1e64e2 = a0_0x2caa9e;
    (console.log("START GAME reçu du serveur"),
      (gameStarted = !![]),
      waitingText.classList.add("hidden"));
  }),
  socket.on("victory", (_0x4c69bd) => {
    const _0x57fad7 = a0_0x2caa9e;
    audio.victory.play();
    const _0x2b6e06 = document.getElementById("victory"),
      _0x4ddb13 = document.getElementById("winnerText");
    (_0x4c69bd.id === myId
      ? (_0x4ddb13.textContent = "Tu as gagné ! 🎉")
      : (_0x4ddb13.textContent = _0x4c69bd.name + " a gagné !"),
      _0x2b6e06.classList.remove("hidden"),
      setTimeout(() => {
        const _0x34b002 = _0x57fad7;
        if (_0x2b6e06) _0x2b6e06.classList.add("hidden");
        (Object.keys(players).length < 0x2
          ? ((lobby.style.display = "block"),
            waitingText.classList.remove("hidden"))
          : ((lobby.style.display = "none"),
            waitingText.classList.add("hidden")),
          (gameStarted = ![]));
      }, 0x1388));
  }),
  socket.on("reset", () => {
    const _0x32299a = a0_0x2caa9e;
    (console.log("RESET reçu du serveur"), (gameStarted = ![]));
    const _0x1b3ff8 = document.getElementById("victory");
    if (_0x1b3ff8) _0x1b3ff8.classList.add("hidden");
    questionBox.classList.add("hidden");
  }),
  (joinBtn.onclick = () => {
    const _0x4584b5 = a0_0x2caa9e;
    ((nickname = nicknameInput.value.trim() || "Player"),
      socket.emit("join", nickname),
      questionBox.classList.add("hidden"),
      (lobby.style.display = "none"),
      waitingText.classList.add("hidden"),
      (gameStarted = ![]));
  }));
function createChest() {
  const _0x589b97 = a0_0x2caa9e,
    _0x375e82 = new a0_0x1dc23f["Group"](),
    _0x44deb3 = new a0_0x1dc23f.Mesh(
      new a0_0x1dc23f["BoxGeometry"](0x1, 0.6, 0x1),
      new a0_0x1dc23f["MeshStandardMaterial"]({ color: 0x8b4513 }),
    ),
    _0x48bb1b = new a0_0x1dc23f["Mesh"](
      new a0_0x1dc23f["BoxGeometry"](0x1, 0.3, 0x1),
      new a0_0x1dc23f["MeshStandardMaterial"]({ color: 0xa0522d }),
    );
  return (
    (_0x48bb1b.position.y = 0.45),
    (_0x48bb1b.userData.open = 0x0),
    _0x375e82.add(_0x44deb3),
    _0x375e82.add(_0x48bb1b),
    (_0x375e82.userData.lid = _0x48bb1b),
    _0x375e82
  );
}

let camAngle = 0x0,
  camDistance = 0x6;
function updateCamera() {
  const _0x1798f1 = a0_0x2caa9e,
    _0x1b52fa = players[myId];
  if (!_0x1b52fa) return;
  const _0x535f64 = Math.sin(camAngle) * camDistance,
    _0x15c543 = Math.cos(camAngle) * camDistance;
  (camera.position.set(
    _0x1b52fa.position.x + _0x535f64,
    0x4,
    _0x1b52fa.position.z + _0x15c543,
  ),
    camera.lookAt(_0x1b52fa.position));
}
window.addEventListener("keydown", (_0x10f223) => {
  const _0x2d3f3c = a0_0x2caa9e;
  if (_0x10f223.key === "ArrowLeft") camAngle += 0.08;
  if (_0x10f223.key === "ArrowRight") camAngle -= 0.08;
});
let dragging = ![],
  lastX = 0x0;
(window.addEventListener("pointerdown", (_0x54a019) => {
  const _0x49aed2 = a0_0x2caa9e;
  if (joyActive) return;
  if (_0x54a019.target.id === "joystick" || _0x54a019.target.id === "stick")
    return;
  ((dragging = !![]), (lastX = _0x54a019.clientX));
}),
  window.addEventListener("pointermove", (_0x730cd5) => {
    const _0x242519 = a0_0x2caa9e;
    if (!dragging || joyActive) return;
    ((camAngle -= (_0x730cd5.clientX - lastX) * 0.005),
      (lastX = _0x730cd5.clientX));
  }),
  window.addEventListener("pointerup", () => (dragging = ![])));
const joy = document.getElementById("joystick"),
  stick = document.getElementById("stick");
(joy.addEventListener("pointerdown", (_0x358e11) => {
  const _0x444db9 = a0_0x2caa9e;
  ((joyActive = !![]), joy.setPointerCapture(_0x358e11.pointerId));
}),
  joy.addEventListener("pointermove", (_0x1683f0) => {
    const _0x269d75 = a0_0x2caa9e;
    if (!joyActive) return;
    const _0x54b9a9 = joy.getBoundingClientRect(),
      _0x9140ba = _0x54b9a9.left + _0x54b9a9.width / 0x2,
      _0x1aa007 = _0x54b9a9.top + _0x54b9a9.height / 0x2;
    let _0x24eacb = _0x1683f0.clientX - _0x9140ba,
      _0x5a5419 = _0x1683f0.clientY - _0x1aa007;
    const _0x278c38 = 0x32,
      _0x1c9ada = Math.hypot(_0x24eacb, _0x5a5419);
    (_0x1c9ada > _0x278c38 &&
      ((_0x24eacb *= _0x278c38 / _0x1c9ada),
      (_0x5a5419 *= _0x278c38 / _0x1c9ada)),
      (stick.style.left = _0x24eacb + 0x23 + "px"),
      (stick.style.top = _0x5a5419 + 0x23 + "px"),
      (joyVec.x = _0x24eacb / _0x278c38),
      (joyVec.y = _0x5a5419 / _0x278c38));
  }),
  joy.addEventListener("pointerup", () => {
    const _0x160df2 = a0_0x2caa9e;
    ((joyActive = ![]),
      (joyVec = { x: 0x0, y: 0x0 }),
      (stick.style.left = "35px"),
      (stick.style.top = "35px"));
  }));
function sendMovement() {
  const _0x1ab201 = a0_0x2caa9e,
    _0x5955c1 = players[myId];
  if (!_0x5955c1) return;
  const _0x197c10 = performance.now();
  if (_0x197c10 - lastMoveSent < 0x1e) return;
  lastMoveSent = _0x197c10;
  const _0x1dbbcc = new a0_0x1dc23f.Vector3();
  (camera.getWorldDirection(_0x1dbbcc),
    (_0x1dbbcc.y = 0x0),
    _0x1dbbcc.normalize());
  const _0x5b7654 = new a0_0x1dc23f["Vector3"]()
    .crossVectors(_0x1dbbcc, new a0_0x1dc23f["Vector3"](0x0, 0x1, 0x0))
    .normalize();
  let _0x5022ee = _0x1dbbcc.x * -joyVec.y + _0x5b7654.x * joyVec.x,
    _0x4cf260 = _0x1dbbcc.z * -joyVec.y + _0x5b7654.z * joyVec.x;
  const _0x3ea6d3 = Math.hypot(_0x5022ee, _0x4cf260);
  if (_0x3ea6d3 > 0.01) {
    ((_0x5022ee /= _0x3ea6d3), (_0x4cf260 /= _0x3ea6d3));
    const _0x5143ef = Math.atan2(_0x5022ee, _0x4cf260);
    ((_0x5955c1.rotation.y = _0x5143ef),
      socket.emit("move", {
        dx: _0x5022ee,
        dz: _0x4cf260,
        rot: _0x5143ef,
        moving: !![],
      }));
  } else
    socket.emit("move", {
      dx: 0x0,
      dz: 0x0,
      rot: _0x5955c1.rotation.y,
      moving: ![],
    });
}
function animatePlayers(_0x3383b6) {
  const _0x58c845 = a0_0x2caa9e;
  Object.values(players).forEach((_0x4d8c50) => {
    const _0x5bfbb0 = _0x58c845;
    if (!_0x4d8c50.userData.moving) {
      ((_0x4d8c50.userData.armL.rotation.x = 0x0),
        (_0x4d8c50.userData.armR.rotation.x = 0x0),
        (_0x4d8c50.userData.legL.rotation.x = 0x0),
        (_0x4d8c50.userData.legR.rotation.x = 0x0));
      return;
    }
    _0x4d8c50.userData.walkTime += _0x3383b6 * 0x6;
    const _0x106474 = Math.sin(_0x4d8c50.userData.walkTime);
    ((_0x4d8c50.userData.armL.rotation.x = _0x106474),
      (_0x4d8c50.userData.armR.rotation.x = -_0x106474),
      (_0x4d8c50.userData.legL.rotation.x = -_0x106474),
      (_0x4d8c50.userData.legR.rotation.x = _0x106474));
  });
}
const chunks = {},
  CHUNK = 0x10,
  RADIUS = 0x4,
  grassMaterial = new a0_0x1dc23f["MeshStandardMaterial"]({ color: 0x55aa55 }),
  cubeGeometry = new a0_0x1dc23f["BoxGeometry"](0x1, 0x1, 0x1);
const chunkDummy = new a0_0x1dc23f.Object3D();
function makeChunk(cx, cz) {
  const key = cx + "," + cz;
  if (chunks[key]) return;
  const mesh = new a0_0x1dc23f.InstancedMesh(cubeGeometry, grassMaterial, CHUNK * CHUNK);
  let n = 0;
  for (let i = 0; i < CHUNK; i++) {
    for (let j = 0; j < CHUNK; j++) {
      const h = Math.max(
        0,
        Math.floor(
          Math.sin((cx * CHUNK + i) * 0.2) * 2 + Math.cos((cz * CHUNK + j) * 0.2) * 2,
        ),
      );
      chunkDummy.position.set(cx * CHUNK + i, h / 2, cz * CHUNK + j);
      chunkDummy.scale.set(1, h + 1, 1);
      chunkDummy.updateMatrix();
      mesh.setMatrixAt(n++, chunkDummy.matrix);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  scene.add(mesh);
  chunks[key] = mesh;
}
let lastChunkX = null,
  lastChunkZ = null;
function updateChunks() {
  const _0x1f0f7c = a0_0x2caa9e,
    _0xea0ac8 = players[myId];
  if (!_0xea0ac8) return;
  const _0x4632c8 = Math.floor(_0xea0ac8.position.x / CHUNK),
    _0x1cf8df = Math.floor(_0xea0ac8.position.z / CHUNK);
  if (_0x4632c8 === lastChunkX && _0x1cf8df === lastChunkZ) return;
  ((lastChunkX = _0x4632c8), (lastChunkZ = _0x1cf8df));
  for (let _0x2cafb3 = -RADIUS; _0x2cafb3 <= RADIUS; _0x2cafb3++) {
    for (let _0x528d4d = -RADIUS; _0x528d4d <= RADIUS; _0x528d4d++) {
      makeChunk(_0x4632c8 + _0x2cafb3, _0x1cf8df + _0x528d4d);
    }
  }
  cleanupChunks(_0x4632c8, _0x1cf8df);
}
function cleanupChunks(_0x3f6ded, _0x77507) {
  const _0x23036a = a0_0x2caa9e;
  for (const _0x5862c5 in chunks) {
    const [_0x4e2e04, _0x3d876d] = _0x5862c5.split(",").map(Number),
      _0x341637 = Math.max(
        Math.abs(_0x4e2e04 - _0x3f6ded),
        Math.abs(_0x3d876d - _0x77507),
      );
    _0x341637 > RADIUS + 0x2 &&
      (scene.remove(chunks[_0x5862c5]), chunks[_0x5862c5].dispose(), delete chunks[_0x5862c5]);
  }
}
function smoothPlayers(dt) {
  const k = 1 - Math.exp(-Math.min(dt, 0.1) * 18);
  for (const id in players) {
    const p = players[id], u = p.userData;
    if (u.tx === undefined) continue;
    const dx = u.tx - p.position.x, dz = u.tz - p.position.z;
    if (dx * dx + dz * dz > 25) {
      p.position.x = u.tx;
      p.position.z = u.tz;
    } else {
      p.position.x += dx * k;
      p.position.z += dz * k;
    }
    let dr = u.trot - p.rotation.y;
    dr = Math.atan2(Math.sin(dr), Math.cos(dr));
    p.rotation.y += dr * k;
  }
}
let last = performance.now();
function loop() {
  const _0x1b6595 = a0_0x2caa9e,
    _0xd79662 = performance.now(),
    _0x4433fb = (_0xd79662 - last) / 0x3e8;
  ((last = _0xd79662),
    sendMovement(),
    smoothPlayers(_0x4433fb),
    animatePlayers(_0x4433fb),
    updateCamera(),
    updateChunks());
  for (const _0x55e704 in treasures) {
    const _0x20161c = treasures[_0x55e704];
    if (!_0x20161c.opening) continue;
    const _0xb8fece = _0x20161c.mesh.userData.lid;
    ((_0xb8fece.rotation.x -= 0.05),
      _0xb8fece.rotation.x < -Math.PI / 0x2 &&
        (scene.remove(_0x20161c.mesh), delete treasures[_0x55e704]));
  }
  (renderer.render(scene, camera), requestAnimationFrame(loop));
}

(loop(),
  window.addEventListener("resize", () => {
    const _0x9d0002 = a0_0x2caa9e;
    ((camera.aspect = window.innerWidth / window.innerHeight),
      camera.updateProjectionMatrix(),
      renderer.setSize(window.innerWidth, window.innerHeight));
  }));
