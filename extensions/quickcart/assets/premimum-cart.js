// (function () {
//     if (window.upcartInitialized) return;
//     window.upcartInitialized = true;

//     console.log("Upcart: Progressbar + Upsell products initialize...");
    


//       function triggerPartyPopper() {
//     const canvas = document.getElementById('partyCanvas');
//     const ctx = canvas.getContext('2d');

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const originX = canvas.width / 2;
//     const originY = canvas.height - 100;

//     const emojis = ['🎉', '🎊', '💥', '❤️', '🤩'];
//     const shapes = ['rect', 'triangle', 'emoji'];

//     const particles = [];
//     const totalParticles = 100;

//     for (let i = 0; i < totalParticles; i++) {
//       const angle = Math.random() * Math.PI - Math.PI;
//       const speed = Math.random() * 8 + 1;
//       const shape = shapes[Math.floor(Math.random() * shapes.length)];

//       particles.push({
//         x: originX,
//         y: originY,
//         size: Math.random() * 6 + 4,
//         color: `hsl(${Math.random() * 360}, 100%, 60%)`,
//         velocityX: Math.cos(angle) * speed,
//         velocityY: Math.sin(angle) * speed - 8,
//         opacity: 1,
//         gravity: 0.25,
//         fade: Math.random() * 0.02 + 0.005,
//         rotation: Math.random() * 360,
//         rotationSpeed: (Math.random() - 0.5) * 10,
//         shape: shape,
//         emoji: emojis[Math.floor(Math.random() * emojis.length)]
//       });
//     }

//     let lastTime = performance.now();
//     const frameRate = 1000 / 60; // target ~60 FPS
//     let animationFrameId;

//     function drawFrame(currentTime) {
//       const delta = currentTime - lastTime;

//       if (delta >= frameRate) {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         particles.forEach(p => {
//           ctx.save();
//           ctx.globalAlpha = p.opacity;
//           ctx.translate(p.x, p.y);
//           ctx.rotate((p.rotation * Math.PI) / 180);

//           ctx.shadowColor = p.color;
//           ctx.shadowBlur = 10;

//           if (p.shape === 'circle') {
//             ctx.fillStyle = p.color;
//             ctx.beginPath();
//             ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
//             ctx.fill();
//           } else if (p.shape === 'rect') {
//             ctx.fillStyle = p.color;
//             ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
//           } else if (p.shape === 'triangle') {
//             ctx.fillStyle = p.color;
//             ctx.beginPath();
//             ctx.moveTo(0, -p.size / 2);
//             ctx.lineTo(-p.size / 2, p.size / 2);
//             ctx.lineTo(p.size / 2, p.size / 2);
//             ctx.closePath();
//             ctx.fill();
//           } else if (p.shape === 'emoji') {
//             ctx.shadowBlur = 0;
//             ctx.font = `${p.size * 2}px serif`;
//             ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
//           }

//           ctx.restore();
//         });

//         updateParticles();
//         lastTime = currentTime;
//       }

//       animationFrameId = requestAnimationFrame(drawFrame);
//     }

//     function updateParticles() {
//       particles.forEach(p => {
//         p.x += p.velocityX;
//         p.y += p.velocityY;
//         p.velocityY += p.gravity;
//         p.opacity -= p.fade;
//         p.rotation += p.rotationSpeed;
//       });
//     }

//     animationFrameId = requestAnimationFrame(drawFrame);

//     // Stop after 4 seconds
//     setTimeout(() => {
//       cancelAnimationFrame(animationFrameId);
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }, 4000);
//   }

  
//     // convert price to currency
//     function convertToCurrency(price, currencyCode) {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: currencyCode
//     }).format(price);
//   }



//   //  
//   const btn = document.querySelector('#ds-checkout-btn');
//   const panel = document.querySelector('.mini-cart-order-summary-content');

//   if (btn && panel) {
//     btn.addEventListener('click', () => {
//       panel.classList.toggle('active');
//       btn.classList.toggle('active');
//     });
//   }

//   // 

//     const drawer = document.getElementById("CartDrawerPremium");
//     // if (!drawer) return;

//     const openClass = drawer.dataset.openClass || "cdp-open";
//     const linesRoot = drawer.querySelector("[data-lines]");
//     const cartCountEl = drawer.querySelector("[data-cart-count]");
//     const subtotalEl = drawer.querySelector("[data-subtotal]");
//     const totalEl = drawer.querySelector("[data-total]");
//     const offersRoot = drawer.querySelector("[data-offers]");

//     /* ================= CLOSE / OPEN ================= */
//     function openDrawer() {
//       drawer.classList.add(openClass);
//       drawer.setAttribute("aria-hidden", "false");
//       refreshUI();
//       // triggerPartyPopper();
//     }
//     function closeDrawer() {
//       drawer.classList.remove(openClass);
//       drawer.setAttribute("aria-hidden", "true");
//     }
//     drawer.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeDrawer));

//     /* ================= VERTICAL UPSELL SCROLLER ================= */
//     const vSlider = drawer.querySelector("[data-v-slider]");
//     if (vSlider) {
//       const track = vSlider.querySelector(".cdp-v-track");
//       drawer.querySelector("[data-v-prev]")?.addEventListener("click", () => track.scrollBy({ top: -120, behavior: "smooth" }));
//       drawer.querySelector("[data-v-next]")?.addEventListener("click", () => track.scrollBy({ top: +120, behavior: "smooth" }));
//     }

//     /* ================= ANNOUNCE MARQUEE ================= */
//     const marq = drawer.querySelector("[data-announce-track]");
//     if (marq) {
//       marq.addEventListener("mouseenter", () => (marq.style.animationPlayState = "paused"));
//       marq.addEventListener("mouseleave", () => (marq.style.animationPlayState = "running"));
//     }

//     /* ================= COUNTDOWN ================= */
//     const tRoot = drawer.querySelector("[data-countdown]");
//     if (tRoot) {
//       const mins = parseInt(tRoot.getAttribute("data-countdown-mins") || "15", 10);
//       const label = tRoot.querySelector("[data-countdown-time]");
//       const KEY = "cdp_countdown_deadline";
//       let deadline = parseInt(localStorage.getItem(KEY) || "0", 10);
//       const now = Date.now();
//       if (!deadline || deadline < now) {
//         deadline = now + mins * 60 * 1000; 
//         localStorage.setItem(KEY, String(deadline));
//       }
//       const tick = () => {
//         const diff = deadline - Date.now();
//         if (diff <= 0) {
//           label.textContent = "00:00";
//           return;
//         }
//         const m = Math.floor(diff / 60000),
//           s = Math.floor((diff % 60000) / 1000);
//         label.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
//         requestAnimationFrame(tick);
//       };
//       tick();
//     }

//     /* ================= AJAX HELPERS ================= */
//     const fmtMoney = (cents) => {
//       try {
//         const moneyFormat = drawer.getAttribute("data-money-format") || "${{amount}}";
//         const currencyCode = drawer.getAttribute("data-currency") || undefined;
//         const safeCents = isFinite(cents) ? cents : 0;

//         if (window.Shopify && typeof Shopify.formatMoney === "function") {
//           return Shopify.formatMoney(safeCents, moneyFormat);
//         }
//         const amount = safeCents / 100;
//         return amount.toLocaleString(undefined, {
//           style: currencyCode ? "currency" : "decimal", 
//           currency: currencyCode,
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         });
//       } catch (e) {
//         return ((cents || 0) / 100).toFixed(2);
//       }
//     };

//     const fetchCart = () =>
//       fetch("/cart.js", {
//         headers: { Accept: "application/json", "Cache-Control": "no-cache" },
//         credentials: "same-origin",
//         cache: "no-store",
//       }).then((r) => r.json());

//     const changeQty = (key, quantity) =>
//       fetch("/cart/change.js", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify({ id: key, quantity }),
//         credentials: "same-origin",
//       }).then((r) => r.json());

//     const addVariantFD = (variantId, quantity = 1, extra = {}) => {
//       const fd = new FormData();
//       fd.append("id", String(variantId));
//       fd.append("quantity", String(quantity));
//       if (extra && extra.properties) {
//         Object.keys(extra.properties).forEach((k) => {
//           fd.append(`properties[${k}]`, String(extra.properties[k]));
//         });
//       }
//       if (extra && extra.selling_plan) {
//         fd.append("selling_plan", String(extra.selling_plan));
//       }
//       return fetch("/cart/add.js", {
//         method: "POST",
//         body: fd,
//         headers: { Accept: "application/json" },
//         credentials: "same-origin",
//       }).then((r) => r.json());
//     };

//     /* ================= RENDERING ================= */
//     function truncate(str, n = 30) {
//       return str.length > n ? str.slice(0, n) + "…" : str;
//     }

