import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as CANNON from "cannon-es";
import CannonUtils from "CannonUtils";

export class Board {
  constructor(scene, world, board, texturePath, normalPath) {
    this.scene = scene;
    this.world = world;
    this.board = board;
    this.texturePath = texturePath;
    this.normalPath = normalPath;
    this.textureLoader = new THREE.TextureLoader();
    this.boardMesh = null;
    this.boardBody = null;
    this.woodMaterial = null;
    this.boardLoaded = false;
    this.loadBoard();
  }

  loadBoard() {
    const objLoader = new OBJLoader();
    objLoader.load(
      this.board,
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
    const woodTexture = this.textureLoader.load(this.texturePath);
    const woodNormal = this.textureLoader.load(this.normalPath);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(0.06, 0.06);
    woodTexture.offset.set(0.5, 0.5);
    woodNormal.wrapS = THREE.RepeatWrapping;
    woodNormal.wrapT = THREE.RepeatWrapping;
    woodNormal.repeat.set(1, 1);
    woodNormal.offset.set(0, 0);

    const woodMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      normalMap: woodNormal,
      normalScale: new THREE.Vector2(0.15, 0.15),
      roughness: 0.7,
      metalness: 0.3,
    });
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
  }

  update() {
    if (this.boardLoaded) {
      this.boardMesh.position.copy(this.boardBody.position);
      this.boardMesh.quaternion.copy(this.boardBody.quaternion);
    }
  }
}
