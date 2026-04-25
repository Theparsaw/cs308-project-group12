<template>
  <button
    v-if="canUseWishlist"
    type="button"
    :aria-label="buttonLabel"
    :aria-pressed="isActive"
    :title="buttonLabel"
    :disabled="isPending"
    :class="buttonClasses"
    @click.stop.prevent="handleClick"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :class="iconClasses"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.8"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12.001 20.727l-.783-.714C6.43 15.647 3.25 12.736 3.25 8.994A4.744 4.744 0 017.994 4.25c1.565 0 3.066.744 4.007 1.917.94-1.173 2.442-1.917 4.007-1.917a4.744 4.744 0 014.742 4.744c0 3.742-3.18 6.653-7.968 11.02l-.78.713z"
      />
    </svg>

    <span v-if="variant === 'detail'" class="text-sm font-medium">
      {{ detailLabel }}
    </span>
  </button>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authStore } from "../store/auth";
import { wishlistStore } from "../store/wishlist";

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: "card",
  },
});

const route = useRoute();
const router = useRouter();

const canUseWishlist = computed(
  () => !authStore.isLoggedIn || authStore.role === "customer"
);

const isActive = computed(() => wishlistStore.has(props.productId));
const isPending = computed(() => wishlistStore.isPending(props.productId));

const buttonLabel = computed(() => {
  if (!authStore.isLoggedIn) {
    return "Log in to save to wishlist";
  }

  return isActive.value ? "Remove from wishlist" : "Add to wishlist";
});

const detailLabel = computed(() =>
  isActive.value ? "Saved" : "Wishlist"
);

const buttonClasses = computed(() => {
  if (props.variant === "detail") {
    return [
      "group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 transition",
      "disabled:cursor-wait disabled:opacity-70",
      isActive.value
        ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
        : "border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-500",
    ];
  }

  return [
    "group inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition",
    "backdrop-blur-sm disabled:cursor-wait disabled:opacity-70",
    isActive.value
      ? "border-rose-300 bg-white/95 text-rose-600 hover:bg-rose-50"
      : "border-gray-700/80 bg-white/90 text-gray-700 hover:border-orange-400 hover:text-orange-500",
  ];
});

const iconClasses = computed(() => {
  const fillClasses = isActive.value
    ? "fill-current"
    : "fill-transparent group-hover:fill-current group-focus-visible:fill-current";

  return `h-5 w-5 transition-colors ${fillClasses}`;
});

const handleClick = async () => {
  try {
    const result = await wishlistStore.toggle(props.productId);

    if (result?.requiresLogin) {
      router.push({
        path: "/login",
        query: { redirect: route.fullPath },
      });
    }
  } catch (error) {
    console.error("Failed to update wishlist", error);
  }
};

onMounted(() => {
  if (authStore.isLoggedIn && authStore.role === "customer") {
    wishlistStore.ensureLoaded().catch(() => {});
  }
});
</script>
