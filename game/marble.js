import * as THREE from "three";
import * as CANNON from "cannon-es";

let spawnX = -1;
let spawnY = 65;
let spawnZ = 2;

export class Sphere {
  constructor(scene, world, normal, texture, radius, use_tx = false, spawnPos) {
    // Texture
    this.use_tx = use_tx;
    this.size = radius;
    let sphereGeometry = null;
    if (!this.use_tx) {
      spawnX = spawnPos.x;
      spawnY = spawnPos.y;
      spawnZ = spawnPos.z;
      this.pointLight = new THREE.PointLight(normal, 20, 60);
      this.pointLight.castShadow = true;
      this.pointLight.position.set(spawnX, spawnY, spawnZ);
      scene.add(this.pointLight);
      sphereGeometry = new THREE.SphereGeometry(this.size, 16, 12);
    } else {
      // Sphere Geometry
      sphereGeometry = new THREE.SphereGeometry(this.size, 16, 12);
    }
    this.mesh = new THREE.Mesh(
      sphereGeometry,
      this.addTexture(normal, texture)
    );
    this.mesh.position.set(spawnX, spawnY, spawnZ);
    if (this.use_tx) {
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
    }
    this.mesh.scale.set(1, 1, 1);
    scene.add(this.mesh);

    // Physics
    const sphereShape = new CANNON.Sphere(this.size - 0.3);
    this.body = new CANNON.Body({ mass: 1 });
    this.body.addShape(sphereShape);
    this.body.position.copy(this.mesh.position);
    world.addBody(this.body);
  }

  update() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    if (!this.use_tx) {
      this.pointLight.position.copy(this.mesh.position);
    }
    this.doOnTick();
  }

  addTexture(normal, texture) {
    if (this.use_tx) {
      // Sphere Material
      const textureLoader = new THREE.TextureLoader();
      const metalNormal = textureLoader.load(normal);
      const metalTexture = textureLoader.load(texture);
      this.sphereMaterial = new THREE.MeshStandardMaterial({
        map: metalTexture,
        normalMap: metalNormal,
        normalScale: new THREE.Vector2(3, 3),
        roughness: 0.4,
        metalness: 0.8,
      });
      return this.sphereMaterial;
    } else {
      this.sphereMaterial = new THREE.MeshPhongMaterial({
        color: normal,
        emissive: normal,
        emissiveIntensity: 2,
      });
      return this.sphereMaterial;
    }
  }

  resetPosition() {
    this.body.position.set(spawnX, spawnY, spawnZ);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.quaternion.set(0, 0, 0, 1);
    this.body.__dirtyPosition = true;
  }

  doOnTick() {
    if (this.body.position.z < -100) {
      this.resetPosition();
    }
  }
}
