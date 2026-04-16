<template>
  <div
    class="relative w-full overflow-hidden"
    style="height: 100vh; background: #0a0a14;"
  >
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />

    <div class="absolute inset-0 flex flex-col justify-center items-end px-12 pointer-events-none text-right">
      <p class="text-sm font-semibold text-orange-400 mb-3 tracking-widest uppercase">
        Welcome to CS308 Store
      </p>
      <h1 class="text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
        Discover Premium<br />Products
      </h1>
      <p class="text-gray-300 text-lg max-w-md">
        Browse our curated collection of top-quality products at unbeatable prices.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId, ctx, w, h
const particles = []
const mouse = { x: -1000, y: -1000 }

const COUNT = 90
const CONNECT_DIST = 130
const MOUSE_RADIUS = 140

class Particle {
  constructor() {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 0.6
    this.vy = (Math.random() - 0.5) * 0.6
    this.r = Math.random() * 2.2 + 0.8
    this.opacity = Math.random() * 0.5 + 0.5
    const palette = ['255,102,0', '255,145,0', '255,175,50', '230,75,0', '255,200,80']
    this.color = palette[Math.floor(Math.random() * palette.length)]
  }

  update() {
    const dx = this.x - mouse.x
    const dy = this.y - mouse.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < MOUSE_RADIUS && d > 0) {
      const f = (MOUSE_RADIUS - d) / MOUSE_RADIUS
      this.x += (dx / d) * f * 2.5
      this.y += (dy / d) * f * 2.5
    }
    this.x += this.vx
    this.y += this.vy
    if (this.x < 0 || this.x > w) this.vx *= -1
    if (this.y < 0 || this.y > h) this.vy *= -1
    this.x = Math.max(0, Math.min(w, this.x))
    this.y = Math.max(0, Math.min(h, this.y))
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`
    ctx.fill()
  }
}

const init = () => {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  w = canvas.width = canvas.clientWidth
  h = canvas.height = canvas.clientHeight
  particles.length = 0
  for (let i = 0; i < COUNT; i++) particles.push(new Particle())
  animate()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  ctx.fillStyle = 'rgba(10,10,20,0.18)'
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < CONNECT_DIST) {
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(255,120,0,${(1 - d / CONNECT_DIST) * 0.45})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }
    particles[i].update()
    particles[i].draw()
  }
}

const onMove = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}
const onLeave = () => { mouse.x = -1000; mouse.y = -1000 }
const onResize = () => {
  if (!canvasRef.value) return
  w = canvasRef.value.width = canvasRef.value.clientWidth
  h = canvasRef.value.height = canvasRef.value.clientHeight
}

onMounted(() => {
  init()
  canvasRef.value.addEventListener('mousemove', onMove)
  canvasRef.value.addEventListener('mouseleave', onLeave)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
})
</script>