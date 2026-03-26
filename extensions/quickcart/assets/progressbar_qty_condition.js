const shop = document.querySelector("#shop-primary-url")?.value;
const progressbar_qty = document.querySelector(".reward-progress-line .fill");
const progressbar_qty_text = document.querySelector(".reward-progress-text");

let progressbar_qty_enabled = false;
let progressbar_qty_buyqty = 0;
let progressbar_qty_getqty = 0;

const quickCartI18n = window.QuickCartI18n || {};

function formatText(template, values = {}) {
  return String(template || "").replace(/{{\s*(\w+)\s*}}/g, (_, key) => values[key] ?? "");
}

function getDefaultRemainingMany(remaining) {
  return formatText(quickCartI18n.bxgyItemsAwayGift || "", { count: remaining });
}

function getDefaultRemainingOne(remaining) {
  return formatText(quickCartI18n.bxgyItemAwayGift || quickCartI18n.bxgyItemsAwayGift || "", { count: remaining });
}

function getDefaultUnlocked(freeCount) {
  return formatText(quickCartI18n.bxgyCongratulations || "", { freeCount });
}

function setProgressMarkers(buyQty, getQty) {
  const selectors = [".buy3get1", ".buy3get2", ".last-step", ".p_buy1get1", ".p_buy2get1", ".p_buy3get1", ".p_buy3get2"];
  selectors.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) {
      if (selector.startsWith(".buy")) el.style.display = "none";
      if (selector.startsWith(".p_")) el.style.opacity = "";
    }
  });

  if (buyQty === 1) {
    const lastStep = document.querySelector(".last-step");
    const marker = document.querySelector(".p_buy1get1");
    if (lastStep) lastStep.style.display = "none";
    if (marker) marker.style.opacity = 1;
  }

  if (buyQty === 2) {
    const marker = document.querySelector(".p_buy2get1");
    if (marker) marker.style.opacity = 1;
  }

  if (buyQty === 3 && getQty === 1) {
    const section = document.querySelector(".buy3get1");
    const marker = document.querySelector(".p_buy3get1");
    if (section) section.style.display = "block";
    if (marker) marker.style.opacity = 1;
  }

  if (buyQty === 3 && getQty === 2) {
    const section1 = document.querySelector(".buy3get1");
    const section2 = document.querySelector(".buy3get2");
    const marker = document.querySelector(".p_buy3get2");
    if (section1) section1.style.display = "block";
    if (section2) section2.style.display = "block";
    if (marker) marker.style.opacity = 1;
  }
}

function getProgressWidth(updated_qty, buyQty, getQty) {
  const maxQty = buyQty + getQty;
  if (maxQty <= 0) return 0;
  return Math.min(100, Math.round((updated_qty / maxQty) * 100));
}

function getBannerMessage(updated_qty, buyQty, getQty) {
  const unlockAt = buyQty + getQty;
  const remaining = Math.max(0, unlockAt - updated_qty);

  if (updated_qty >= unlockAt) {
    return getDefaultUnlocked(getQty);
  }

  if (remaining === 1) {
    return getDefaultRemainingOne(remaining);
  }

  if (remaining > 1) {
    return getDefaultRemainingMany(remaining);
  }

  return getDefaultRemainingMany(remaining);
}

async function getbxgy(shopDomain) {
  const url = "https://quickcart-vf8k.onrender.com/app/quickcart/bxgy";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Shop-Domain": shopDomain,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    if (json?.ok === false) {
      throw new Error(json.error || "Endpoint returned error");
    }

    const bxgyResponse = json.data || json;

    progressbar_qty_enabled = bxgyResponse?.enabled || false;
    progressbar_qty_buyqty = Number(bxgyResponse?.offer?.buyQty || 0);
    progressbar_qty_getqty = Number(bxgyResponse?.offer?.getQty || 0);

  } catch (error) {
    console.error("Error fetching BXGY configuration:", error);
    progressbar_qty_enabled = false;
    progressbar_qty_buyqty = 0;
    progressbar_qty_getqty = 0;
  }
}

if (shop) {
  getbxgy(shop);
}

(function () {
  async function onCartUpdateQty() {
    try {
      const rewardProgress = document.querySelector(".reward-progress");
      if (rewardProgress) {
        rewardProgress.style.display = progressbar_qty_enabled ? "block" : "none";
      }

      if (!progressbar_qty_enabled || !progressbar_qty || !progressbar_qty_text) {
        return;
      }

      setProgressMarkers(progressbar_qty_buyqty, progressbar_qty_getqty);

      const response = await fetch("/cart.js");
      const cart = await response.json();
      const updated_qty = Number(cart?.item_count || 0);

      progressbar_qty.style.width = `${getProgressWidth(updated_qty, progressbar_qty_buyqty, progressbar_qty_getqty)}%`;
      progressbar_qty_text.textContent = getBannerMessage(
        updated_qty,
        progressbar_qty_buyqty,
        progressbar_qty_getqty
      );
    } catch (err) {
      console.error("Error fetching cart:", err);
      if (progressbar_qty_text) {
        progressbar_qty_text.textContent = quickCartI18n.contactSupport || "";
      }
    }
  }

  document.addEventListener("cart:updated", onCartUpdateQty);

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    if (
      typeof args[0] === "string" &&
      (args[0].includes("/cart/add") ||
        args[0].includes("/cart/change") ||
        args[0].includes("/cart/update"))
    ) {
      document.dispatchEvent(new Event("cart:updated"));
    }

    return response;
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (...args) {
    this.addEventListener("load", function () {
      if (
        typeof args[1] === "string" &&
        (args[1].includes("/cart/add") ||
          args[1].includes("/cart/change") ||
          args[1].includes("/cart/update"))
      ) {
        document.dispatchEvent(new Event("cart:updated"));
      }
    });
    return originalOpen.apply(this, args);
  };

  onCartUpdateQty();
})();
