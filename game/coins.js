import * as THREE from "three";
import * as CANNON from "cannon-es";


export class Coin {
    constructor(scene, world, number){
        this.scene = scene;
        this.world = world;
        this.number = number;
        this.coinList = [];
        this.generateCoins();
    }

    generateCoins() {
        for (let i = 0; i < 1; i++) {
        const coin = new THREE.OctahedronGeometry(3, 0);
        const color = this.generateVibrantColor();
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1,
            shininess: 100,
        });
        const mesh = new THREE.Mesh(coin, material);
        mesh.position.set(70, -5, 10);
        this.pointLight = new THREE.PointLight(color, 5, 20);
        this.pointLight.castShadow = true;
        this.pointLight.position.set(70, -5, 10);
        this.scene.add(this.pointLight);
        this.scene.add(mesh);
        }
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
}