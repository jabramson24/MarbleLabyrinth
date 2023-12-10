import * as THREE from "three";

export class Lights {
    constructor(scene) {
        this.scene = scene;
        this.setupLights();
    }

    setupLights() {
        const light1 = new THREE.SpotLight(0x9a9a9a);
        light1.intensity = 0.8;
        light1.position.set(140, 0, 100);
        light1.angle = Math.PI / 4;
        light1.penumbra = 1.0;
        light1.shadow.camera.near = 0.1;
        light1.shadow.camera.far = 300;
        light1.castShadow = true;
        this.scene.add(light1);

        const light2 = light1.clone();
        const light3 = light1.clone();
        const light4 = light1.clone();
        light2.position.x = -140;
        light3.position.set(0, 140, 100);
        light4.position.set(0, -140, 100);

        this.scene.add(light2);
        this.scene.add(light3);
        this.scene.add(light4);
    }
}
