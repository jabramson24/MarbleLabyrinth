import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as CANNON from "cannon-es";
import CannonUtils from "CannonUtils";

export class Menu {
  constructor(scene, world, camera) {
    // Scene, World, Camera, and other initialization setup
    this.scene = scene;
    this.world = world;
    this.camera = camera;
    this.board = "../game/assets/models/box.obj";
    this.texturePath = "../game/assets/glass.png";
    this.normalPath = "../game/assets/glass-normal2.jpg";
    this.textureLoader = new THREE.TextureLoader();
    this.boardObject = null;
    this.textObject = null;
    this.boardMesh = null;
    this.boardBody = null;
    this.boardLoaded = false;

    // Camera arrangment
    this.camera.position.set(0, -220, 330);
    this.camera.rotation.x += Math.PI / 3;

    // Menu light
    this.light = new THREE.DirectionalLight(0xffffff, 2);
    this.light.position.set(0, -100, 250);
    this.light.castShadow = true;
    this.scene.add(this.light);

    // Text Light
    this.textLight = new THREE.DirectionalLight(0xffffff, 1);
    this.textLight.position.set(0, -100, 280);
    this.textLight.castShadow = true;
    this.textLight.lookAt(420, 180, 100);
    this.scene.add(this.textLight);
    this.loadBoard();
  }

  loadBoard() {
    const objLoader = new OBJLoader();
    objLoader.load(
      this.board,
      (object) => {
        this.scene.add(object);
        this.boardObject = object;
        this.boardMesh = object.children[0];
        this.boardMesh.position.set(0, -100, 230);
        this.setupBoardTexture();
        this.setupBoardPhysics();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log("An error happened");
      }
    );

    objLoader.load(
      "../game/assets/models/text.obj",
      (object) => {
        this.scene.add(object);
        this.textObject = object;
        this.boardMesh = object.children;
        for (let i = 0; i < this.boardMesh.length; i++) {
          this.boardMesh[i].rotation.x += Math.PI / 3;
          this.boardMesh[i].position.set(90, 50, 150);
          this.boardMesh[i].scale.set(3.0, 3.0, 3.0);
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log("An error happened");
      }
    );
    this.boardLoaded = true;
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
      normalScale: new THREE.Vector2(2, 2),
      roughness: 0.4,
      metalness: 0.4,
      transmission: 0.9,
      emissive: 0x0,
      color: 0xa8ccd7,
      ior: 1.0,
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
    if (this.boardBody == null) {
      return;
    }
    this.world.removeBody(this.boardBody);
    this.boardBody = null;
    this.scene.remove(this.boardObject);
    this.scene.remove(this.textObject);
    this.scene.remove(this.light);
    this.scene.remove(this.textLight);
    this.boardObject = null;
    this.textObject = null;
    this.light = null;
  }

  update() {
    if (this.boardLoaded) {
      this.boardMesh.position.copy(this.boardBody.position);
      this.boardMesh.quaternion.copy(this.boardBody.quaternion);
    }
  }
}
