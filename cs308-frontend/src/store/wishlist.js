import { reactive } from "vue";
import {
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
} from "../api/wishlistApi";
import { authStore } from "./auth";

const normalizeItems = (payload) =>
  Array.isArray(payload?.items) ? payload.items.filter(Boolean) : [];

const normalizeProductIds = (payload) =>
  normalizeItems(payload)
        .map((item) => String(item?.productId || "").trim())
        .filter(Boolean)
;

const currentUserId = () =>
  String(authStore.user?.id || authStore.user?._id || "");

let loadPromise = null;

export const wishlistStore = reactive({
  items: [],
  productIds: [],
  pendingProductIds: [],
  loading: false,
  loadedUserId: "",

  has(productId) {
    return this.productIds.includes(String(productId || "").trim());
  },

  isPending(productId) {
    return this.pendingProductIds.includes(String(productId || "").trim());
  },

  setWishlist(payload) {
    this.items = normalizeItems(payload);
    this.productIds = normalizeProductIds(payload);
    this.loadedUserId = currentUserId();
  },

  clear() {
    this.items = [];
    this.productIds = [];
    this.pendingProductIds = [];
    this.loading = false;
    this.loadedUserId = "";
    loadPromise = null;
  },

  async ensureLoaded(force = false) {
    if (!authStore.isLoggedIn || authStore.role !== "customer") {
      this.clear();
      return;
    }

    const userId = currentUserId();

    if (!force && this.loadedUserId === userId) {
      return;
    }

    if (loadPromise) {
      return loadPromise;
    }

    this.loading = true;

    loadPromise = getWishlist()
      .then((response) => {
        this.setWishlist(response.data);
      })
      .catch((error) => {
        this.clear();
        throw error;
      })
      .finally(() => {
        this.loading = false;
        loadPromise = null;
      });

    return loadPromise;
  },

  async toggle(productId) {
    const normalizedProductId = String(productId || "").trim();

    if (!normalizedProductId) {
      return { success: false };
    }

    if (!authStore.isLoggedIn) {
      return { requiresLogin: true };
    }

    if (authStore.role !== "customer") {
      return { forbidden: true };
    }

    if (this.isPending(normalizedProductId)) {
      return { pending: true };
    }

    this.pendingProductIds = [...this.pendingProductIds, normalizedProductId];

    try {
      const response = this.has(normalizedProductId)
        ? await removeWishlistItem(normalizedProductId)
        : await addWishlistItem(normalizedProductId);

      this.setWishlist(response.data);

      return {
        success: true,
        active: this.has(normalizedProductId),
      };
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404 || statusCode === 409) {
        await this.ensureLoaded(true);
      }

      throw error;
    } finally {
      this.pendingProductIds = this.pendingProductIds.filter(
        (value) => value !== normalizedProductId,
      );
    }
  },
});
