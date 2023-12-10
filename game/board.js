import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as CANNON from "cannon-es";
import CannonUtils from "CannonUtils";
import { clamp } from "three/src/math/MathUtils";

export class Board {
  constructor(scene, world, texture) {
    this.scene = scene;
    this.world = world;
    this.texture = texture;
    this.textureLoader = new THREE.TextureLoader();
    this.boardMesh = null;
    this.boardBody = null;
    this.boardLoaded = false;
    this.targetRotation = null;
    this.loadBoard();
  }

  loadBoard() {
    const objLoader = new OBJLoader();
    objLoader.load(
      "../game/assets/models/MarbleLabyrinth.obj",
      (object) => {
        this.scene.add(object);
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
    const woodTexture = this.textureLoader.load(this.texture);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(0.0625, 0.0625);
    woodTexture.offset.set(0.5, 0.5);

    const woodMaterial = new THREE.MeshStandardMaterial({ map: woodTexture });
    this.boardMesh.material = woodMaterial;
    this.boardMesh.castShadow = true;
    this.boardMesh.receiveShadow = true;
  }

  setupBoardPhysics() {
    const boardShape = CannonUtils.CreateTrimesh(this.boardMesh.geometry);
    this.boardBody = new CANNON.Body({ mass: 0 });
    this.boardBody.addShape(boardShape);
    this.boardBody.position.copy(this.boardMesh.position);
    this.world.addBody(this.boardBody);
    this.targetRotation = this.boardBody.quaternion.clone();
  }

  update() {
    if (this.boardLoaded) {
      this.boardBody.quaternion.copy(this.targetRotation);
      this.boardMesh.position.copy(this.boardBody.position);
      this.boardMesh.quaternion.copy(this.boardBody.quaternion);
    }
  }

  rotate(dx, dy) {
    dx = clamp(dx, -0.2, 0.2);
    dy = clamp(dy, -0.2, 0.2);
    if (this.boardLoaded) {
      this.targetRotation = new THREE.Quaternion(-dy, dx, 0, 1).normalize();
      console.log(this.targetRotation);
    }
  }
}
