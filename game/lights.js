import * as THREE from "three";

export class Lights {
  constructor(scene) {
    this.scene = scene;
    this.light1Pos = new THREE.Vector3(140, 0, 100);
    this.light2Pos = new THREE.Vector3(-140, 0, 100);
    this.light3Pos = new THREE.Vector3(0, 140, 100);
    this.light4Pos = new THREE.Vector3(0, -140, 100);
    this.setupLights();
  }

  setupLights() {
    this.light1 = new THREE.SpotLight(0x9a9a9a);
    this.light1.intensity = 0.8;
    this.light1.position.copy(this.light1Pos);
    this.light1.angle = Math.PI / 4;
    this.light1.penumbra = 1.0;
    this.light1.shadow.camera.near = 0.1;
    this.light1.shadow.camera.far = 300;
    this.light1.castShadow = true;
    this.scene.add(this.light1);

    this.light2 = this.light1.clone();
    this.light3 = this.light1.clone();
    this.light4 = this.light1.clone();
    this.light2.position.copy(this.light2Pos);
    this.light3.position.copy(this.light3Pos);
    this.light4.position.copy(this.light4Pos);

    this.scene.add(this.light2);
    this.scene.add(this.light3);
    this.scene.add(this.light4);
  }

  rotateLights(dx, dy) {
    let radius = 20;
    let displacement = new THREE.Vector3(-radius * dx, -radius * dy, 0);
    this.light1.position.copy(this.light1Pos.clone().add(displacement));
    this.light2.position.copy(this.light2Pos.clone().add(displacement));
    this.light3.position.copy(this.light3Pos.clone().add(displacement));
    this.light4.position.copy(this.light4Pos.clone().add(displacement));
    console.log(this.light1Pos);
  }
}
