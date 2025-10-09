(function () {

 
  // convert price to currency
  function convertToCurrency(price, currencyCode) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode
  }).format(price);
}



//  
const btn = document.querySelector('#ds-checkout-btn');
const panel = document.querySelector('.mini-cart-order-summary-content');

if (btn && panel) {
  btn.addEventListener('click', () => {
    panel.classList.toggle('active');
     btn.classList.toggle('active');
  });
}

// 

  const drawer = document.getElementById("CartDrawerPremium");
  if (!drawer) return;

  const openClass = drawer.dataset.openClass || "cdp-open";
  const linesRoot = drawer.querySelector("[data-lines]");
  const cartCountEl = drawer.querySelector("[data-cart-count]");
  const subtotalEl = drawer.querySelector("[data-subtotal]");
  const totalEl = drawer.querySelector("[data-total]");
  const offersRoot = drawer.querySelector("[data-offers]");

  /* ================= CLOSE / OPEN ================= */
  function openDrawer() {
    drawer.classList.add(openClass);
    drawer.setAttribute("aria-hidden", "false");
    refreshUI();
  }
  function closeDrawer() {
    drawer.classList.remove(openClass);
    drawer.setAttribute("aria-hidden", "true");
  }
  drawer.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeDrawer));

  /* ================= VERTICAL UPSELL SCROLLER ================= */
  const vSlider = drawer.querySelector("[data-v-slider]");
  if (vSlider) {
    const track = vSlider.querySelector(".cdp-v-track");
    drawer.querySelector("[data-v-prev]")?.addEventListener("click", () => track.scrollBy({ top: -120, behavior: "smooth" }));
    drawer.querySelector("[data-v-next]")?.addEventListener("click", () => track.scrollBy({ top: +120, behavior: "smooth" }));
  }

  /* ================= ANNOUNCE MARQUEE ================= */
  const marq = drawer.querySelector("[data-announce-track]");
  if (marq) {
    marq.addEventListener("mouseenter", () => (marq.style.animationPlayState = "paused"));
    marq.addEventListener("mouseleave", () => (marq.style.animationPlayState = "running"));
  }

  /* ================= COUNTDOWN ================= */
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
        label.textContent = "00:00";
        return;
      }
      const m = Math.floor(diff / 60000),
        s = Math.floor((diff % 60000) / 1000);
      label.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ================= AJAX HELPERS ================= */
  const fmtMoney = (cents) => {
    try {
      const moneyFormat = drawer.getAttribute("data-money-format") || "${{amount}}";
      const currencyCode = drawer.getAttribute("data-currency") || undefined;
      const safeCents = isFinite(cents) ? cents : 0;

      if (window.Shopify && typeof Shopify.formatMoney === "function") {
        return Shopify.formatMoney(safeCents, moneyFormat);
      }
      const amount = safeCents / 100;
      return amount.toLocaleString(undefined, {
        style: currencyCode ? "currency" : "decimal",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (e) {
      return ((cents || 0) / 100).toFixed(2);
    }
  };

  const fetchCart = () =>
    fetch("/cart.js", {
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      credentials: "same-origin",
      cache: "no-store",
    }).then((r) => r.json());

  const changeQty = (key, quantity) =>
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity }),
      credentials: "same-origin",
    }).then((r) => r.json());

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
  function truncate(str, n = 30) {
    return str.length > n ? str.slice(0, n) + "…" : str;
  }

  const renderLines = (cart) => {
    if (!linesRoot) return;
    if (cart.items.length === 0) {
      linesRoot.innerHTML = '<div class="cdp-empty-msg">Your cart is empty.</div>';
      return;
    }
    linesRoot.innerHTML = cart.items.map((item) => `
      <article class="cdp-line" data-line-key="${item.key}">
        <div class="cdp-line-media">
          <img src="${item.image ? item.image.replace(/\.(jpg|png|jpeg)/, "_180x.$1") : ""}" alt="${item.product_title}" width="90" height="90" loading="lazy">
        </div>
        <div class="cdp-line-info">
          <div class="cdp-line-title">
              <span class="cart-item-title">${truncate(item.product_title, 35)}</span>
          </div>
          <div class="cdp-line-top">
            <span class="cart-item-variant-title"> 
              ${item.variant_title && item.variant_title !== "Default Title" ? `<span class="cdp-line-variant">${item.variant_title} | </span>` : ""}
              <span class="cdp-line-prices">
                <span class="cdp-line-final">${fmtMoney(item.final_line_price)}</span>
                ${item.original_line_price > item.final_line_price ? `<span class="cdp-line-compare">${fmtMoney(item.original_line_price)}</span>` : ""}
              </span> | ${item.discounts?.length ? `<span class="discount">${item.discounts[0]?.title || ""}</span>` : ""}
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
      </article>
    `).join("");
  };

  const renderTotals = (cart) => {
    if (cartCountEl) cartCountEl.textContent = `(${cart.item_count || 0})`;

    const sumLines = (items) => (Array.isArray(items) ? items.reduce((a, it) => a + (Number(it.final_line_price) || 0), 0) : 0);

    const itemsSum = sumLines(cart.items);
    const subtotalCents = isFinite(cart.items_subtotal_price) && cart.items_subtotal_price > 0 ? cart.items_subtotal_price : itemsSum;
    const totalCents = isFinite(cart.total_price) && cart.total_price > 0 ? cart.total_price : subtotalCents;

    if (subtotalEl) subtotalEl.textContent = fmtMoney(subtotalCents);
    if (totalEl) totalEl.textContent = fmtMoney(totalCents);

    if (offersRoot) {
      if (cart.total_discount && cart.total_discount > 0) {
        offersRoot.innerHTML = `
          <div class="cdp-offer-row">
            <span class="cdp-offer-chip">Offer</span>
            <span class="cdp-offer-text">Discounts applied</span>
            <span class="cdp-offer-val">-${fmtMoney(cart.total_discount)}</span>
          </div>`;
      } else {
        offersRoot.innerHTML = ""; // fallback: no discount
      }
    }
  };

  const refreshUI = () => fetchCart().then((cart) => {
    renderLines(cart);
    renderTotals(cart);
    // console.log("cart:update", cart);
   freegiftproduct(cart);
   function freegiftproduct(cart){
    console.log("cart data at freegiftproduct function", cart);
    const cart_total_price = cart?.total_price / 100;
    console.log("cart total price", cart_total_price);
  }



    let cart_level_discount_applications = cart?.cart_level_discount_applications[0]?.title;
    let total_discount = cart?.total_discount / 100;
    let total_discount_formated_price = convertToCurrency(total_discount, cart?.currency);

    let discountEl = `Discount applied
                   <span class="discounted-value">-${total_discount_formated_price}</span>`;
    if(cart_level_discount_applications){
      document.querySelector('.discount-applied-at-cartdrawer').innerHTML = discountEl;
      document.querySelector('.discount-applied-at-cartdrawer').style.display = 'flex';
    } else {
      document.querySelector('.discount-applied-at-cartdrawer').style.display = 'none';
    }
    
  });

  fetchCart().then((cart) => renderTotals(cart));

  /* ================= LINE CONTROLS ================= */
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

  /* ================= UPSell ADD ================= */
  drawer.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-upsell-add]");
    if (!btn) return;

    const card = btn.closest("[data-upsell-card]");
    const sel = card?.querySelector("[data-variant-select]");
    const variantId = sel?.value;
    if (!variantId) return;

    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    addVariantFD(variantId, 1).then(() => refreshUI()).finally(() => {
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
    });
    e.preventDefault();
  });

  /* ================= COUPON UX ================= */
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
    if (!discountRow) return;
    if (discountCodeEl) discountCodeEl.textContent = code;
    discountRow.hidden = false;
  }
  function hideDiscountRow() {
    if (!discountRow) return;
    discountRow.hidden = true;
    if (discountCodeEl) discountCodeEl.textContent = "";
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

  /* ================= PUBLIC API ================= */
  window.CartDrawerPremium = { open: openDrawer, close: closeDrawer };

  /* ================= AJAX ADD-TO-CART (product forms) ================= */
  document.addEventListener("submit", function (e) {
    const form = e.target.closest('form[action*="/cart/add"],form[action="/cart/add"]');
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
    }).then(() => openDrawer()).finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("is-loading");
      }
    });
  });

  /* ================= HEADER CART ICON → OPEN DRAWER ================= */
  document.addEventListener("click", function (e) {
    const icon = e.target.closest(".header__icon--cart, .m-cart-icon-bubble, .navlink--cart, a[aria-label='Cart'], .header-actions__cart-icon");
    if (!icon) return;
    if (window.CartDrawerPremium && typeof window.CartDrawerPremium.open === "function") {
      e.preventDefault();
      e.stopPropagation();
      window.CartDrawerPremium.open();
    }
  });

  /* ESC to close */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  document.querySelector('.mobile-upsell-btn')?.addEventListener("click", function(){
    document.querySelector('.cdp-upsell')?.classList.add("active");
  });
  document.querySelector('.upsell-mob-close-icon')?.addEventListener("click", function(){
    document.querySelector('.cdp-upsell')?.classList.remove("active");
  });
})();

document.addEventListener("DOMContentLoaded", function() {
  // Optional DOM hooks
});
