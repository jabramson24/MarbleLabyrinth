  import * as THREE from 'three'
  // import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
  import Stats from 'three/examples/jsm/libs/stats.module'
  import {GUI} from 'dat.gui'
  import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
  import * as CANNON from 'cannon-es'
  import CannonUtils from 'CannonUtils'

  const scene = new THREE.Scene()
  scene.add(new THREE.AxesHelper(5))
  const light1 = new THREE.SpotLight()
  light1.position.set(0, 0, 30)
  light1.angle = Math.PI / 4
  light1.penumbra = 0.5
  light1.castShadow = true
  light1.shadow.mapSize.width = 1024
  light1.shadow.mapSize.height = 1024
  light1.shadow.camera.near = 0.5
  light1.shadow.camera.far = 20
  scene.add(light1)

  const light2 = light1.clone()
  light2.position.x = -40.5
  scene.add(light2)

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 30)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)
  // const controls = new OrbitControls(camera, renderer.domElement)
  // controls.enableDamping = true
  // controls.target.y = 0.5
  const world = new CANNON.World()
  world.gravity.set(0, 0, -100)

  const phongMaterial = new THREE.MeshPhongMaterial()
  const sphereGeometry = new THREE.SphereGeometry()
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0xff0000, 
  });
  let pointLight;

  pointLight = new THREE.PointLight(0xff0000, 1, 20);
  pointLight.position.set(-1, 17, 10);
  scene.add(pointLight);
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphereMesh.position.set(-1, 17, 10)
  sphereMesh.castShadow = true
  scene.add(sphereMesh)
  const sphereShape = new CANNON.Sphere(0.8)
  const sphereBody = new CANNON.Body({mass: 1})
  sphereBody.addShape(sphereShape)
  sphereBody.position.x = sphereMesh.position.x
  sphereBody.position.y = sphereMesh.position.y
  sphereBody.position.z = sphereMesh.position.z
  world.addBody(sphereBody)

  let boardMesh
  let boardBody
  let boardLoaded = false
  const objLoader = new OBJLoader()

  objLoader.load(
    '../game/MarbleLabyrinth.obj',
    (object) => {
      scene.add(object)
      boardMesh = object.children[0]
      boardMesh.material = phongMaterial
      
      boardMesh.position.x = -2
      boardMesh.position.y = 1
      boardMesh.rotation.x = boardMesh.rotation.x * (Math.PI / 2)
      boardMesh.rotation.y = boardMesh.rotation.y * (Math.PI / 2)
      boardMesh.rotation.z = boardMesh.rotation.z * (Math.PI / 2)
      boardMesh.scale.x = boardMesh.scale.x / 4
      boardMesh.scale.y = boardMesh.scale.y / 4
      boardMesh.scale.z = boardMesh.scale.z / 4
      
      const boardShape = CannonUtils.CreateTrimesh(boardMesh.geometry)
      
      boardShape.scale.x = boardShape.scale.x / 4
      boardShape.scale.y = boardShape.scale.y / 4
      boardShape.scale.z = boardShape.scale.z / 4

      boardBody = new CANNON.Body({
        mass: 0
      })
      boardBody.addShape(boardShape)
      
      boardBody.position.x = boardMesh.position.x
      boardBody.position.y = boardMesh.position.y
      boardBody.position.z = boardMesh.position.z

      world.addBody(boardBody)
      boardLoaded = true
    },
    (xhr) => {console.log((xhr.loaded / xhr.total) * 100 + '% loaded')},
    (error) => {console.log('An error happened')}
  )

  window.addEventListener('resize', onWindowResize, false)
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
  }

  const stats = Stats()
  document.body.appendChild(stats.dom)

  // const gui = new GUI()
  // const physicsFolder = gui.addFolder('Physics')
  // physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1)
  // physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1)
  // physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1)
  // physicsFolder.open()

  const clock = new THREE.Clock()
  function updateMesh(mesh, body) {
    mesh.position.set(body.position.x, body.position.y, body.position.z)
    mesh.quaternion.set(body.quaternion.x, body.quaternion.y,
                        body.quaternion.z, body.quaternion.w)
  }

  document.body.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('mousemove', onMouseMove, false);

  function onMouseMove(event) {
      if (!event.buttons) return;
      const gravityX = (event.clientX / window.innerWidth - 0.5) * 20;
      const gravityY = -(event.clientY / window.innerHeight - 0.5) * 20;
      world.gravity.set(gravityX, gravityY, world.gravity.z);
  }

  function animate() {
    requestAnimationFrame(animate)
    // controls.update()
    world.step(Math.min(clock.getDelta(), 0.1))
    updateMesh(sphereMesh, sphereBody)
    if (boardLoaded) {updateMesh(boardMesh, boardBody)}
    pointLight.position.copy(sphereMesh.position);
    render()
    stats.update()
  }

  function render() {renderer.render(scene, camera)}
  animate()
 