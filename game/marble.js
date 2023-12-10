import * as THREE from "three";
import * as CANNON from "cannon-es";

const spawnX = -1;
const spawnY = 65;
const spawnZ = 40;
const size = 3.5;

export class Sphere {
  constructor(scene, world, normal, texture, use_tx = false) {
    // Texture
    this.use_tx = use_tx;
    if (!use_tx) {
      this.pointLight = new THREE.PointLight(texture, 1, 30);
      this.pointLight.position.set(spawnX, spawnX, spawnX);
      scene.add(this.pointLight);
    }
    // Sphere Geometry
    const sphereGeometry = new THREE.SphereGeometry();
    this.mesh = new THREE.Mesh(
      sphereGeometry,
      this.addTexture(normal, texture, use_tx)
    );
    this.mesh.position.set(spawnX, spawnY, spawnZ);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.scale.set(size, size, size);
    scene.add(this.mesh);

    // Physics
    const sphereShape = new CANNON.Sphere(size - 0.5);
    this.body = new CANNON.Body({ mass: 1 });
    this.body.addShape(sphereShape);
    this.body.position.copy(this.mesh.position);
    world.addBody(this.body);
  }

  update() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    if (!this.use_tx) {
      pointLight.position.copy(sphereMesh.position);
    }
    this.doOnTick();
  }

  addTexture(normal, texture, use_tx) {
    if (use_tx) {
      // Sphere Material
      const textureLoader = new THREE.TextureLoader();
      const metalNormal = textureLoader.load(normal);
      const metalTexture = textureLoader.load(texture);
      this.sphereMaterial = new THREE.MeshStandardMaterial({
        map: metalTexture,
        normalMap: metalNormal,
        normalScale: new THREE.Vector2(1, 1),
        roughness: 0.3,
        metalness: 1.0,
      });
      return this.sphereMaterial;
    } else {
      this.sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
      });
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
