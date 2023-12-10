import * as THREE from "three";
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from "three/examples/jsm/libs/stats.module";
import * as CANNON from "cannon-es";
import { Sphere } from "../game/marble.js";
import { Board } from "../game/board.js";
import { Lights } from "../game/lights.js";
import { clamp } from "three/src/math/MathUtils";

class Game {
  constructor() {
    this.gravityStrength = 200.0;
    this.numSteps = 10;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(5));

    // Camera
    this.aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 1000);
    this.camera.position.set(0, 0, 120);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Physics World
    this.world = new CANNON.World();
    // this.world.solver.iterations = 60;
    this.world.gravity.set(0, 0, -this.gravityStrength * 1.5);

    // Stats
    this.stats = Stats();

    this.loadObjects();
    this.addEventListeners();

    // Append to DOM
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(this.stats.dom);
  }

  loadObjects() {
    const metalNormal = "../game/assets/rusted-metal-normal.jpg";
    const metalTexture = "../game/assets/metal-texture.jpg";
    this.board = new Board(
      this.scene,
      this.world,
      "../game/assets/wood_texture.jpeg"
    );
    this.sphere = new Sphere(
      this.scene,
      this.world,
      metalNormal,
      metalTexture,
      true
    );
    this.lights = new Lights(this.scene);
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
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    if (!event.buttons) return;
    let dx = event.clientX / window.innerWidth - 0.5;
    let dy = -(event.clientY / window.innerHeight - 0.5);
    dx = clamp(dx, -0.4, 0.4);
    dy = clamp(dy, -0.4, 0.4);
    const gravityX = dx * this.gravityStrength;
    const gravityY = dy * this.gravityStrength;
    this.rotateCamera(dx, dy);
    this.world.gravity.set(gravityX, gravityY, this.world.gravity.z);
  }

  rotateCamera(dx, dy) {
    let radius = 40;
    this.camera.position.set(
      -radius * dx,
      -radius * dy,
      this.camera.position.z
    );
    this.camera.lookAt(0, 0, 0);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.world.step(Math.min(this.clock.getDelta(), 0.1));
    this.board.update();
    this.sphere.update();
    // let timeDiff = this.clock.getDelta();
    // for (let i = 0; i < this.numSteps; i++) {
    //   this.world.step(Math.min(timeDiff / this.numSteps, 0.1));
    //   this.board.update(this.sphere);
    //   this.sphere.update();
    // }
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
  }

  start() {
    this.clock = new THREE.Clock();
    this.animate();
  }
}

const game = new Game();
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    game.start();
  }, 100);
});
