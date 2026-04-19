<template>
  <section class="relative overflow-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#f5f5f4_36%,#1c1917_36%,#0c0a09_100%)]">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.24),transparent_24%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_22%)]" />
    <div class="relative mx-auto max-w-7xl px-4 py-10 md:px-6 lg:py-14">
      <div
        ref="heroPanelRef"
        class="group relative min-h-[38rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#292524_0%,#1c1917_42%,#7c2d12_100%)] shadow-2xl transition duration-150 md:min-h-[42rem]"
        :style="heroPanelStyle"
        @mousemove="updateHeroGlow"
        @mouseleave="resetHeroGlow"
      >
        <div class="absolute -inset-6 rounded-[2.5rem] bg-orange-500/18 blur-3xl" />
        <div class="absolute -left-16 top-10 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
        <div class="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-orange-500/16 blur-3xl" />
        <div class="absolute left-1/3 top-1/4 h-80 w-80 rounded-full bg-stone-100/6 blur-3xl" />
        <div
          class="pointer-events-none absolute inset-0 transition duration-200"
          :style="heroGlowStyle"
        />
        <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(251,146,60,0.16),transparent_34%,rgba(255,255,255,0.05)_60%,rgba(251,146,60,0.12)_100%)]" />
        <div class="relative z-10 flex min-h-[38rem] flex-col justify-between p-8 md:min-h-[42rem] md:p-10 lg:p-12">
          <div class="max-w-2xl">
            <p class="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-orange-300">
              CS308 Store
            </p>
            <h1 class="mb-5 text-4xl font-bold leading-tight text-white md:text-6xl">
              Tech essentials curated for people who want fast, reliable upgrades.
            </h1>
            <p class="mb-8 max-w-xl text-base leading-7 text-stone-200 md:text-lg">
              Shop premium devices, gaming gear, and audio picks with a cleaner storefront and
              clearer path to what matters most.
            </p>
            <button
              type="button"
              class="inline-flex items-center rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              @click="$emit('shop-now')"
            >
              Shop now
            </button>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-[1.5rem] border border-white/10 bg-black/16 p-5 backdrop-blur-sm">
              <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Curated tech</p>
              <p class="mt-3 text-lg font-semibold text-white">Premium hardware across your daily setup.</p>
            </div>
            <div class="rounded-[1.5rem] border border-white/10 bg-black/16 p-5 backdrop-blur-sm">
              <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Interactive surface</p>
              <p class="mt-3 text-lg font-semibold text-white">The entire hero now responds to cursor movement.</p>
            </div>
            <div class="rounded-[1.5rem] border border-white/10 bg-black/16 p-5 backdrop-blur-sm">
              <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Faster entry</p>
              <p class="mt-3 text-lg font-semibold text-white">Users land directly into shopping without extra blocks.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['shop-now'])

const heroPanelRef = ref(null)
const heroGlow = ref({
  x: 50,
  y: 50,
  opacity: 0,
  rotateX: 0,
  rotateY: 0
})

const updateHeroGlow = (event) => {
  const bounds = heroPanelRef.value?.getBoundingClientRect()
  if (!bounds) return
  heroGlow.value = {
    x: ((event.clientX - bounds.left) / bounds.width) * 100,
    y: ((event.clientY - bounds.top) / bounds.height) * 100,
    opacity: 1,
    rotateX: ((0.5 - (event.clientY - bounds.top) / bounds.height) * 4.5),
    rotateY: ((((event.clientX - bounds.left) / bounds.width) - 0.5) * 6)
  }
}

const resetHeroGlow = () => {
  heroGlow.value = {
    x: 50, y: 50, opacity: 0, rotateX: 0, rotateY: 0
  }
}

const heroPanelStyle = computed(() => ({
  transform: `perspective(1400px) rotateX(${heroGlow.value.rotateX}deg) rotateY(${heroGlow.value.rotateY}deg)`,
  boxShadow: `0 28px 80px rgba(28, 25, 23, 0.34), 0 0 54px rgba(251, 146, 60, ${0.08 + heroGlow.value.opacity * 0.1})`
}))

const heroGlowStyle = computed(() => ({
  background: `
    radial-gradient(circle at ${heroGlow.value.x}% ${heroGlow.value.y}%,
    rgba(251, 146, 60, ${0.3 * heroGlow.value.opacity}) 0%,
    rgba(253, 186, 116, ${0.2 * heroGlow.value.opacity}) 16%,
    rgba(255, 237, 213, ${0.1 * heroGlow.value.opacity}) 30%,
    rgba(28, 25, 23, 0) 48%)
  `
}))
</script>