
(function () {
  const drawer = document.getElementById("CartDrawerPremium");
  if (!drawer) return; // Abort if drawer is not present on the page





  /* ================= UPSell ADD (delegate + FormData) ================= */
  drawer.addEventListener("click", function (e) {
    // Handles upsell add-to-cart button clicks
    const btn = e.target.closest("[data-upsell-add]");
    if (!btn) return;

    const card = btn.closest("[data-upsell-card]");
    const sel = card?.querySelector("[data-variant-select]");
    const variantId = sel?.value;
    const selectedOption = sel?.selectedOptions?.[0];

    if (!variantId) return;

    // Block double clicks
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");

    // Support optional selling plan on the option if you ever add it
    const sellingPlan =
      selectedOption?.getAttribute("data-selling-plan") || null;

    addVariantFD(variantId, 1, sellingPlan ? { selling_plan: sellingPlan } : {})
      .then(() => refreshUI())
      .finally(() => {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
      });

    e.preventDefault();
  });


  // ---- THEME NAME (best-effort, used only for logging / special-case hooks) ----
  const themeName =
    (window.Shopify && Shopify.theme && (Shopify.theme.name || Shopify.theme.schema_name)) ||
    "";

  // ---- DOM HOOKS INSIDE DRAWER ----
  const openClass = drawer.dataset.openClass || "cdp-open";
  const linesRoot = drawer.querySelector("[data-lines]");
  const cartCountEl = drawer.querySelector("[data-cart-count]");
  const subtotalEl = drawer.querySelector("[data-subtotal]");
  const totalEl = drawer.querySelector("[data-total]");
  const offersRoot = drawer.querySelector("[data-offers]");

  // ---- Small guard to prevent rapid double-opens ----
  let _openTick = 0;
  const openSoon = (ms = 0) => {
    const tick = Date.now();
    _openTick = tick;
    setTimeout(() => {
      if (_openTick !== tick) return; // a newer open call superseded this one
      openDrawer();
    }, ms);
  };

  /* ================= CLOSE / OPEN ================= */
  function openDrawer() {
    if (!drawer.classList.contains(openClass)) {
      drawer.classList.add(openClass);
      drawer.setAttribute("aria-hidden", "false");
    }
    refreshUI();
  }
  function closeDrawer() {
    drawer.classList.remove(openClass);
    drawer.setAttribute("aria-hidden", "true");
  }

  drawer.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeDrawer));

  /* ================= ANNOUNCE MARQUEE (UX nicety) ================= */
  const marq = drawer.querySelector("[data-announce-track]");
  if (marq) {
    marq.addEventListener("mouseenter", () => (marq.style.animationPlayState = "paused"));
    marq.addEventListener("mouseleave", () => (marq.style.animationPlayState = "running"));
  }

  /* ================= COUNTDOWN (persists per tab) ================= */
  const tRoot = drawer.querySelector("[data-countdown]");
  if (tRoot) {
    const mins = parseInt(tRoot.getAttribute("data-countdown-mins") || "15", 10);
    const label = tRoot.querySelector("[data-countdown-time]");
    const KEY = "cdp_countdown_deadline";
    let deadline = parseInt(localStorage.getItem(KEY) || "0", 10);
    const now = Date.now();
    if (!deadline || deadline < now) {
      deadline = now + mins * 60 * 1000;
      localStorage.setItem(KEY, String(deadline));
    }
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        if (label) label.textContent = "00:00";
        return;
      }
      const m = Math.floor(diff / 60000),
        s = Math.floor((diff % 60000) / 1000);
      if (label) label.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ================= AJAX HELPERS ================= */
  const fmtMoney = (cents) => {
    try {
      if (window.Shopify && typeof Shopify.formatMoney === "function") {
        return Shopify.formatMoney(
          cents,
          "{{ shop.money_format | strip_newlines | escape }}"
        );
      }
      // Fallback: use shop currency if available
      const c = (window.Shopify && Shopify.currency && Shopify.currency.active) || "{{ shop.currency }}";
      return (cents / 100).toLocaleString(undefined, { style: "currency", currency: c });
    } catch (e) {
      return "₹" + (cents / 100).toFixed(2);
    }
  };

  const fetchCart = () =>
    fetch("/cart.js", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    }).then((r) => r.json());

  const changeQty = (key, quantity) =>
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity }),
      credentials: "same-origin",
    }).then((r) => r.json());

  // reliable add (supports properties/selling_plan)
  const addVariantFD = (variantId, quantity = 1, extra = {}) => {
    const fd = new FormData();
    fd.append("id", String(variantId));
    fd.append("quantity", String(quantity));
    if (extra && extra.properties) {
      Object.keys(extra.properties).forEach((k) => {
        fd.append(`properties[${k}]`, String(extra.properties[k]));
      });
    }
    if (extra && extra.selling_plan) {
      fd.append("selling_plan", String(extra.selling_plan));
    }
    return fetch("/cart/add.js", {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    }).then((r) => r.json());
  };

  /* ================= RENDERING ================= */
  const truncate = (str, n = 30) => (str && str.length > n ? str.slice(0, n) + "…" : str || "");

  const renderLines = (cart) => {
    if (!linesRoot) return;
    if (!cart.items || cart.items.length === 0) {
      linesRoot.innerHTML = '<div class="cdp-empty-msg">Your cart is empty.</div>';
      return;
    }
    linesRoot.innerHTML = cart.items
      .map((item) => {
        const img = item.image ? item.image.replace(/\.(jpg|jpeg|png|webp)(\?|$)/i, "_180x.$1$2") : "";
        const variant =
          item.variant_title && item.variant_title !== "Default Title"
            ? `<span class="cdp-line-variant">${item.variant_title} | </span>`
            : "";
        const hasCompare = item.original_line_price > item.final_line_price;
        return `
        <article class="cdp-line" data-line-key="${item.key}">
          <div class="cdp-line-media">
            <img src="${img}" alt="${item.product_title}" width="90" height="90" loading="lazy">
          </div>
          <div class="cdp-line-info">
            <div class="cdp-line-title">
              <span class="cart-item-title">${truncate(item.product_title, 35)}</span>
            </div>
            <div class="cdp-line-top">
              <span class="cart-item-variant-title">
                ${variant}
                <span class="cdp-line-prices">
                  <span class="cdp-line-final">${fmtMoney(item.final_line_price)}</span>
                  ${hasCompare ? `<span class="cdp-line-compare">${fmtMoney(item.original_line_price)}</span>` : ""}
                </span>
              </span>
              <div class="cdp-line-bottom">
                <div class="cdp-qty" data-qty-wrap>
                  <button class="cdp-qty-btn" data-qty-down>-</button>
                  <input class="cdp-qty-input" type="number" min="0" value="${item.quantity}" data-qty>
                  <button class="cdp-qty-btn" data-qty-up>+</button>
                </div>
                <button class="cdp-line-remove" data-remove="${item.key}" aria-label="Remove">&#x2715;</button>
              </div>
            </div>
          </div>
        </article>`;
      })
      .join("");
  };

  const renderTotals = (cart) => {
    if (cartCountEl) cartCountEl.textContent = `(${cart.item_count || 0})`;
    if (subtotalEl) subtotalEl.textContent = fmtMoney(cart.total_price || 0);
    if (totalEl) totalEl.textContent = fmtMoney(cart.total_price || 0);
    if (offersRoot) {
      if ((cart.total_discount || 0) > 0) {
        offersRoot.innerHTML = `
          <div class="cdp-offer-row">
            <span class="cdp-offer-chip">Offer</span>
            <span class="cdp-offer-text">Discounts applied</span>
            <span class="cdp-offer-val">-${fmtMoney(cart.total_discount)}</span>
          </div>`;
      } else {
        // Keep empty or your static offer hint (no Liquid inside JS please)
        offersRoot.innerHTML = "";
      }
    }
  };

  const refreshUI = () =>
    fetchCart().then((cart) => {
      renderLines(cart);
      renderTotals(cart);
    });

  /* ================= QTY / REMOVE – EVENT DELEGATION ================= */
  drawer.addEventListener("click", function (e) {
    const down = e.target.closest("[data-qty-down]");
    const up = e.target.closest("[data-qty-up]");
    const rem = e.target.closest("[data-remove]");

    if (down || up) {
      const line = e.target.closest(".cdp-line");
      const key = line?.getAttribute("data-line-key");
      const input = line?.querySelector("[data-qty]");
      if (!key || !input) return;
      const curr = parseInt(input.value || "1", 10);
      const next = Math.max(0, curr + (down ? -1 : 1));
      changeQty(key, next).then(refreshUI);
      e.preventDefault();
      return;
    }

    if (rem) {
      const key = rem.getAttribute("data-remove");
      changeQty(key, 0).then(refreshUI);
      e.preventDefault();
      return;
    }
  });

  drawer.addEventListener("change", function (e) {
    const qtyInput = e.target.closest("[data-qty]");
    if (!qtyInput) return;
    const line = e.target.closest(".cdp-line");
    const key = line?.getAttribute("data-line-key");
    const v = Math.max(0, parseInt(qtyInput.value || "0", 10));
    if (!key) return;
    changeQty(key, v).then(refreshUI);
  });

  /* ================= COUPON UI (optional) ================= */
  (function couponUX() {
    const couponInput = drawer.querySelector("[data-coupon]");
    const applyBtn = drawer.querySelector("[data-apply-coupon]");
    const checkoutA = drawer.querySelector("[data-checkout]");
    const discountRow = drawer.querySelector("[data-discount-row]");
    const discountCodeEl = drawer.querySelector("[data-discount-code]");
    const clearBtn = drawer.querySelector("[data-discount-clear]");

    function applyDiscountCookie(code) {
      const ifr = document.createElement("iframe");
      ifr.style.display = "none";
      ifr.src = `/discount/${encodeURIComponent(code)}?redirect=/cart`;
      document.body.appendChild(ifr);
      setTimeout(() => ifr.remove(), 4000);
    }
    function showDiscountRow(code) {
      if (discountRow) {
        if (discountCodeEl) discountCodeEl.textContent = code;
        discountRow.hidden = false;
      }
    }
    function hideDiscountRow() {
      if (discountRow) {
        discountRow.hidden = true;
        if (discountCodeEl) discountCodeEl.textContent = "";
      }
    }
    function setCheckoutHrefWith(code) {
      if (checkoutA) checkoutA.setAttribute("href", `/checkout?discount=${encodeURIComponent(code)}`);
    }

    const savedCode = sessionStorage.getItem("cdp_discount_code");
    if (savedCode) {
      setCheckoutHrefWith(savedCode);
      if (couponInput) couponInput.value = savedCode;
      showDiscountRow(savedCode);
    }

    applyBtn?.addEventListener("click", () => {
      const code = (couponInput?.value || "").trim();
      if (!code) return;
      sessionStorage.setItem("cdp_discount_code", code);
      setCheckoutHrefWith(code);
      applyDiscountCookie(code);
      showDiscountRow(code);
      applyBtn.textContent = "Applied";
      setTimeout(() => (applyBtn.textContent = "Apply"), 1200);
    });

    clearBtn?.addEventListener("click", () => {
      sessionStorage.removeItem("cdp_discount_code");
      checkoutA?.setAttribute("href", `/checkout`);
      hideDiscountRow();
    });
  })();

  /* ================= PUBLIC API ================= */
  window.CartDrawerPremium = { open: openDrawer, close: closeDrawer };

  /* =================== OPEN ON ADD-TO-CART FORMS =================== */
  // Intercepts *any* form posting to /cart/add or containing it; sends the exact form payload.
  document.addEventListener("submit", function (e) {
    const form = e.target.closest('form[action*="/cart/add"], form[action="/cart/add"]');
    if (!form) return;

    e.preventDefault();
    e.stopPropagation();

    const btn = form.querySelector('button[type="submit"][name="add"], button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.classList.add("is-loading");
    }

    const fd = new FormData(form);
    fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: fd,
      credentials: "same-origin",
    })
      .then((r) => {
        // If theme blocks JSON, still open; otherwise open after success.
        if (r.ok) openSoon(10);
        else openSoon(10);
      })
      .catch(() => openSoon(10))
      .finally(() => {
        if (btn) {
          btn.disabled = false;
          btn.classList.remove("is-loading");
        }
      });
  });

  /* =================== OPEN ON CART ICON CLICK =================== */
  // Targets many common cart icon/bubble selectors across themes – add more if you find new ones.
  const CART_ICON_SELECTORS = [
    ".header__icon--cart",
    ".m-cart-icon-bubble",
    ".navlink--cart",
    'a[aria-label="Cart"]',
    ".header-actions__cart-icon",
    "a[href='/cart']",
    "a[href$='#cart']",
    "[data-cart-trigger]",
    "[data-open-cart]",
  ].join(",");

  document.addEventListener("click", function (e) {
    const icon = e.target.closest(CART_ICON_SELECTORS);
    if (!icon) return;

    // Intercept only if drawer API exists to avoid hijacking genuine page nav
    if (window.CartDrawerPremium && typeof window.CartDrawerPremium.open === "function") {
      e.preventDefault();
      e.stopPropagation();
      openSoon(0);
    }
  });

  /* =================== THEME CART EVENTS (PIPELINE + OTHERS) =================== */
  // Many themes emit events; listen and open.
  const onThemeCartEvent = () => openSoon(0);
  [
    // "theme:cart:change", // Pipeline
    "cart:updated",
    "cart:change",
    "ajaxProduct:added",
    "product:added",
    "lineItem:added",
  ].forEach((ev) => document.addEventListener(ev, onThemeCartEvent, { passive: true }));

  // Keep your existing Pipeline-specific log/behavior (safe-guarded)
  // if (themeName.toLowerCase().includes("pipeline")) {
  //   document.addEventListener(
  //     "theme:cart:change",
  //     (event) => {
  //       try {
  //         const itemCount = event?.detail?.cart?.item_count;
  //         if (typeof itemCount === "number") openSoon(0);
  //       } catch (_) {
  //         openSoon(0);
  //       }
  //     },
  //     { passive: true }
  //   );
  // }

  /* =================== NETWORK FALLBACKS =================== */
  // 1) fetch() monkey-patch: open drawer when /cart/(add|change|update).js succeeds
  const _fetch = window.fetch;
  window.fetch = function (input, init = {}) {
    const p = _fetch.apply(this, arguments);
    p.then((res) => {
      try {
        const url = typeof input === "string" ? input : input?.url || "";
        const method = (init && init.method ? init.method : "GET").toUpperCase();
        if (/\/cart\/(add|change|update)\.js(\?|$)/.test(url) && res.ok && method !== "GET") {
          res.clone().json().catch(() => null).finally(() => openSoon(0));
        }
      } catch (_) { }
    });
    return p;
  };

  // 2) XHR monkey-patch: older themes/libs using XMLHttpRequest
  const _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("load", function () {
      try {
        if (this.status >= 200 && this.status < 300 && /\/cart\/(add|change|update)\.js(\?|$)/.test(this.responseURL)) {
          openSoon(0);
        }
      } catch (_) { }
    });
    return _send.apply(this, arguments);
  };

  /* =================== KEYBOARD ESC CLOSE =================== */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* =================== OPTIONAL: MOBILE UPSELL BUTTONS =================== */
  const mobUpsellBtn = document.querySelector(".mobile-upsell-btn");
  const mobUpsellClose = document.querySelector(".upsell-mob-close-icon");
  const upsellPane = document.querySelector(".cdp-upsell");
  mobUpsellBtn?.addEventListener("click", () => upsellPane?.classList.add("active"));
  mobUpsellClose?.addEventListener("click", () => upsellPane?.classList.remove("active"));

  /* =================== PAGE DECORATION (SAFE) =================== */
  // document.addEventListener("DOMContentLoaded", function () {
  //   document.documentElement.classList.add("layerup-html");
  //   document.body.classList.add("layerup-body");



  //   const btns = document.querySelectorAll(
  //     '.cart-drawer button, .cart-drawer__dialog cart-icon, cart-drawer-component button, [data-cart-toggle] , .cart-drawer button'
  //   );

  //   btns.forEach(btn => {
  //     // remove inline on* handlers like onclick / on:click
  //     btn.removeAttribute("onclick");
  //     btn.removeAttribute("on:click");

  //     // also nuke any directly assigned DOM property
  //     btn.onclick = null;
  //   });

  // });
})();