//     const renderLines = (cart) => {
//       if (!linesRoot) return;
//       if (cart.items.length === 0) {
//         linesRoot.innerHTML = '<div class="cdp-empty-msg">Your cart is empty.</div>';
//         return;
//       }
//       linesRoot.innerHTML = cart.items.map((item) => `
//         <article class="cdp-line" data-line-key="${item.key}">
//           <div class="cdp-line-media">
//             <img src="${item.image ? item.image.replace(/\.(jpg|png|jpeg)/, "_180x.$1") : ""}" alt="${item.product_title}" width="90" height="90" loading="lazy">
//           </div>
//           <div class="cdp-line-info">
//             <div class="cdp-line-title">
//                 <span class="cart-item-title">${truncate(item.product_title, 35)}</span>
//             </div>
//             <div class="cdp-line-top">
//               <span class="cart-item-variant-title"> 
//                 ${item.variant_title && item.variant_title !== "Default Title" ? `<span class="cdp-line-variant">${item.variant_title} | </span>` : ""}
//                 <span class="cdp-line-prices">
//                   <span class="cdp-line-final">${fmtMoney(item.final_line_price)}</span>
//                   ${item.original_line_price > item.final_line_price ? `<span class="cdp-line-compare">${fmtMoney(item.original_line_price)}</span>` : ""}
//                 </span> | ${item.discounts?.length ? `<span class="discount">${item.discounts[0]?.title || ""}</span>` : ""}
//               </span>
//               <div class="cdp-line-bottom">
//                 <div class="cdp-qty" data-qty-wrap>
//                   <button class="cdp-qty-btn" data-qty-down>-</button>
//                   <input class="cdp-qty-input" type="number" min="0" value="${item.quantity}" data-qty>
//                   <button class="cdp-qty-btn" data-qty-up>+</button>
//                 </div>
//                 <button class="cdp-line-remove" data-remove="${item.key}" aria-label="Remove">&#x2715;</button>
//               </div>
//             </div>
//           </div>
//         </article>
//       `).join("");
//     };

//     const renderTotals = (cart) => {
//       if (cartCountEl) cartCountEl.textContent = `(${cart.item_count || 0})`;

//       const sumLines = (items) => (Array.isArray(items) ? items.reduce((a, it) => a + (Number(it.final_line_price) || 0), 0) : 0);

//       const itemsSum = sumLines(cart.items);
//       const subtotalCents = isFinite(cart.items_subtotal_price) && cart.items_subtotal_price > 0 ? cart.items_subtotal_price : itemsSum;
//       const totalCents = isFinite(cart.total_price) && cart.total_price > 0 ? cart.total_price : subtotalCents;

//       if (subtotalEl) subtotalEl.textContent = fmtMoney(subtotalCents);
//       if (totalEl) totalEl.textContent = fmtMoney(totalCents);

//       if (offersRoot) {
//         if (cart.total_discount && cart.total_discount > 0) {
//           offersRoot.innerHTML = `
//             <div class="cdp-offer-row">
//               <span class="cdp-offer-chip">Offer</span>
//               <span class="cdp-offer-text">Discounts applied</span>
//               <span class="cdp-offer-val">-${fmtMoney(cart.total_discount)}</span>
//             </div>`;
//         } else {
//           offersRoot.innerHTML = ""; // fallback: no discount
//         }
//       }
//     };

//     const refreshUI = () => fetchCart().then((cart) => {
//       renderLines(cart);
//       renderTotals(cart);
//       // console.log("cart:update", cart);

//   //     freegiftproduct(cart);
//   // // ############  free gift product api call############

//   //  async function freegiftproduct(cart) {
//   //   try {
//   //     const cart_total_price = (cart?.total_price || 0) / 100;
//   //     const shop_url = drawer.getAttribute("shop-url");
//   //     const remove_protocol = shop_url?.replace(/^https?:\/\//, '');
//   //     const freegift_api_url = `https://quickcart-vf8k.onrender.com/app/api/giftproduct?shop=${remove_protocol}`;

//   //     const response = await fetch(freegift_api_url, {
//   //       method: 'GET',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'X-Shopify-Shop-Domain': remove_protocol,
//   //         'Accept': 'application/json',
//   //       }
//   //     });

//   //     const data = await response.json();
//   //     console.log("response from api", data);

//   //     let free_product_price_range = data?.data?.price || null;
//   //     let free_gift_eligible = data?.data?.enabled || false;
//   //     let free_product_handle = data?.data?.selectedProduct?.handle || null;
//   //     async function getVarientsIdByHandle(hanlde){
//   //       try{
//   //         fetch(`/products/${hanlde}.js`, {
//   //           method: 'GET',
//   //           headers:{
//   //             "Content-Type":"application/json",
//   //             "Accept":"application/json",
//   //           }
//   //         })
//   //         .then((response)=> response.json())
//   //         .then((productData)=>{
//   //           let free_product_id = productData?.variants[0]?.id || null;
//   //           return free_product_id;
//   //         })

//   //       }catch(error){
//   //         console.log("Error fetching product by handle:", error.message);
//   //         return null;
//   //       }
        
//   //     }

//   //      getVarientsIdByHandle(free_product_handle);

//   //   } catch(error) {
//   //     console.log("Error fetching freegift product API:", error.message);
//   //   }
//   // }

//   // Call this whenever cart is updated
//   // Call this function whenever the cart updates
//   freegiftproduct(cart);

//   async function freegiftproduct(cart) {
//     try {
//       // -----------------------------
//       // 1️⃣ Cart total & currency
//       // -----------------------------
//       const cart_total_price = (cart?.total_price || 0) / 100; // major units
//       const cart_currency = cart?.currency || "USD";
//       console.log(`Cart total: ${cart_total_price.toFixed(2)} ${cart_currency}`);

//       // -----------------------------
//       // 2️⃣ Shop URL for API
//       // -----------------------------
//       const shop_url = drawer.getAttribute("shop-url");
//       const remove_protocol = shop_url?.replace(/^https?:\/\//, '');

//       // -----------------------------
//       // 3️⃣ Fetch free gift configuration from API
//       // -----------------------------
//       const freegift_api_url = `https://quickcart-vf8k.onrender.com/app/api/giftproduct?shop=${remove_protocol}`;
//       const response = await fetch(freegift_api_url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Shopify-Shop-Domain': remove_protocol,
//           'Accept': 'application/json',
//         }
//       });

//       const data = await response.json();
//       console.log("Free gift API response:", data);

//       const free_product_price_range = data?.data?.price || 0; // minor units
//       const free_gift_eligible = data?.data?.enabled || false;
//       const free_product_handle = data?.data?.selectedProduct?.handle || null;

//       // -----------------------------
//       // 4️⃣ Stop if gift is not enabled or handle is missing
//       // -----------------------------
//       if (!free_gift_eligible || !free_product_handle) return;

//       const free_price_major = free_product_price_range; // major units
//       console.log(`Free gift price threshold: ${free_price_major} ${cart_currency}`);

//       // -----------------------------
//       // 5️⃣ Check if free gift is already in cart
//       // -----------------------------
//       const free_gift_item = cart?.items?.find(item => item.handle === free_product_handle);
//       const free_gift_in_cart = !!free_gift_item;

//       // -----------------------------
//       // 6️⃣ Remove free gift if cart total is below threshold or API price changed
//       // -----------------------------
//       if ((cart_total_price < free_price_major) && free_gift_in_cart) {
//         console.log("Cart total below threshold or API price changed, removing free gift");
//         await fetch('/cart/change.js', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//           body: JSON.stringify({ id: free_gift_item.key, quantity: 0 })
//         });


//         let message_removed_gift = `
//     <div class="free-gift-message-removed" id="free-gift-message">
//       <span class="cdp-offer-text">Free gift removed from your cart! 🎁</span>
//     </div>
//   `;
//   document.querySelector('.cdp-lines')?.insertAdjacentHTML('beforebegin', message_removed_gift);
//   document.querySelector('.free-gift-message-added')?.remove();


//         return;
//       }

//       // -----------------------------
//       // 7️⃣ Add free gift if eligible and not already in cart
//       // -----------------------------
//       if ((cart_total_price >= free_price_major) && !free_gift_in_cart) {
//         const free_product_id = await getVariantIdByHandle(free_product_handle);
//         if (!free_product_id) return;

//         const addResponse = await fetch('/cart/add.js', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//           body: JSON.stringify({ id: free_product_id, quantity: 1 })
//         }).then(res => res.json());

//         console.log("✅ Free gift added to cart!", addResponse);

