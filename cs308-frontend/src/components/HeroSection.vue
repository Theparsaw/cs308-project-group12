<template>
  <div class="relative w-full overflow-hidden rounded-3xl mb-8" style="height: 420px;">
    
    <!-- Three.js canvas renders here -->
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />

    <!-- Text overlay on top of the 3D scene -->
    <div class="absolute inset-0 flex flex-col justify-center px-12 pointer-events-none">
      <p class="text-sm font-semibold text-orange-300 mb-3 tracking-widest uppercase">
        Welcome to CS308 Store
      </p>
      <h1 class="text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
        Discover Premium<br/>Products
      </h1>
      <p class="text-gray-300 text-lg max-w-md">
        Browse our curated collection of top-quality products at unbeatable prices.
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)

let renderer, scene, camera, animationId
const shapes = []
const mouse = { x: 0, y: 0 }

const init = () => {
  const canvas = canvasRef.value
  const width = canvas.clientWidth
  const height = canvas.clientHeight

  // ── Scene ────────────────────────────────────────────────────────────────
  scene = new THREE.Scene()

  // Dark gradient background color
  scene.background = new THREE.Color(0x0f0f1a)

  // ── Camera ───────────────────────────────────────────────────────────────
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
  camera.position.z = 10

  // ── Renderer ─────────────────────────────────────────────────────────────
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)

  // ── Lighting ─────────────────────────────────────────────────────────────
  // Ambient light gives overall brightness
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  // Orange point light from the right — gives warm glow on shapes
  const orangeLight = new THREE.PointLight(0xff6600, 3, 30)
  orangeLight.position.set(6, 4, 5)
  scene.add(orangeLight)

  // Blue/purple point light from the left — gives cool contrast
  const blueLight = new THREE.PointLight(0x4444ff, 2, 30)
  blueLight.position.set(-6, -4, 5)
  scene.add(blueLight)

  // ── Shapes ───────────────────────────────────────────────────────────────
  // Define different geometries for visual variety
  const geometries = [
    new THREE.IcosahedronGeometry(0.8, 0),   // spiky ball
    new THREE.OctahedronGeometry(0.7, 0),     // diamond shape
    new THREE.TetrahedronGeometry(0.7, 0),    // pyramid
    new THREE.IcosahedronGeometry(0.5, 0),
    new THREE.OctahedronGeometry(0.6, 0),
    new THREE.TetrahedronGeometry(0.9, 0),
    new THREE.IcosahedronGeometry(0.4, 0),
    new THREE.OctahedronGeometry(0.8, 0),
  ]

  // Orange/gold color palette to match the store theme
  const colors = [
    0xff6600, // orange
    0xff8c00, // dark orange
    0xffa500, // amber
    0xff4500, // red orange
    0xffb347, // light orange
    0xe85d04, // deep orange
    0xffd700, // gold
    0xff7c43, // salmon orange
  ]

  geometries.forEach((geometry, i) => {
    const material = new THREE.MeshPhongMaterial({
      color: colors[i],
      shininess: 100,
      specular: new THREE.Color(0xffffff),
      transparent: true,
      opacity: 0.85,
      wireframe: i % 3 === 0, // every 3rd shape is wireframe for variety
    })

    const mesh = new THREE.Mesh(geometry, material)

    // Spread shapes randomly across the scene
    mesh.position.set(
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6
    )

    // Random initial rotation
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )

    // Store random speed values for animation
    mesh.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      },
      floatSpeed: Math.random() * 0.001 + 0.0005,
      floatOffset: Math.random() * Math.PI * 2,
    }

    scene.add(mesh)
    shapes.push(mesh)
  })

  // ── Mouse tracking ───────────────────────────────────────────────────────
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)

  // Start animation loop
  animate()
}

// Track mouse position and convert to normalized -1 to 1 range
const onMouseMove = (event) => {
  mouse.x = (event.clientX / window.innerWidth - 0.5) * 2
  mouse.y = -(event.clientY / window.innerHeight - 0.5) * 2
}

// Handle window resize so the canvas stays correct
const onResize = () => {
  if (!canvasRef.value || !renderer || !camera) return
  const width = canvasRef.value.clientWidth
  const height = canvasRef.value.clientHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

// Animation loop — runs every frame
const animate = () => {
  animationId = requestAnimationFrame(animate)

  const time = Date.now() * 0.001

  // Rotate and float each shape
  shapes.forEach((mesh) => {
    const { rotationSpeed, floatSpeed, floatOffset } = mesh.userData

    // Rotate the shape on all axes
    mesh.rotation.x += rotationSpeed.x
    mesh.rotation.y += rotationSpeed.y
    mesh.rotation.z += rotationSpeed.z

    // Gentle floating up and down using a sine wave
    mesh.position.y += Math.sin(time * floatSpeed * 10 + floatOffset) * 0.003
  })

  // Slowly move the camera based on mouse position — gives parallax feel
  camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.03
  camera.position.y += (mouse.y * 1.0 - camera.position.y) * 0.03
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}

// Start everything when the component mounts
onMounted(() => {
  init()
})

// Clean up when the component is destroyed — prevents memory leaks
onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
  shapes.forEach(mesh => {
    mesh.geometry.dispose()
    mesh.material.dispose()
  })
})
</script>