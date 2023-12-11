import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import * as CANNON from "cannon-es";
import { Sphere } from "../game/marble.js";
import { Board } from "../game/board.js";
import { Lights } from "../game/lights.js";
import { Menu } from "../game/menu.js";
import { clamp } from "three/src/math/MathUtils";

class Game {
  constructor() {
    this.gravityStrength = 200.0;
    this.numSteps = 10;
    this.modifyShadows = true;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(5));

    // Camera
    this.aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 840);
    
    
    // Renderer
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
  }

  transition(menu){
    this.menu = menu;
    this.inGame = true;
    this.camera.position.set(0, 0, 120);
    this.camera.lookAt(0, 0, 0);
    this.removeMenu = true;
    this.loadObjects(
      "../game/assets/rusted-metal-normal.jpg",
      "../game/assets/metal-texture.jpg",
      true
    );
  }

  addGlowingObjects() {
    const numberOfObjects = 100;
    this.glowingObjectsY = [];
    this.glowingObjectsZ = [];

    for (let i = 0; i < numberOfObjects; i++) {
      const size = Math.random() * 2 + 1;
      const geometryY = new THREE.BoxGeometry(size / 2, size * 80, size / 2);
      const geometryZ = new THREE.BoxGeometry(size / 2, size / 2, size * 80);

      const color = new THREE.Color(Math.random(), Math.random(), Math.random());
      const material = new THREE.MeshPhongMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 1,
          shininess: 100
      });
      const mesh = new THREE.Mesh(geometryY, material);
      mesh.position.set(Math.random() * window.innerWidth - window.innerWidth / 2.1,
                        Math.random() * 1000 , -80);

      this.scene.add(mesh);
      this.glowingObjectsY.push(mesh);
      const duplicate =  new THREE.Mesh(geometryZ, material);
      duplicate.position.set(Math.random() * window.innerWidth - window.innerWidth / 2.1,
                        600, Math.random() * 1000 , -80);
      this.scene.add(duplicate);
      this.glowingObjectsZ.push(duplicate);
    }
  }

  loadObjects(sNormal, sTexture, use_tx = false) {

    this.board = new Board(
      this.scene,
      this.world,
      "../game/assets/models/marbleLabyrinth.obj",
      "../game/assets/wood_texture.jpeg",
      "../game/assets/wood-normal.jpg"
    );
    
    this.sphere = new Sphere(
      this.scene,
      this.world,
      sNormal,
      sTexture,
      use_tx
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
    if (this.modifyShadows) {
      this.lights.rotateLights(dx, dy);
    }
    this.world.gravity.set(gravityX, gravityY, this.world.gravity.z);
  }

  rotateCamera(dx, dy) {
    let radius = 40;
    this.camera.position.set(
      -radius * dx ,
      -radius * dy ,
      this.camera.position.z
    );
    if(!this.inGame){
      this.camera.position.y -= 200;
    } else {
      this.camera.lookAt(0, 0, 0);
    }
  }
  updateGlowingObjects() {
    const speed = 0.8; 
    this.glowingObjectsY.forEach(obj => {
      obj.position.y -= speed;
      if (obj.position.y < -100) {
        obj.position.y = 900;
      }
    });
    if(!this.inGame){
      this.glowingObjectsZ.forEach(obj => {
        obj.position.z -= speed;
        if (obj.position.z < -100) {
          obj.position.z = 900;
        }
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.world.step(Math.min(this.clock.getDelta(), 0.1));
    if(this.inGame){
      this.board.update();
      this.sphere.update();
    }
    if(this.removeMenu){
      this.menu.removeObjects();
      this.removeMenu = false;
    }
    this.updateGlowingObjects();
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
  }

  start() {
    this.clock = new THREE.Clock();
    this.animate();
  }
}


const game = new Game();
const menu = new Menu(game.scene, game.world, game.camera, game.inGame);

game.transition(menu);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    game.start();
  }, 100);
});
