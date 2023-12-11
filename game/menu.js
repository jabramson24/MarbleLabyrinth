import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as CANNON from "cannon-es";
import CannonUtils from "CannonUtils";


export class Menu {
  constructor(scene, world, camera) {
    this.scene = scene;
    this.world = world;
    this.camera = camera;
    this.board = "../game/assets/models/box.obj";
    this.texturePath = "../game/assets/glass.png";
    this.normalPath = "../game/assets/glass-normal.jpg";
    this.textureLoader = new THREE.TextureLoader();
    this.boardObject = null;
    this.boardMesh = null;
    this.boardBody = null;
    this.boardLoaded = false;
    // camera arrangment
    this.camera.position.set(0, -200, 300);
    this.camera.rotation.x += Math.PI / 3;

    // menu light
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(0, 200, 800);
    this.light.castShadow = true;
    this.scene.add(this.light);

    this.loadBoard();
  }

  loadBoard() {
    const objLoader = new OBJLoader();
    objLoader.load(
      this.board,
      (object) => {
        object.position.set(0, -100, 230);
        this.scene.add(object);
        this.boardObject = object;
        this.boardMesh = object.children[0];
        this.setupBoardTexture();
        this.setupBoardPhysics();
        this.boardLoaded = true;
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log("An error happened");
      }
    );
  }

  setupBoardTexture() {
    const woodTexture = this.textureLoader.load(this.texturePath);
    const woodNormal = this.textureLoader.load(this.normalPath);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(0.1, 0.1);
    woodTexture.offset.set(0.5, 0.5);
    woodNormal.wrapS = THREE.RepeatWrapping;
    woodNormal.wrapT = THREE.RepeatWrapping;
    woodNormal.repeat.set(1, 1);
    woodNormal.offset.set(0, 0);

    this.woodMaterial = new THREE.MeshPhysicalMaterial({
      map: woodTexture,
      normalMap: woodNormal,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughness: 0.4,
      metalness: 0.4,
      transmission: 0.99,
      emissive: 0x0,
      color: 0xA8ccD7,
      ior: 1.0
    });
    this.boardMesh.material = this.woodMaterial;
    this.boardMesh.castShadow = true;
    this.boardMesh.receiveShadow = true;
  }

  setupBoardPhysics() {
    const boardShape = CannonUtils.CreateTrimesh(this.boardMesh.geometry);
    this.boardBody = new CANNON.Body({ mass: 0 });
    this.boardBody.addShape(boardShape);
    this.boardBody.position.copy(this.boardMesh.position);
    this.world.addBody(this.boardBody);
  }

  removeObjects() {
    this.world.removeBody(this.boardBody);
    this.boardBody = null;
    this.scene.remove(this.boardObject);
   
    this.scene.remove(this.light);
    this.boardObject = null;  
    this.light = null;
    
  }

  update() {
    if (this.boardLoaded) {
      this.boardMesh.position.copy(this.boardBody.position);
      this.boardMesh.quaternion.copy(this.boardBody.quaternion);
    }
  }
}