//       let message_added_gift = `
//     <div class="free-gift-message-added" id="free-gift-message">
//       <span class="cdp-offer-text">Free gift added to your cart! 🎁</span>
//     </div>
//   `;
//   document.querySelector('.cdp-lines')?.insertAdjacentHTML('beforebegin', message_added_gift);
//   document.querySelector('.free-gift-message-removed')?.remove();

//   triggerPartyPopper();

//         // Trigger cart drawer update event
//         document.dispatchEvent(new CustomEvent('cart:updated', { detail: addResponse }));
//         if (typeof window.updateCartDrawer === "function") {
//           window.updateCartDrawer();
//         }
//       }

//     } catch (error) {
//       console.log("Error in freegiftproduct function:", error.message);
//     }
//   }

//   // -----------------------------
//   // Helper: Get variant ID from product handle
//   // -----------------------------
//   async function getVariantIdByHandle(handle) {
//     try {
//       const response = await fetch(`/products/${handle}.js`, { method: 'GET', headers: { Accept: "application/json" } });
//       const productData = await response.json();
//       return productData?.variants?.[0]?.id || null;
//     } catch (error) {
//       console.log("Error fetching product by handle:", error.message);
//       return null;
//     }
//   }


//   // ############  free gift product api call############
//       let cart_level_discount_applications = cart?.cart_level_discount_applications[0]?.title;
//       let total_discount = cart?.total_discount / 100;
//       let total_discount_formated_price = convertToCurrency(total_discount, cart?.currency);

//       let discountEl = `Discount applied:${cart_level_discount_applications}
//                     <span class="discounted-value">-${total_discount_formated_price}</span>`;
//       if(cart_level_discount_applications){
//         document.querySelector('.discount-applied-at-cartdrawer').innerHTML = discountEl;
//         document.querySelector('.discount-applied-at-cartdrawer').style.display = 'flex';
//       } else {
//         document.querySelector('.discount-applied-at-cartdrawer').style.display = 'none';
//       }
      
//     });

//     fetchCart().then((cart) => renderTotals(cart));

//     /* ================= LINE CONTROLS ================= */
//     drawer.addEventListener("click", function (e) {
//       const down = e.target.closest("[data-qty-down]");
//       const up = e.target.closest("[data-qty-up]");
//       const rem = e.target.closest("[data-remove]");

//       if (down || up) {
//         const line = e.target.closest(".cdp-line");
//         const key = line?.getAttribute("data-line-key");
//         const input = line?.querySelector("[data-qty]");
//         if (!key || !input) return;
//         const curr = parseInt(input.value || "1",);
//         const next = Math.max(0, curr + (down ? -1 : 1));
//         changeQty(key, next).then(refreshUI);
//         e.preventDefault();
//         return;
//       }

//       if (rem) {
//         const key = rem.getAttribute("data-remove");
//         changeQty(key, 0).then(refreshUI);
//         e.preventDefault();
//         return;
//       }
//     });

//     drawer.addEventListener("change", function (e) {
//       const qtyInput = e.target.closest("[data-qty]");
//       if (!qtyInput) return;
//       const line = e.target.closest(".cdp-line");
//       const key = line?.getAttribute("data-line-key");
//       const v = Math.max(0, parseInt(qtyInput.value || "0", 10));
//       if (!key) return;
//       changeQty(key, v).then(refreshUI);
//     });

//     /* ================= UPSell ADD ================= */
//     drawer.addEventListener("click", function (e) {
//       const btn = e.target.closest("[data-upsell-add]");
//       if (!btn) return;

//       const card = btn.closest("[data-upsell-card]");
//       const sel = card?.querySelector("[data-variant-select]");
//       const variantId = sel?.value;
//       if (!variantId) return;

//       btn.disabled = true;
//       btn.setAttribute("aria-busy", "true");
//       addVariantFD(variantId, 1).then(() => refreshUI()).finally(() => {
//         btn.disabled = false;
//         btn.removeAttribute("aria-busy");
//       });
//       e.preventDefault();
//     });

//     /* ================= COUPON UX ================= */
//     const couponInput = drawer.querySelector("[data-coupon]");
//     const applyBtn = drawer.querySelector("[data-apply-coupon]");
//     const checkoutA = drawer.querySelector("[data-checkout]");
//     const discountRow = drawer.querySelector("[data-discount-row]");
//     const discountCodeEl = drawer.querySelector("[data-discount-code]");
//     const clearBtn = drawer.querySelector("[data-discount-clear]");

//     function applyDiscountCookie(code) {
//       const ifr = document.createElement("iframe");
//       ifr.style.display = "none";
//       ifr.src = `/discount/${encodeURIComponent(code)}?redirect=/cart`;
//       document.body.appendChild(ifr);
//       setTimeout(() => ifr.remove(), 4000);
//     }
//     function showDiscountRow(code) {
//       if (!discountRow) return;
//       if (discountCodeEl) discountCodeEl.textContent = code;
//       discountRow.hidden = false;
//     }
//     function hideDiscountRow() {
//       if (!discountRow) return;
//       discountRow.hidden = true;
//       if (discountCodeEl) discountCodeEl.textContent = "";
//     }
//     function setCheckoutHrefWith(code) {
//       if (checkoutA) checkoutA.setAttribute("href", `/checkout?discount=${encodeURIComponent(code)}`);
//     }

//     const savedCode = sessionStorage.getItem("cdp_discount_code");
//     if (savedCode) {
//       setCheckoutHrefWith(savedCode);
//       if (couponInput) couponInput.value = savedCode;
//       showDiscountRow(savedCode);
//     }
//     applyBtn?.addEventListener("click", () => {
//       const code = (couponInput?.value || "").trim();
//       if (!code) return;
//       sessionStorage.setItem("cdp_discount_code", code);
//       setCheckoutHrefWith(code);
//       applyDiscountCookie(code);
//       showDiscountRow(code);
//       applyBtn.textContent = "Applied";
//       setTimeout(() => (applyBtn.textContent = "Apply"), 1200);
//     });
//     clearBtn?.addEventListener("click", () => {
//       sessionStorage.removeItem("cdp_discount_code");
//       checkoutA?.setAttribute("href", `/checkout`);
//       hideDiscountRow();
//     });

//     /* ================= PUBLIC API ================= */
//     window.CartDrawerPremium = { open: openDrawer, close: closeDrawer };

//     /* ================= AJAX ADD-TO-CART (product forms) ================= */

//     document.addEventListener("submit", function (e) {
//       const form = e.target.closest('form[action*="/cart/add"],form[action="/cart/add"]');
//       if (!form) return;
//       e.preventDefault();
//       e.stopPropagation();

//       const btn = form.querySelector('button[type="submit"][name="add"], .ProductForm__AddToCart, button[type="submit"]');
//       if (btn) {
//         btn.disabled = true;
//         btn.classList.add("is-loading");
//       }
//       const fd = new FormData(form);
//       fetch(form.action, {
//         method: "POST",
//         headers: { Accept: "application/json" },
//         body: fd,
//         credentials: "same-origin",
//       }).then(() => openDrawer()).finally(() => {
//         if (btn) {
//           btn.disabled = false;
//           btn.classList.remove("is-loading");
//         }
//       });
//     });

//     /* ================= HEADER CART ICON → OPEN DRAWER ================= */
//     document.addEventListener("click", function (e) {
//       const icon = e.target.closest(".site-nav__link,  .header__icon--cart, .Header__Icon, .m-cart-icon-bubble, .navlink--cart, a[aria-label='Cart'], .header-actions__cart-icon, .header__icon");
//       if (!icon) return;
//       if (window.CartDrawerPremium && typeof window.CartDrawerPremium.open === "function") {
//         e.preventDefault();
//         e.stopPropagation();
//         window.CartDrawerPremium.open();
//         // triggerPartyPopper();
//       }
//     });

//     /* ESC to close */
//     document.addEventListener("keydown", function (e) {
//       if (e.key === "Escape") closeDrawer();
//     });

//     document.querySelector('.mobile-upsell-btn')?.addEventListener("click", function(){
//       document.querySelector('.cdp-upsell')?.classList.add("active");
//     });
//     document.querySelector('.upsell-mob-close-icon')?.addEventListener("click", function(){
//       document.querySelector('.cdp-upsell')?.classList.remove("active");
//     });
  
//   console.log("Upcart: Progressbar + Upsell Products Initialized");
//   console.log("vikas:november changes 19-11-2025 | 10:35")

//   })();

//   document.addEventListener("DOMContentLoaded", function() {
//     // Optional DOM hooks 
//   });


