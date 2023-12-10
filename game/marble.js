import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Sphere {
  constructor(scene, world, textureLoader, spawnX, spawnY, spawnZ) {
    // Sphere Material
    const metalNormal = textureLoader.load("../game/assets/rusted-metal-normal.jpg");
    const metalTexture = textureLoader.load("../game/assets/metal-texture.jpg");
    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: metalTexture,
      normalMap: metalNormal,
      normalScale: new THREE.Vector2(1, 1),
      roughness: 0.3,
      metalness: 1.0,
    });

    // Sphere Geometry
    const sphereGeometry = new THREE.SphereGeometry();
    this.mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.mesh.position.set(spawnX, spawnY, spawnZ);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.scale.set(0.8, 0.8, 0.8);
    scene.add(this.mesh);

    // Physics
    const sphereShape = new CANNON.Sphere(3.5);
    this.body = new CANNON.Body({ mass: 1 });
    this.body.addShape(sphereShape);
    this.body.position.copy(this.mesh.position);
    world.addBody(this.body);
  }

  update() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  resetPosition(x, y, z) {
    this.body.position.set(x, y, z);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.quaternion.set(0, 0, 0, 1);
    this.body.__dirtyPosition = true;
  }
}
