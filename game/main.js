import * as THREE from "three";
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from "three/examples/jsm/libs/stats.module";
import * as CANNON from "cannon-es";
import { Sphere } from "../game/marble.js";
import { Board } from "../game/board.js";
import { Lights } from "../game/lights.js";

class Game {
  constructor() {
    this.gravityStrength = 1600.0;
    this.numSteps = 15;

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
    this.world.solver.iterations = 60;
    this.world.gravity.set(0, 0, -200);

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
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    if (!event.buttons) return;
    const gravityX =
      (event.clientX / window.innerWidth - 0.5) * this.gravityStrength;
    const gravityY =
      -(event.clientY / window.innerHeight - 0.5) * this.gravityStrength;
    this.world.gravity.set(0, 0, -260);
    this.board.rotate(
      event.clientX / window.innerWidth - 0.5,
      -(event.clientY / window.innerHeight - 0.5)
    );
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    // this.world.step(Math.min(this.clock.getDelta(), 0.1));
    // this.board.update();
    // this.sphere.update();
    let timeDiff = this.clock.getDelta();
    for (let i = 0; i < this.numSteps; i++) {
      this.board.update();
      this.sphere.update();
      this.world.step(Math.min(timeDiff / this.numSteps, 0.1));
    }
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