(function () {
  if (window.upcartInitialized) return;
  window.upcartInitialized = true;

  console.log("Upcart: Progressbar + Upsell products initialize...");

  /* ============ PARTY POPPER ============ */
  function triggerPartyPopper() {
    const canvas = document.getElementById("partyCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const originX = canvas.width / 2;
    const originY = canvas.height - 100;
    const emojis = ["🎉", "🎊", "💥", "❤️", "🤩"];
    const shapes = ["rect", "triangle", "emoji"];

    const particles = [];
    const totalParticles = 100;

    for (let i = 0; i < totalParticles; i++) {
      const angle = Math.random() * Math.PI - Math.PI;
      const speed = Math.random() * 8 + 1;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      particles.push({
        x: originX,
        y: originY,
        size: Math.random() * 6 + 4,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - 8,
        opacity: 1,
        gravity: 0.25,
        fade: Math.random() * 0.02 + 0.005,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      });
    }

    let lastTime = performance.now();
    const frameRate = 1000 / 60;
    let animationFrameId;

    function updateParticles() {
      particles.forEach((p) => {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.velocityY += p.gravity;
        p.opacity -= p.fade;
        p.rotation += p.rotationSpeed;
      });
    }

    function drawFrame(currentTime) {
      const delta = currentTime - lastTime;
      if (delta >= frameRate) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          if (p.opacity <= 0) return;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;

          if (p.shape === "rect") {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else if (p.shape === "triangle") {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === "emoji") {
            ctx.shadowBlur = 0;
            ctx.font = `${p.size * 2}px serif`;
            ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });

        updateParticles();
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(drawFrame);
    }

    animationFrameId = requestAnimationFrame(drawFrame);
    setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4000);
  }

  /* ============ UTIL: CURRENCY ============ */
  function convertToCurrency(price, currencyCode) {
    let formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode
    }).format(price);
    // Replace Rs. with ₹ symbol
    return formatted.replace(/Rs\.?/g, "₹");
  }

  /* ============ MINI CART PANEL TOGGLE ============ */
  const dsBtn = document.querySelector("#ds-checkout-btn");
  const dsPanel = document.querySelector(".mini-cart-order-summary-content");
  if (dsBtn && dsPanel) {
    dsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dsPanel.classList.toggle("active");
      dsBtn.classList.toggle("active");
    });
  }

  // Summary close button
  const summaryCloseBtn = document.querySelector("[data-close-summary]");
  if (summaryCloseBtn && dsPanel && dsBtn) {
    summaryCloseBtn.addEventListener("click", () => {
      dsPanel.classList.remove("active");
      dsBtn.classList.remove("active");
    });
  }

  // Close bill summary when clicking outside
  document.addEventListener("click", function (e) {
    if (dsPanel && dsPanel.classList.contains("active")) {
      const isClickInsidePanel = dsPanel.contains(e.target);
      const isClickOnBtn = dsBtn && dsBtn.contains(e.target);
      if (!isClickInsidePanel && !isClickOnBtn) {
        dsPanel.classList.remove("active");
        if (dsBtn) dsBtn.classList.remove("active");
      }
    }
  });

  /* ============ CORE CART DRAWER ============ */
  const drawer = document.getElementById("CartDrawerPremium");
  if (!drawer) {
    console.warn("CartDrawerPremium not found");
    return;
  }

  // Ensure cart drawer is always a direct child of body to prevent positioning issues
  // Some themes place app blocks inside main/footer/sections, which can break position:fixed
  function ensureDrawerAtBodyLevel() {
    const drawer = document.getElementById("CartDrawerPremium");
    if (!drawer) return false;
    
    // Check if drawer is not a direct child of body (could be inside main, section, footer, etc.)
    if (drawer.parentElement !== document.body) {
      const parent = drawer.parentElement;
      const parentTag = parent?.tagName || parent?.className || "unknown";
      // Move drawer to body to ensure fixed positioning works correctly
      document.body.appendChild(drawer);
      console.log("CartDrawerPremium moved from", parentTag, "to document.body for proper positioning");
      return true;
    }
    return false;
  }

  // Run immediately
  ensureDrawerAtBodyLevel();

  // Also run after DOM is fully loaded in case drawer is added dynamically
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureDrawerAtBodyLevel);
  }

  // Run after short delays to catch any late DOM manipulations
  setTimeout(ensureDrawerAtBodyLevel, 100);
  setTimeout(ensureDrawerAtBodyLevel, 500);
  setTimeout(ensureDrawerAtBodyLevel, 1000);

  // Use MutationObserver to watch for drawer being moved or added to wrong parent
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        // Check if drawer was added to a node
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && (node.id === 'CartDrawerPremium' || node.querySelector && node.querySelector('#CartDrawerPremium'))) {
            setTimeout(ensureDrawerAtBodyLevel, 50);
          }
        });
        // Check if drawer was moved
        if (drawer && drawer.parentElement !== document.body) {
          ensureDrawerAtBodyLevel();
        }
      }
    });
  });

  // Observe body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  const openClass = drawer.dataset.openClass || "cdp-open";
  const linesRoot = drawer.querySelector("[data-lines]");
  const cartCountEl = drawer.querySelector("[data-cart-count]");
  const subtotalEl = drawer.querySelector("[data-subtotal]");
  const totalEl = drawer.querySelector("[data-total]");
  const offersRoot = drawer.querySelector("[data-offers]");
  
  // Store free gift product handle globally to identify free gift items
  let freeGiftProductHandle = null;


  function lockBodyScroll() {
  // Prevent double-adding the lock
  if (document.body.classList.contains("drawer-open")) return;

  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.body.classList.add("drawer-open");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  // prevent layout shift caused by hidden scrollbar
  if (scrollBarWidth > 0) {
    document.documentElement.style.paddingRight = scrollBarWidth + "px";
    document.body.style.paddingRight = scrollBarWidth + "px";
  }

}

