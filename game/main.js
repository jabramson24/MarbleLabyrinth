import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import * as CANNON from "cannon-es";
import { Sphere } from "./marble.js";
import { Board } from "./board.js";
import { Lights } from "./lights.js";
import { Menu } from "./menu.js";
import { Coin } from "./coins.js";
import { clamp } from "three/src/math/MathUtils";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

class Game {
  constructor() {
    this.gravityStrength = 300.0;
    this.numSteps = 10;
    this.modifyShadows = true;
    this.mousePosition = new THREE.Vector2();
    this.sphereList = [];
    this.board = null;
    this.sphere = null;
    this.sphereRadiusMenu = 8;
    this.sphereRadiusGame = 3.5;
    this.darkMode = false;
    this.shouldAnimate = true;
    // Scene
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(5));

    // Camera
    this.aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 840);
    this.targetX = 0;
    this.targetY = 0;

    // Renderer
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.width = 4096;
    this.renderer.shadowMap.height = 20;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Physics World
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -this.gravityStrength * 1.5);

    // Stats
    this.stats = Stats();
    this.addEventListeners();
    this.inGame = false;
    this.removeMenu = false;
    this.menu = null;

    // Append to DOM
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(this.stats.dom);
    this.addGlowingObjects();

    // Sounds
    const listener = new THREE.AudioListener();
    this.camera.add(listener);
    const sound = new THREE.Audio(listener);
    this.isPlaying = false;

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('game/assets/sound/song.mp3', function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });
    this.audioContext = listener.context;
  }

  transition(menu) {
    var pressSpaceDiv = document.getElementById("pressSpace");
    var starter = document.getElementById("middleRightDiv");
    var toggleContainer = document.getElementById("toggleContainer");
    starter.style.display = "none";
    pressSpaceDiv.style.display = "none";
    toggleContainer.style.display = "none";
    var marbleButton = document.getElementById("toggleButton2");
    if (
      marbleButton.textContent === "Illuminated" ||
      marbleButton.innerText === "Illuminated"
    ) {
      this.loadObjects(
        this.generateVibrantColor(),
        'game/assets/metal-texture.jpg',
        this.sphereRadiusGame,
        false
      );
    } else {
      this.loadObjects(
        'game/assets/rusted-metal-normal.jpg',
        'game/assets/metal-texture.jpg',
        this.sphereRadiusGame,
        true
      );
    }
    this.targetX = 0;
    this.targetY = 0;
    this.shouldAnimate = false;
    setTimeout(() => {
      this.menu = menu;
      this.inGame = true;
      this.camera.position.set(0, -500, 120);
      this.camera.lookAt(0, 0, 0);

      this.removeMenu = true;
      this.menu.removeObjects();
      for (let i = 0; i < this.sphereList.length; i++) {
        this.scene.remove(this.sphereList[i]);
        this.scene.remove(this.sphereList[i].mesh);
        this.scene.remove(this.sphereList[i].pointLight);
        this.world.removeBody(this.sphereList[i].body);
      }

      this.sphere.resetPosition();
      this.shouldAnimate = true;
    }, 400);
  }

  generateVibrantColor() {
    const hue = Math.random() * 360;
    const saturation = 80 + Math.random() * 20;
    const lightness = 30 + Math.random() * 20;
    const vibrantColor = new THREE.Color(
      `hsl(${hue}, ${saturation}%, ${lightness}%)`
    );
    return vibrantColor;
  }

  addGlowingObjects() {
    const numberOfObjects = 50;
    this.glowingObjectsY = [];
    this.glowingObjectsZ = [];

    for (let i = 0; i < numberOfObjects; i++) {
      const size = Math.random() * 5 + 2;
      const geometryY = new THREE.BoxGeometry(size, size * 80, size / 2);
      const geometryZ = new THREE.BoxGeometry(size, size / 2, size * 80);
      const color = this.generateVibrantColor();
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1,
        shininess: 100,
      });
      const mesh = new THREE.Mesh(geometryY, material);
      const boarder = window.innerWidth - window.innerHeight;
      mesh.position.set(
        Math.random() * (boarder * 1.2) - boarder / 1.6,
        Math.random() * 1000,
        -80
      );

      this.scene.add(mesh);
      this.glowingObjectsY.push(mesh);
      const duplicate = new THREE.Mesh(geometryZ, material);

      duplicate.position.set(
        Math.random() * (boarder * 1.2) - boarder / 1.6,
        600,
        Math.random() * 1000,
        -80
      );
      this.scene.add(duplicate);
      this.glowingObjectsZ.push(duplicate);
    }
  }

  loadObjects(sNormal, sTexture, sphereRadius, use_tx = false) {
    this.board = new Board(
      this.scene,
      this.world,
      'game/assets/models/MarbleLabyrinth.obj',
      'game/assets/wood_texture.jpeg',
      'game/assets/wood-normal.jpg'
    );

    this.sphere = new Sphere(
      this.scene,
      this.world,
      sNormal,
      sTexture,
      sphereRadius,
      use_tx,
      new THREE.Vector3(-1, 65, 10)
    );

    var darkModeButton = document.getElementById("toggleButton3");
    var marbleButton = document.getElementById("toggleButton2");

    if (
      !(
        (darkModeButton.textContent === "On" ||
          darkModeButton.innerText === "On") &&
        (marbleButton.textContent === "Illuminated" ||
          marbleButton.innerText === "Illuminated")
      )
    ) {
      this.lights = new Lights(this.scene);
    }
  }

  generateSphere() {
    if (this.sphereList.length < 11) {
      const random = Math.floor(Math.random() * 141) - 70;
      const sphere = new Sphere(
        this.scene,
        this.world,
        this.generateVibrantColor(),
        null,
        this.sphereRadiusMenu,
        false,
        new THREE.Vector3(random, random - 100, 280)
      );
      this.sphereList.push(sphere);
    }
  }

  addEventListeners() {
    window.addEventListener("resize", () => this.onWindowResize(), false);
    this.renderer.domElement.addEventListener(
      "mousemove",
      (event) => this.onMouseMove(event),
      false
    );
    this.renderer.domElement.addEventListener(
      "mousedown",
      (event) => this.onMouseMove(event),
      false
    );
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.generateSphere();
      }
      if (event.key === "r") {
        this.resetSphere();
      }
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    if (this.inGame) {
      if (!event.buttons) return;
    } else {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
    }
    let dx = event.clientX / window.innerWidth - 0.5;
    let dy = -(event.clientY / window.innerHeight - 0.5);
    dx = clamp(dx, -0.4, 0.4);
    dy = clamp(dy, -0.4, 0.4);
    this.targetX = dx;
    this.targetY = dy;
    const gravityX = dx * this.gravityStrength;
    const gravityY = dy * this.gravityStrength;
    this.world.gravity.set(gravityX, gravityY, this.world.gravity.z);
  }

  getCameraRatio() {
    if (this.inGame) {
      let radius = 40;
      return new THREE.Vector2(
        this.camera.position.x / -radius,
        this.camera.position.y / -radius
      );
    } else {
      let radius = 40;
      return new THREE.Vector2(
        this.camera.position.x / -radius,
        (this.camera.position.y + 225) / -radius
      );
    }
  }

  rotateCamera(dx, dy) {
    let radius = 40;
    this.camera.position.set(
      -radius * dx,
      -radius * dy,
      this.camera.position.z
    );
    if (!this.inGame) {
      this.camera.position.y -= 225;
      this.camera.lookAt(radius * dx * 5, 200, radius * dy * 5);
    } else {
      this.camera.lookAt(0, 0, 0);
    }
  }

  resetSphere() {
    if (this.inGame) {
      this.sphere.resetPosition();
    } else {
      for (let i = 0; i < this.sphereList.length; i++) {
        this.scene.remove(this.sphereList[i]);
        this.scene.remove(this.sphereList[i].mesh);
        this.scene.remove(this.sphereList[i].pointLight);
        this.world.removeBody(this.sphereList[i].body);
      }
      this.sphereList = [];
    }
  }

  updateGlowingObjects() {
    const speed = 0.8;
    this.glowingObjectsY.forEach((obj) => {
      obj.position.y -= speed;
      if (obj.position.y < -250) {
        obj.position.y = 900;
      }
    });
    if (!this.inGame) {
      this.glowingObjectsZ.forEach((obj) => {
        obj.position.z += speed;
        if (obj.position.z > 900) {
          obj.position.z = -250;
        }
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.shouldAnimate) {
      this.world.step(Math.min(this.clock.getDelta(), 0.1));
      if (this.inGame) {
        this.board.update();
        this.sphere.update();
        let ratio = 15.0 * this.clock.getDelta();
        let camCurrentRatios = this.getCameraRatio();
        let camDiffX = (this.targetX - camCurrentRatios.x) * ratio;
        let camDiffY = (this.targetY - camCurrentRatios.y) * ratio;
        this.rotateCamera(
          camCurrentRatios.x + camDiffX,
          camCurrentRatios.y + camDiffY
        );
        if (this.lights != null) {
          if (this.modifyShadows && this.inGame) {
            this.lights.rotateLights(
              camCurrentRatios.x + camDiffX,
              camCurrentRatios.y + camDiffY
            );
          }
        }
      } else {
        this.sphereList.forEach((sphere) => {
          if (sphere.mesh.position.z < 0) {
            this.scene.remove(sphere.mesh);
            this.scene.remove(sphere.pointLight);
            this.world.removeBody(sphere.body);
            this.sphereList.splice(this.sphereList.indexOf(sphere), 1);
          }
          sphere.update();
        });
        let ratio = 100 * this.clock.getDelta();
        let camCurrentRatios = this.getCameraRatio();
        let camDiffX = (this.targetX - camCurrentRatios.x) * ratio;
        let camDiffY = (this.targetY - camCurrentRatios.y) * ratio;
        this.rotateCamera(
          camCurrentRatios.x + camDiffX,
          camCurrentRatios.y + camDiffY
        );

      }
      if (this.removeMenu) {
        this.menu.removeObjects();
        this.removeMenu = false;
      }
      this.updateGlowingObjects();
      this.renderer.render(this.scene, this.camera);
      this.stats.update();
    }
  }

  start() {
    this.clock = new THREE.Clock();
    this.animate();
  }
}

const game = new Game();
const menu = new Menu(game.scene, game.world, game.camera, game.inGame);
const coin = new Coin(game.scene, game.world, 5);
game.menu = menu;
document
  .getElementById("startButton")
  .addEventListener("click", () => game.transition(menu));

document.getElementById("toggleButton1").addEventListener("click", () => {
  if (game.isPlaying) {
    game.audioContext.suspend();
  } else {
    game.audioContext.resume();
  }
  game.isPlaying = !game.isPlaying;
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    game.start();
  }, 400);
});
