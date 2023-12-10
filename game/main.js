import * as THREE from "three";
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from "three/examples/jsm/libs/stats.module";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as CANNON from "cannon-es";
import CannonUtils from "CannonUtils";

const gravityStrength = 50.0;
const spawnX = -1;
const spawnY = 65;
const spawnZ = 10;

const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
scene.add(new THREE.AxesHelper(5));
const light1 = new THREE.SpotLight(0x9a9a9a);
light1.intensity = 0.8;
light1.position.set(140, 0, 100);
light1.angle = Math.PI / 4;
light1.penumbra = 1.0;
light1.shadow.camera.near = 0.1;
light1.shadow.camera.far = 300;
light1.castShadow = true;
scene.add(light1);

const light2 = light1.clone();
const light3 = light1.clone();
const light4 = light1.clone();
light2.position.x = -140;
light3.position.set(0, 140, 100);
light4. position.set(0,-140, 100);

scene.add(light2);
scene.add(light3);
scene.add(light4);

const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
camera.position.set(0, 0, 120);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const world = new CANNON.World();
world.gravity.set(0, 0, -100);

const sphereGeometry = new THREE.SphereGeometry();
///////// ADD MARBLE TEXTURE + SELF-SHADOWING /////////
const metalNormal = textureLoader.load("../game/assets/rusted-metal-normal.jpg");
const metalTexture = textureLoader.load("../game/assets/metal-texture.jpg");
const sphereMaterial = new THREE.MeshStandardMaterial({
  map: metalTexture,
  normalMap: metalNormal,
  normalScale: new THREE.Vector2(1, 1), // Adjust the normal map scale
  roughness: 0.3,
  metalness: 1
});
//////////////////////////////////////////////////////

let pointLight;

// pointLight = new THREE.PointLight(0xff0000, 4, 40);
// pointLight.position.set(spawnX, spawnY, spawnZ);
// pointLight.castShadow = true;
// scene.add(pointLight);
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.position.set(spawnX, spawnY, spawnZ);
sphereMesh.castShadow = true;
sphereMesh.receiveShadow = true;
scene.add(sphereMesh);
const sphereShape = new CANNON.Sphere(3.5);
const sphereBody = new CANNON.Body({ mass: 1 });
sphereMesh.scale.set(3.5, 3.5, 3.5); // set mesh scale to body's radius

sphereBody.addShape(sphereShape);
let pos = sphereMesh.position;
sphereBody.position.set(pos.x, pos.y, pos.z);
world.addBody(sphereBody);

let boardMesh;
let boardBody;
let boardLoaded = false;
const objLoader = new OBJLoader();

objLoader.load(
  "../game/assets/models/MarbleLabyrinth.obj",
  (object) => {
    scene.add(object);
    boardMesh = object.children[0];
    ///////// ADD BOARD TEXTURE + SELF-SHADOWING /////////
    const woodTexture = textureLoader.load("../game/assets/wood_texture.jpeg");
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(0.0625, 0.0625);
    woodTexture.offset.set(0.5, 0.5);

    const woodMaterial = new THREE.MeshStandardMaterial({map: woodTexture});
    boardMesh.material = woodMaterial;
    boardMesh.castShadow = true;
    boardMesh.receiveShadow = true;
    
    //////////////////////////////////////////////////////
    boardMesh.position.set(-2, 1);
    boardMesh.castShadow = true;
    const boardShape = CannonUtils.CreateTrimesh(boardMesh.geometry);
    boardShape.castShadow = true;
    boardShape.recieveShadow = true;
    boardBody = new CANNON.Body({mass: 0});
    boardBody.addShape(boardShape);
    let mPos = boardMesh.position;
    boardBody.position.set(mPos.x, mPos.y, mPos.z);
    boardBody.castShadow = true;
    boardBody.receiveShadow = true;

    world.addBody(boardBody);
    boardLoaded = true;
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log("An error happened");
  }
);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

const stats = Stats();
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
function updateMesh(mesh, body) {
  
  let p = body.position;
  let q = body.quaternion;
  mesh.position.set(p.x, p.y, p.z);
  mesh.quaternion.set(q.x, q.y, q.z, q.w);
}

document.body.appendChild(renderer.domElement);
renderer.domElement.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(event) {
  if (!event.buttons) return;
  const gravityX = (event.clientX / window.innerWidth - 0.5) * gravityStrength;
  const gravityY = -(event.clientY / window.innerHeight - 0.5) * gravityStrength;
  world.gravity.set(gravityX, gravityY, world.gravity.z);
}

function doOnTick() {
  if (sphereBody.position.z < -10) {
    sphereBody.position.set(spawnX, spawnY, spawnZ);
    sphereBody.velocity.z = 0;
    // sphereBody.__dirtyPosition = true;
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (boardLoaded) {
    doOnTick();
    world.step(Math.min(clock.getDelta(), 0.1));
    updateMesh(sphereMesh, sphereBody);
    updateMesh(boardMesh, boardBody);
    // pointLight.position.copy(sphereMesh.position);
    renderer.render(scene, camera);
    stats.update();
  }
}

animate();