function unlockBodyScroll() {
  document.body.classList.remove("drawer-open");

  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";

  // reset padding
  document.documentElement.style.paddingRight = "";
  document.body.style.paddingRight = "";

  
}



  function openDrawer() {
    // Show loader briefly when opening drawer
    if (window.upcart_loader) window.upcart_loader(true);
    
    drawer.classList.add(openClass);
    drawer.setAttribute("aria-hidden", "false");
    refreshUI().finally(() => {
      // Hide loader after drawer opens and UI refreshes
      if (window.upcart_loader) window.upcart_loader(false);
    });
    lockBodyScroll();
  }
 
  function closeDrawer() {
    drawer.classList.remove(openClass);
    drawer.setAttribute("aria-hidden", "true");
    unlockBodyScroll();
  }

  drawer.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeDrawer)
  );

  /* ============ VERTICAL UPSELL SCROLLER ============ */
  const vSlider = drawer.querySelector("[data-v-slider]");
  if (vSlider) {
    const track = vSlider.querySelector(".cdp-v-track");
    drawer
      .querySelector("[data-v-prev]")
      ?.addEventListener("click", () =>
        track.scrollBy({ top: -120, behavior: "smooth" })
      );
    drawer
      .querySelector("[data-v-next]")
      ?.addEventListener("click", () =>
        track.scrollBy({ top: 120, behavior: "smooth" })
      );
  }

  /* ============ ANNOUNCEMENT MARQUEE ============ */
  const marq = drawer.querySelector("[data-announce-track]");
  if (marq) {
    marq.addEventListener("mouseenter", () => {
      marq.style.animationPlayState = "paused";
    });
    marq.addEventListener("mouseleave", () => {
      marq.style.animationPlayState = "running";
    });
  }

  /* ============ COUNTDOWN TIMER ============ */
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
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      label.textContent =
        (m < 10 ? "0" : "") +
        m +
        ":" +
        (s < 10 ? "0" : "") +
        s;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ============ AJAX HELPERS ============ */
  const fmtMoney = (cents) => {
    try {
      const moneyFormat = drawer.getAttribute("data-money-format") || "${{amount}}";
      const currencyCode = drawer.getAttribute("data-currency") || undefined;
      const safeCents = isFinite(cents) ? cents : 0;
      let result;

      if (window.Shopify && typeof Shopify.formatMoney === "function") {
        result = Shopify.formatMoney(safeCents, moneyFormat);
      } else {
        const amount = safeCents / 100;
        result = amount.toLocaleString(undefined, {
          style: currencyCode ? "currency" : "decimal",
          currency: currencyCode,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
      // Replace Rs. with ₹ symbol
      return result.replace(/Rs\.?/g, "₹");
    } catch (e) {
      return ((cents || 0) / 100).toFixed(2);
    }
  };

  const fetchCart = () =>
    fetch("/cart.js", {
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      credentials: "same-origin",
      cache: "no-store"
    }).then((r) => r.json());

  const changeQty = (key, quantity) => {
    // Show loader when changing quantity
    if (window.upcart_loader) window.upcart_loader(true);
    
    return fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity }),
      credentials: "same-origin"
    }).then((r) => r.json()).finally(() => {
      // Hide loader after quantity change completes
      if (window.upcart_loader) window.upcart_loader(false);
    });
  };

  const addVariantFD = (variantId, quantity = 1, extra = {}) => {
    // Show loader when adding variant
    if (window.upcart_loader) window.upcart_loader(true);
    
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
      credentials: "same-origin"
    }).then((r) => r.json()).finally(() => {
      // Hide loader after add completes
      if (window.upcart_loader) window.upcart_loader(false);
    });
  };

  /* ============ RENDERING ============ */
  function truncate(str, n = 30) {
    if (!str) return "";
    return str.length > n ? str.slice(0, n) + "…" : str;
  }

  const renderLines = (cart) => {
    if (!linesRoot) return;
    if (!cart.items || cart.items.length === 0) {
      linesRoot.innerHTML = '<div class="cdp-empty-msg">Your cart is empty.</div>';
      return;
    }
    linesRoot.innerHTML = cart.items
      .map(
        (item) => {
          // Check if this item is the free gift product
          const isFreeGift = freeGiftProductHandle && item.handle === freeGiftProductHandle;
          
          return `
      <article class="cdp-line" data-line-key="${item.key}" ${isFreeGift ? 'data-free-gift="true"' : ''}>
        <div class="cdp-line-media">
          <img src="${
            item.image ? item.image.replace(/\.(jpg|png|jpeg)/, "_180x.$1") : ""
          }" alt="${item.product_title}" width="90" height="90" loading="lazy">
        </div>
        <div class="cdp-line-info">
          <div class="cdp-line-title">
            <span class="cart-item-title">${truncate(item.product_title, 35)}</span>
            ${isFreeGift ? '<span class="free-gift-badge" style="display: inline-block; margin-left: 8px; padding: 2px 8px; background: #e8f5e9; color: #2e7d32; border-radius: 12px; font-size: 11px; font-weight: 600;">FREE GIFT</span>' : ''}
          </div>
          <div class="cdp-line-top">
            <span class="cart-item-variant-title">
              ${
                item.variant_title && item.variant_title !== "Default Title"
                  ? `<span class="cdp-line-variant">${item.variant_title} </span>`
                  : ""
              }
              <span class="cdp-line-prices">
                <span class="cdp-line-final">${isFreeGift ? 'FREE' : fmtMoney(item.final_line_price)}</span>
                ${
                  item.original_line_price > item.final_line_price && !isFreeGift
                    ? `<span class="cdp-line-compare">${fmtMoney(
                        item.original_line_price
                      )}</span>`
                    : ""
                }
              </span>  ${
                item.discounts?.length && !isFreeGift
                  ? `|<span class="discount">${item.discounts[0]?.title || ""}</span>`
                  : ""
              }
            </span>
            <div class="cdp-line-bottom">
              <div class="cdp-qty" data-qty-wrap ${isFreeGift ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                <button class="cdp-qty-btn" data-qty-down ${isFreeGift ? 'disabled style="cursor: not-allowed;"' : ''}>-</button>
                <input class="cdp-qty-input" type="number" min="0" value="${
                  item.quantity
                }" data-qty ${isFreeGift ? 'readonly disabled style="cursor: not-allowed;"' : ''}>
                <button class="cdp-qty-btn" data-qty-up ${isFreeGift ? 'disabled style="cursor: not-allowed;"' : ''}>+</button>
              </div>
              <button class="cdp-line-remove" data-remove="${item.key}" aria-label="Remove" ${isFreeGift ? 'disabled style="opacity: 0.5; cursor: not-allowed; pointer-events: none;"' : ''}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </div>
          </div>
        </div>
      </article>
    `;
        }
      )
      .join("");
  };

  const renderTotals = (cart) => {
    if (cartCountEl) cartCountEl.textContent = `(${cart.item_count || 0})`;

    const sumLines = (items) =>
      Array.isArray(items)
        ? items.reduce((a, it) => a + (Number(it.final_line_price) || 0), 0)
        : 0;

    const itemsSum = sumLines(cart.items);
    const subtotalCents =
      isFinite(cart.items_subtotal_price) && cart.items_subtotal_price > 0
        ? cart.items_subtotal_price
        : itemsSum;
    const totalCents =
      isFinite(cart.total_price) && cart.total_price > 0
        ? cart.total_price
        : subtotalCents;

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
        offersRoot.innerHTML = "";
      }
    }
  };

  /* ============ FREE GIFT LOGIC (STRICT) ============ */
  async function getVariantIdByHandle(handle) {
    try {
      const response = await fetch(`/products/${handle}.js`, {
        method: "GET",
        headers: { Accept: "application/json" }
      });
      const productData = await response.json();
      return productData?.variants?.[0]?.id || null;
    } catch (error) {
      console.log("Error fetching product by handle:", error.message);
      return null;
    }
  }

  async function handleFreeGift(cart) {
    try {
      const cart_total_price = (cart?.total_price || 0) / 100;
      const cart_currency = cart?.currency || "USD";

      const shop_url = drawer.getAttribute("shop-url");
      if (!shop_url) return;
      const remove_protocol = shop_url.replace(/^https?:\/\//, "");

      const freegift_api_url = `https://quickcart-vf8k.onrender.com/app/api/giftproduct?shop=${remove_protocol}`;
      const response = await fetch(freegift_api_url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": remove_protocol,
          Accept: "application/json"
        }
      });

      const data = await response.json();
      const free_price_threshold = Number(data?.data?.price || 0); // assume major units (e.g. 999)
      const free_gift_eligible = !!data?.data?.enabled;
      const free_product_handle = data?.data?.selectedProduct?.handle || null;

      // Store free gift handle globally for use in rendering and event handlers
      freeGiftProductHandle = free_gift_eligible && free_product_handle ? free_product_handle : null;

      if (!free_gift_eligible || !free_product_handle || !free_price_threshold) {
        return;
      }

      const free_gift_item = cart?.items?.find(
        (item) => item.handle === free_product_handle
      );
      const free_gift_in_cart = !!free_gift_item;

      // BELOW threshold → remove gift if present
      if (cart_total_price < free_price_threshold && free_gift_in_cart) {
        await fetch("/cart/change.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({ id: free_gift_item.key, quantity: 0 })
        });

        const linesContainer = document.querySelector(".cdp-lines");
        if (linesContainer) {
          const msg = document.createElement("div");
          msg.className = "free-gift-message-removed";
          msg.id = "free-gift-message";
          msg.innerHTML='';
          // msg.innerHTML =
          //   '<span class="cdp-offer-text">Free gift removed from your cart! 🎁</span>';
          linesContainer.insertAdjacentElement("beforebegin", msg);
        }
        document.querySelector(".free-gift-message-added")?.remove();
        
        // Refresh UI to show updated cart without free gift
        await refreshUI();
        return;
      }

      // ABOVE threshold → ensure gift is present, quantity = 1
      if (cart_total_price >= free_price_threshold) {
        // If free gift is already in cart but quantity is not 1, fix it
        if (free_gift_in_cart && free_gift_item.quantity !== 1) {
          await fetch("/cart/change.js", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({ id: free_gift_item.key, quantity: 1 })
          });
          await refreshUI();
          return;
        }
        
        // If free gift is not in cart, add it
        if (!free_gift_in_cart) {
          const free_product_id = await getVariantIdByHandle(free_product_handle);
          if (!free_product_id) return;

          const addResponse = await fetch("/cart/add.js", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({ id: free_product_id, quantity: 1 })
          }).then((res) => res.json());

          console.log("✅ Free gift added to cart!", addResponse);

          // Refresh UI to show the newly added free gift product
          await refreshUI();

          const linesContainer = document.querySelector(".cdp-lines");
          if (linesContainer) {
            const msg = document.createElement("div");
            msg.className = "free-gift-message-added";
            msg.id = "free-gift-message";
            msg.innerHTML='';
            // msg.innerHTML =
            //   '<span class="cdp-offer-text">Free gift added to your cart! 🎁</span>';
            linesContainer.insertAdjacentElement("beforebegin", msg);
          }
          document.querySelector(".free-gift-message-removed")?.remove();
          triggerPartyPopper();

          document.dispatchEvent(
            new CustomEvent("cart:updated", { detail: addResponse })
          );
          if (typeof window.updateCartDrawer === "function") {
            window.updateCartDrawer();
          }
        }
      }
    } catch (error) {
      console.log("Error in handleFreeGift:", error.message);
    }
  }

  /* ============ CART LEVEL DISCOUNT ROW ============ */
  function handleCartDiscountRow(cart) {
    try {
      const title = cart?.cart_level_discount_applications?.[0]?.title;
      const total_discount = (cart?.total_discount || 0) / 100;
      const currency = cart?.currency || "INR";
      const target = document.querySelector(".discount-applied-at-cartdrawer");
      if (!target) return;

      if (title && total_discount > 0) {
        const formatted = convertToCurrency(total_discount, currency);
        target.innerHTML = `Discount applied: ${title}
          <span class="discounted-value">-${formatted}</span>`;
        target.style.display = "flex";
      } else {
        target.style.display = "none";
      }
    } catch (e) {
      console.log("Error in handleCartDiscountRow:", e.message);
    }
  }

  /* ============ MAIN REFRESH ============ */
  const refreshUI = () => {
    // Show loader when refreshing cart
    if (window.upcart_loader) window.upcart_loader(true);
    
    return fetchCart().then(async (cart) => {
      renderLines(cart);
      renderTotals(cart);
      handleCartDiscountRow(cart);
      await handleFreeGift(cart);
    }).finally(() => {
      // Hide loader after refresh completes
      if (window.upcart_loader) window.upcart_loader(false);
    });
  };

  // initial totals (no need to render lines)
  fetchCart().then((cart) => renderTotals(cart));

  /* ============ LINE CONTROLS ============ */
  drawer.addEventListener("click", function (e) {
    const down = e.target.closest("[data-qty-down]");
    const up = e.target.closest("[data-qty-up]");
    const rem = e.target.closest("[data-remove]");

    if (down || up) {
      const line = e.target.closest(".cdp-line");
      const key = line?.getAttribute("data-line-key");
      const input = line?.querySelector("[data-qty]");
      if (!key || !input) return;
      
      // Prevent quantity changes for free gift items
      if (line?.hasAttribute("data-free-gift")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      const curr = parseInt(input.value || "1", 10);
      const next = Math.max(0, curr + (down ? -1 : 1));
      changeQty(key, next).then(refreshUI);
      e.preventDefault();
      return;
    }

    if (rem) {
      const line = rem.closest(".cdp-line");
      // Prevent removal of free gift items
      if (line?.hasAttribute("data-free-gift")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      const key = rem.getAttribute("data-remove");
      changeQty(key, 0).then(refreshUI);
      e.preventDefault();
    }
  });

  drawer.addEventListener("change", function (e) {
    const qtyInput = e.target.closest("[data-qty]");
    if (!qtyInput) return;
    const line = e.target.closest(".cdp-line");
    
    // Prevent quantity changes for free gift items
    if (line?.hasAttribute("data-free-gift")) {
      // Reset quantity to 1 if user tries to change it
      qtyInput.value = 1;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    const key = line?.getAttribute("data-line-key");
    const v = Math.max(0, parseInt(qtyInput.value || "0", 10));
    if (!key) return;
    changeQty(key, v).then(refreshUI);
  });

  /* ============ UPSELL ADDED NOTIFICATION ============ */
  function showUpsellNotification(productName = "Product") {
    // Remove any existing notification
    const existing = document.querySelector('.cdp-upsell-notification');
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cdp-upsell-notification';
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span>${productName} added to cart!</span>
    `;

    document.body.appendChild(notification);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.classList.add('hiding');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /* ============ UPSELL ADD BUTTONS ============ */
  drawer.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-upsell-add]");
    if (!btn) return;

    const card = btn.closest("[data-upsell-card]");
    const sel = card?.querySelector("[data-variant-select]");
    const variantId = sel?.value;
    if (!variantId) return;

    // Get product name for notification
    const productName = card?.querySelector(".cdp-u-title")?.textContent?.trim() || "Product";

    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    addVariantFD(variantId, 1)
      .then(() => {
        showUpsellNotification(productName);
        return refreshUI();
      })
      .finally(() => {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
      });
    e.preventDefault();
  });

  /* ============ COUPON UX ============ */
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

  /* ============ PUBLIC API ============ */
  window.CartDrawerPremium = { open: openDrawer, close: closeDrawer };

  /* ============ ADD-TO-CART INTERCEPT (DEBOUNCED) ============ */
  let atcBusy = false;
  
  // Ensure we only attach the handler once to prevent duplicates
  if (!window.__upcartSubmitHandlerAttached) {
    window.__upcartSubmitHandlerAttached = true;
    
    document.addEventListener("submit", function (e) {
      const form = e.target.closest('form[action*="/cart/add"], form[action="/cart/add"]');
      if (!form) return;

      // Prevent default immediately to stop theme's native handler
      e.preventDefault();
      e.stopImmediatePropagation();

      if (atcBusy) {
        console.warn("ATC ignored due to debounce");
        return false;
      }
      atcBusy = true;

      const btn =
        form.querySelector('button[type="submit"][name="add"], .ProductForm__AddToCart, button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.classList.add("is-loading");
      }

      // Extract quantity from form - check multiple possible locations
      let quantity = 1;
      const quantityInput = form.querySelector('input[name="quantity"], input[type="number"][name*="quantity"], .quantity-input, [data-quantity-input]');
      if (quantityInput) {
        const qtyValue = parseInt(quantityInput.value, 10);
        if (!isNaN(qtyValue) && qtyValue > 0) {
          quantity = qtyValue;
        }
      }

      // Create FormData and ensure quantity is set correctly (not duplicated)
      const fd = new FormData(form);
      
      // Remove any existing quantity entries to avoid duplication
      fd.delete('quantity');
      // Set the correct quantity
      fd.set('quantity', String(quantity));
      
      // Ensure variant ID is present
      const variantId = fd.get('id') || form.querySelector('input[name="id"]')?.value;
      if (!variantId) {
        console.error("No variant ID found in form");
        atcBusy = false;
        if (btn) {
          btn.disabled = false;
          btn.classList.remove("is-loading");
        }
        return false;
      }

      // Show loader when adding to cart from form
      if (window.upcart_loader) window.upcart_loader(true);

      fetch(form.action || "/cart/add.js", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
        credentials: "same-origin"
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          openDrawer();
          return refreshUI();
        })
        .catch((err) => {
          console.error("Add to cart error", err);
          // Show error to user if possible
          if (btn) {
            btn.textContent = "Error - Try Again";
            setTimeout(() => {
              if (btn) btn.textContent = btn.getAttribute('data-original-text') || 'Add to cart';
            }, 2000);
          }
        })
        .finally(() => {
          // Hide loader after add to cart completes
          if (window.upcart_loader) window.upcart_loader(false);
          if (btn) {
            btn.disabled = false;
            btn.classList.remove("is-loading");
          }
          // small delay to avoid ultra-fast double click
          setTimeout(() => {
            atcBusy = false;
          }, 800);
        });
      
      return false;
    }, true); // Use capture phase to intercept early
  }

  /* ============ HEADER CART ICON OPENER ============ */
  document.addEventListener("click", function (e) {
    // Comprehensive list of cart icon selectors to support all themes
    const cartIconSelectors = [
      ".header__cart-icon",                    // Specific theme
      ".header__icon--cart",                   // Dawn theme and variants
      ".m-cart-icon-bubble",                   // Mobile cart icon
      ".navlink--cart",                        // Navigation cart link
      "a[aria-label='Cart']",                  // Accessible cart link
      "a[aria-label='cart']",                   // Lowercase variant
      ".header-actions__cart-icon",            // Header actions cart
      "a[href*='/cart']",                      // Any link to cart page
      ".cart-icon",                            // Generic cart icon
      ".header__icon",                         // Generic header icon (if it's a cart link)
      ".site-nav__link[href*='cart']",         // Site nav cart link
      ".Header__Icon[href*='cart']",           // Header icon with cart href
      "[data-cart-icon]",                      // Data attribute cart icon
      "[data-cart-toggle]",                    // Cart toggle button
      ".cart-toggle",                          // Cart toggle class
      ".cart-link",                            // Cart link class
      ".header__cart",                         // Header cart
      "#cart-icon",                            // ID selector
      ".icon-cart",                            // Icon cart class
      ".cart-count-wrapper",                   // Cart count wrapper (often clickable)
      ".cart-bubble",                          // Cart bubble
      ".cart-drawer-toggle"                    // Cart drawer toggle
    ].join(", ");
    
    const icon = e.target.closest(cartIconSelectors);
    
    // Additional check: if clicked element or parent has cart-related href
    if (!icon) {
      const link = e.target.closest("a");
      if (link && (link.href.includes("/cart") || link.getAttribute("href")?.includes("/cart"))) {
        const icon = link;
        if (window.CartDrawerPremium && typeof window.CartDrawerPremium.open === "function") {
          e.preventDefault();
          e.stopPropagation();
          window.CartDrawerPremium.open();
        }
        return;
      }
      return;
    }
    
    if (window.CartDrawerPremium && typeof window.CartDrawerPremium.open === "function") {
      e.preventDefault();
      e.stopPropagation();
      window.CartDrawerPremium.open();
    }
  });

  /* ============ ESCAPE KEY ============ */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ============ MOBILE UPSELL TOGGLE ============ */
  document.querySelector(".mobile-upsell-btn")?.addEventListener("click", function () {
    document.querySelector(".cdp-upsell")?.classList.add("active");
  });
  document.querySelector(".upsell-mob-close-icon")?.addEventListener("click", function () {
    document.querySelector(".cdp-upsell")?.classList.remove("active");
  });

  /* ============ UPSELL POPUP FUNCTIONALITY ============ */
  const upsellPopup = document.getElementById("upsellPopup");
  const popupProductImage = document.getElementById("popupProductImage");
  const popupProductImage2 = document.getElementById("popupProductImage2");
  const popupProductTitle = document.getElementById("popupProductTitle");
  const popupProductPrice = document.getElementById("popupProductPrice");
  const popupProductCompare = document.getElementById("popupProductCompare");
  const popupQtyInput = document.getElementById("popupQty");
  const popupAddBtn = document.getElementById("popupAddBtn");
  const popupViewBtn = document.getElementById("popupViewBtn");
  const popupVariantsWrap = document.getElementById("popupVariantsWrap");
  const popupVariantBtns = document.getElementById("popupVariantBtns");

  // Store current product data for variant changes
  let currentProductData = null;
  let currentSelectedOptions = {}; // Track selected options for current product

  // Function to format price with HTML support and trailing zero removal
  function formatPriceWithHTML(price, moneyFormat, drawerEl) {
    let formattedPrice = "";
    
    if (window.Shopify && typeof Shopify.formatMoney === "function") {
      formattedPrice = Shopify.formatMoney(price, moneyFormat);
      
      // Check if the result contains HTML tags
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = formattedPrice;
      const hasHTML = tempDiv.children.length > 0;
      
      if (hasHTML) {
        // If HTML, remove trailing zeros from text content but keep HTML structure
        const walker = document.createTreeWalker(
          tempDiv,
          NodeFilter.SHOW_TEXT,
          null
        );
        let node;
        while (node = walker.nextNode()) {
          node.textContent = node.textContent.replace(/\.00$/, "").replace(/\.0$/, "");
        }
        formattedPrice = tempDiv.innerHTML;
      } else {
        // If plain text, remove trailing zeros
        formattedPrice = formattedPrice.replace(/\.00$/, "").replace(/\.0$/, "");
      }
    } else {
      // Fallback: format like Liquid would
      const priceAmount = price / 100;
      formattedPrice = priceAmount.toLocaleString("en-IN", { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      });
      const currency = drawerEl?.getAttribute("data-currency") || "INR";
      if (currency === "INR") {
        formattedPrice = "₹" + formattedPrice;
      }
    }
    
    // Replace Rs. with ₹ symbol
    formattedPrice = formattedPrice.replace(/Rs\.?/g, "₹");
    
    return formattedPrice;
  }

  // Function to find variant based on selected options
  function findVariantByOptions(productData, selectedOptions) {
    return productData.variants.find(variant => {
      return productData.options.every((option, index) => {
        return variant.options[index] === selectedOptions[option.name];
      });
    });
  }

  // Function to update variant selection and UI
  function updateVariantSelection(productData, selectedOptions, targetVariant, moneyFormat, drawerEl) {
    if (!productData || !selectedOptions) return;
    
    // Find the matching variant
    let selectedVariant = targetVariant;
    if (!selectedVariant) {
      selectedVariant = findVariantByOptions(productData, selectedOptions);
    }
    
    if (!selectedVariant) {
      // Try to find first available variant with selected options
      selectedVariant = productData.variants.find(v => {
        if (!v.available) return false;
        return productData.options.every((option, index) => {
          return v.options[index] === selectedOptions[option.name];
        });
      });
    }
    
    // If still no variant found, try to find any available variant that matches most options
    if (!selectedVariant) {
      selectedVariant = productData.variants.find(v => v.available) || productData.variants[0];
      // Update selectedOptions to match the found variant
      if (selectedVariant && selectedVariant.options) {
        productData.options.forEach((option, index) => {
          if (selectedVariant.options[index]) {
            selectedOptions[option.name] = selectedVariant.options[index];
          }
        });
      }
    }
    
    if (!selectedVariant) return;
    
    // Update active buttons for each option
    Object.keys(selectedOptions).forEach(optionName => {
      const selectedValue = selectedOptions[optionName];
      const buttons = document.querySelectorAll(
        `.cdp-variant-option-btn[data-option-name="${optionName}"]`
      );
      buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.optionValue === selectedValue) {
          btn.classList.add('active');
        }
      });
    });
    
    // Format prices with HTML support
    const formattedPrice = formatPriceWithHTML(selectedVariant.price, moneyFormat, drawerEl);
    let formattedComparePrice = "";
    
    if (selectedVariant.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price) {
      formattedComparePrice = formatPriceWithHTML(selectedVariant.compare_at_price, moneyFormat, drawerEl);
    }
    
    // Update price display using innerHTML to support HTML
    if (popupProductPrice) {
      popupProductPrice.innerHTML = formattedPrice;
    }
    
    if (popupProductCompare) {
      if (formattedComparePrice && formattedComparePrice !== "") {
        popupProductCompare.innerHTML = formattedComparePrice;
        popupProductCompare.style.display = "inline";
      } else {
        popupProductCompare.style.display = "none";
      }
    }
    
    // Update variant ID for add button
    if (popupAddBtn) {
      popupAddBtn.dataset.variantId = selectedVariant.id;
    }
    
    // Update image if variant has different image
    if (popupProductImage && selectedVariant.featured_image) {
      popupProductImage.src = selectedVariant.featured_image.src || productData.featured_image;
    }
    
    // Store current selected options
    currentSelectedOptions = { ...selectedOptions };
  }

  // Format price for popup using Shopify money format
  function formatPopupPrice(cents) {
    try {
      // Get money format from drawer element (same as fmtMoney function)
      const drawerEl = document.getElementById("CartDrawerPremium");
      const moneyFormat = drawerEl?.getAttribute("data-money-format") || "${{amount}}";
      const currencyCode = drawerEl?.getAttribute("data-currency") || undefined;
      const safeCents = isFinite(cents) ? cents : 0;
      let result;

      if (window.Shopify && typeof Shopify.formatMoney === "function") {
        result = Shopify.formatMoney(safeCents, moneyFormat);
      } else {
        const amount = safeCents / 100;
        result = amount.toLocaleString(undefined, {
          style: currencyCode ? "currency" : "decimal",
          currency: currencyCode,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        });
      }
      // Replace Rs. with ₹ symbol
      return result.replace(/Rs\.?/g, "₹");
    } catch (e) {
      return "₹" + ((cents || 0) / 100).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
  }

  // Handle variant option button click
  function handleVariantOptionClick(btn) {
    if (!btn || !currentProductData) return;
    
    const optionName = btn.dataset.optionName;
    const optionValue = btn.dataset.optionValue;
    
    if (!optionName || !optionValue) return;
    
    // Update selected option
    currentSelectedOptions[optionName] = optionValue;
    
    // Get money format
    const drawerEl = document.getElementById("CartDrawerPremium");
    const moneyFormat = drawerEl?.getAttribute("data-money-format") || "${{amount}}";
    
    // Update variant selection
    updateVariantSelection(currentProductData, currentSelectedOptions, null, moneyFormat, drawerEl);
  }

  // Open popup when clicking Add button on upsell card
  drawer.addEventListener("click", async function (e) {
    const openBtn = e.target.closest("[data-open-upsell-popup]");
    if (!openBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const productTitle = openBtn.dataset.productTitle;
    const productImage = openBtn.dataset.productImage;
    const productPrice = openBtn.dataset.productPrice;
    const productComparePrice = openBtn.dataset.productComparePrice;
    const productUrl = openBtn.dataset.productUrl;
    const variantId = openBtn.dataset.variantId;
    const productHandle = openBtn.dataset.productHandle;
    const hasVariants = openBtn.dataset.hasVariants === "true";

    // Populate popup with initial data from Liquid (server-side formatted)
    if (popupProductImage) popupProductImage.src = productImage;
    if (popupProductImage2) popupProductImage2.src = productImage; // Initially same image
    if (popupProductTitle) popupProductTitle.textContent = productTitle;
    // Use Liquid-formatted price directly (from data-product-price attribute)
    // Product prices from Liquid might contain HTML, so use innerHTML
    if (popupProductPrice) popupProductPrice.innerHTML = productPrice || "";
    if (popupProductCompare) {
      popupProductCompare.innerHTML = productComparePrice || "";
      popupProductCompare.style.display = productComparePrice ? "inline" : "none";
    }
    if (popupQtyInput) popupQtyInput.value = 1;
    if (popupAddBtn) popupAddBtn.dataset.variantId = variantId;
    if (popupViewBtn) popupViewBtn.dataset.productUrl = productUrl;

    // Always fetch product data to get all images
    if (productHandle) {
      try {
        const res = await fetch(`/products/${productHandle}.js`, {
          headers: { Accept: "application/json" }
        });
        const productData = await res.json();
        currentProductData = productData;

        // Set both images from product images array
        if (productData.images && productData.images.length > 0) {
          if (popupProductImage) popupProductImage.src = productData.images[0];
          if (popupProductImage2) {
            // Use second image if available, otherwise use first image
            popupProductImage2.src = productData.images[1] || productData.images[0];
            // Hide second image if only one image available
            popupProductImage2.style.display = productData.images.length > 1 ? "block" : "none";
          }
        }

        // Find the initial variant (use variantId from button, or first available)
        const initialVariantId = variantId ? parseInt(variantId) : null;
        const initialVariant = productData.variants.find(v => 
          (initialVariantId && v.id === initialVariantId) || 
          (!initialVariantId && v.available)
        ) || productData.variants.find(v => v.available) || productData.variants[0];

        // Keep Liquid-formatted price (already set from data-product-price)
        // Only update if the initial variant is different from the one in Liquid
        // Format using Liquid's money_without_trailing_zeros format when needed
        if (initialVariant) {
          // Only update price if variant changed from what Liquid set
          if (initialVariant.id !== parseInt(variantId || 0)) {
            // Variant changed, format price using Liquid's {{ price | money_without_trailing_zeros }} format
            const drawerEl = document.getElementById("CartDrawerPremium");
            const moneyFormat = drawerEl?.getAttribute("data-money-format") || "${{amount}}";
            
            if (popupProductPrice) {
              const formattedPrice = formatPriceWithHTML(initialVariant.price, moneyFormat, drawerEl);
              popupProductPrice.innerHTML = formattedPrice;
            }
            
            if (popupProductCompare) {
              if (initialVariant.compare_at_price && initialVariant.compare_at_price > initialVariant.price) {
                const formattedComparePrice = formatPriceWithHTML(initialVariant.compare_at_price, moneyFormat, drawerEl);
                popupProductCompare.innerHTML = formattedComparePrice;
                popupProductCompare.style.display = "inline";
              } else {
                popupProductCompare.style.display = "none";
              }
            }
          }
          // Always update variant ID for add button
          if (popupAddBtn) {
            popupAddBtn.dataset.variantId = initialVariant.id;
          }
        }

        // Handle variants - Group by option name
        const popupVariantOptions = document.getElementById("popupVariantOptions");
        if (hasVariants && popupVariantsWrap && popupVariantOptions) {
          popupVariantsWrap.style.display = "block";

          // Using Shopify.formatMoney with shop.money_format (same as Liquid's {{ price | money_without_trailing_zeros }})
          const drawerEl = document.getElementById("CartDrawerPremium");
          const moneyFormat = drawerEl?.getAttribute("data-money-format") || "${{amount}}";
          
          // Group variants by option
          const optionGroups = {};
          const selectedOptions = {}; // Track selected option for each option name
          
          // Initialize selected options with first available variant
          if (initialVariant && initialVariant.options) {
            productData.options.forEach((option, index) => {
              if (initialVariant.options[index]) {
                selectedOptions[option.name] = initialVariant.options[index];
              }
            });
          }
          
          // Group variants by option values
          productData.options.forEach((option, optionIndex) => {
            const optionName = option.name;
            const uniqueValues = [...new Set(productData.variants
              .filter(v => v.available)
              .map(v => v.options[optionIndex])
            )];
            
            optionGroups[optionName] = {
              name: optionName,
              values: uniqueValues,
              index: optionIndex
            };
          });
          
          // Generate HTML for each option group
          let variantOptionsHTML = '';
          
          Object.keys(optionGroups).forEach(optionName => {
            const optionGroup = optionGroups[optionName];
            const selectedValue = selectedOptions[optionName] || optionGroup.values[0];
            
            variantOptionsHTML += `
              <div class="cdp-popup-variant-group" data-option-name="${optionName}" data-option-index="${optionGroup.index}">
                <label class="cdp-popup-variant-label">${optionName}:</label>
                <div class="cdp-popup-variant-btns">
            `;
            
            optionGroup.values.forEach(value => {
              // Find a variant with this option value to get price info
              const sampleVariant = productData.variants.find(v => 
                v.options[optionGroup.index] === value && v.available
              );
              
              const isSelected = value === selectedValue;
              
              variantOptionsHTML += `
                <button 
                  type="button"
                  class="cdp-variant-option-btn ${isSelected ? 'active' : ''}" 
                  data-option-name="${optionName}"
                  data-option-value="${value}"
                  data-option-index="${optionGroup.index}"
                >${value}</button>
              `;
            });
            
            variantOptionsHTML += `
                </div>
              </div>
            `;
          });
          
          popupVariantOptions.innerHTML = variantOptionsHTML;
          
          // Update currentSelectedOptions to match selectedOptions
          currentSelectedOptions = { ...selectedOptions };
          
          // Set initial variant selection
          updateVariantSelection(productData, selectedOptions, initialVariant, moneyFormat, drawerEl);
        } else {
          // No variants - hide variant selector
          if (popupVariantsWrap) popupVariantsWrap.style.display = "none";
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        if (popupVariantsWrap) popupVariantsWrap.style.display = "none";
        currentProductData = null;
        // Keep the initial price from data attribute if fetch fails
      }
    } else {
      if (popupVariantsWrap) popupVariantsWrap.style.display = "none";
      currentProductData = null;
      // No product handle - use initial price from data attribute as fallback
    }

    // Show popup
    if (upsellPopup) upsellPopup.style.display = "flex";
  });

  // Handle variant option button clicks (event delegation)
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".cdp-variant-option-btn");
    if (btn && currentProductData) {
      handleVariantOptionClick(btn);
    }
  });

  // Close popup when clicking close button or overlay
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-close-popup]")) {
      if (upsellPopup) upsellPopup.style.display = "none";
    }
  });

  // Close popup when clicking outside popup content
  if (upsellPopup) {
    upsellPopup.addEventListener("click", function (e) {
      // If click is directly on the popup container (not on content inside)
      if (e.target === upsellPopup || e.target.classList.contains("cdp-popup-overlay")) {
        upsellPopup.style.display = "none";
      }
    });
  }

  // Popup quantity controls
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-popup-qty-down]")) {
      if (popupQtyInput) {
        const currentVal = parseInt(popupQtyInput.value) || 1;
        if (currentVal > 1) popupQtyInput.value = currentVal - 1;
      }
    }
    if (e.target.closest("[data-popup-qty-up]")) {
      if (popupQtyInput) {
        const currentVal = parseInt(popupQtyInput.value) || 1;
        popupQtyInput.value = currentVal + 1;
      }
    }
  });

  // Add to cart from popup
  if (popupAddBtn) {
    popupAddBtn.addEventListener("click", async function () {
      const variantId = this.dataset.variantId;
      const quantity = parseInt(popupQtyInput?.value) || 1;

      if (!variantId) return;

      // Get product name for notification
      const productName = popupProductTitle?.textContent?.trim() || "Product";

      this.disabled = true;
      this.textContent = "Adding...";

      // Show loader when adding to cart from popup
      if (window.upcart_loader) window.upcart_loader(true);

      try {
        const res = await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: variantId, quantity: quantity }),
        });

        if (res.ok) {
          // Show notification
          showUpsellNotification(productName);
          // Close popup and refresh cart
          if (upsellPopup) upsellPopup.style.display = "none";
          await refreshUI();
        }
      } catch (err) {
        console.error("Error adding to cart:", err);
      } finally {
        // Hide loader after popup add to cart completes
        if (window.upcart_loader) window.upcart_loader(false);
        this.disabled = false;
        this.textContent = "Add";
      }
    });
  }

  // View Details button - redirect to product page
  if (popupViewBtn) {
    popupViewBtn.addEventListener("click", function () {
      const productUrl = this.dataset.productUrl;
      if (productUrl) {
        window.location.href = productUrl;
      }
    });
  }

  console.log("Upcart: Progressbar + Upsell Products Initialized");
})();

document.addEventListener("DOMContentLoaded", function () {
  // Optional DOM hooks
});
