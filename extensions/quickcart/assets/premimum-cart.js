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
//   //     const freegift_api_url = `https://quickcart-68ln.onrender.com/app/api/giftproduct?shop=${remove_protocol}`;

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
//       const freegift_api_url = `https://quickcart-68ln.onrender.com/app/api/giftproduct?shop=${remove_protocol}`;
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
  console.log("vikas: november changes 19-11-2025 | 11:41 AM");

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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode
    }).format(price);
  }

  /* ============ MINI CART PANEL TOGGLE ============ */
  const dsBtn = document.querySelector("#ds-checkout-btn");
  const dsPanel = document.querySelector(".mini-cart-order-summary-content");
  if (dsBtn && dsPanel) {
    dsBtn.addEventListener("click", () => {
      dsPanel.classList.toggle("active");
      dsBtn.classList.toggle("active");
    });
  }

  /* ============ CORE CART DRAWER ============ */
  const drawer = document.getElementById("CartDrawerPremium");
  if (!drawer) {
    console.warn("CartDrawerPremium not found");
    return;
  }

  const openClass = drawer.dataset.openClass || "cdp-open";
  const linesRoot = drawer.querySelector("[data-lines]");
  const cartCountEl = drawer.querySelector("[data-cart-count]");
  const subtotalEl = drawer.querySelector("[data-subtotal]");
  const totalEl = drawer.querySelector("[data-total]");
  const offersRoot = drawer.querySelector("[data-offers]");


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
  console.log("lockBodyScroll | vs")
}

function unlockBodyScroll() {
  document.body.classList.remove("drawer-open");

  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";

  // reset padding
  document.documentElement.style.paddingRight = "";
  document.body.style.paddingRight = "";

  console.log("unlockBodyScroll | vs")
}



  function openDrawer() {
    drawer.classList.add(openClass);
    drawer.setAttribute("aria-hidden", "false");
    refreshUI();
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

      if (window.Shopify && typeof Shopify.formatMoney === "function") {
        return Shopify.formatMoney(safeCents, moneyFormat);
      }
      const amount = safeCents / 100;
      return amount.toLocaleString(undefined, {
        style: currencyCode ? "currency" : "decimal",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
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

  const changeQty = (key, quantity) =>
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity }),
      credentials: "same-origin"
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
      credentials: "same-origin"
    }).then((r) => r.json());
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
        (item) => `
      <article class="cdp-line" data-line-key="${item.key}">
        <div class="cdp-line-media">
          <img src="${
            item.image ? item.image.replace(/\.(jpg|png|jpeg)/, "_180x.$1") : ""
          }" alt="${item.product_title}" width="90" height="90" loading="lazy">
        </div>
        <div class="cdp-line-info">
          <div class="cdp-line-title">
            <span class="cart-item-title">${truncate(item.product_title, 35)}</span>
          </div>
          <div class="cdp-line-top">
            <span class="cart-item-variant-title">
              ${
                item.variant_title && item.variant_title !== "Default Title"
                  ? `<span class="cdp-line-variant">${item.variant_title} | </span>`
                  : ""
              }
              <span class="cdp-line-prices">
                <span class="cdp-line-final">${fmtMoney(item.final_line_price)}</span>
                ${
                  item.original_line_price > item.final_line_price
                    ? `<span class="cdp-line-compare">${fmtMoney(
                        item.original_line_price
                      )}</span>`
                    : ""
                }
              </span> | ${
                item.discounts?.length
                  ? `<span class="discount">${item.discounts[0]?.title || ""}</span>`
                  : ""
              }
            </span>
            <div class="cdp-line-bottom">
              <div class="cdp-qty" data-qty-wrap>
                <button class="cdp-qty-btn" data-qty-down>-</button>
                <input class="cdp-qty-input" type="number" min="0" value="${
                  item.quantity
                }" data-qty>
                <button class="cdp-qty-btn" data-qty-up>+</button>
              </div>
              <button class="cdp-line-remove" data-remove="${item.key}" aria-label="Remove">&#x2715;</button>
            </div>
          </div>
        </div>
      </article>
    `
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

      const freegift_api_url = `https://quickcart-68ln.onrender.com/app/api/giftproduct?shop=${remove_protocol}`;
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
          msg.innerHTML =
            '<span class="cdp-offer-text">Free gift removed from your cart! 🎁</span>';
          linesContainer.insertAdjacentElement("beforebegin", msg);
        }
        document.querySelector(".free-gift-message-added")?.remove();
        return;
      }

      // ABOVE threshold → ensure gift is present, quantity = 1
      if (cart_total_price >= free_price_threshold && !free_gift_in_cart) {
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

        const linesContainer = document.querySelector(".cdp-lines");
        if (linesContainer) {
          const msg = document.createElement("div");
          msg.className = "free-gift-message-added";
          msg.id = "free-gift-message";
          msg.innerHTML =
            '<span class="cdp-offer-text">Free gift added to your cart! 🎁</span>';
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
  const refreshUI = () =>
    fetchCart().then(async (cart) => {
      renderLines(cart);
      renderTotals(cart);
      handleCartDiscountRow(cart);
      await handleFreeGift(cart);
    });

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

  /* ============ UPSELL ADD BUTTONS ============ */
  drawer.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-upsell-add]");
    if (!btn) return;

    const card = btn.closest("[data-upsell-card]");
    const sel = card?.querySelector("[data-variant-select]");
    const variantId = sel?.value;
    if (!variantId) return;

    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    addVariantFD(variantId, 1)
      .then(() => refreshUI())
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
  document.addEventListener("submit", function (e) {
    const form = e.target.closest('form[action*="/cart/add"], form[action="/cart/add"]');
    if (!form) return;

    e.preventDefault();
    e.stopPropagation();

    if (atcBusy) {
      console.warn("ATC ignored due to debounce");
      return;
    }
    atcBusy = true;

    const btn =
      form.querySelector('button[type="submit"][name="add"], .ProductForm__AddToCart, button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.classList.add("is-loading");
    }

    const fd = new FormData(form);
    fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: fd,
      credentials: "same-origin"
    })
      .then(() => {
        openDrawer();
        return refreshUI();
      })
      .catch((err) => console.error("Add to cart error", err))
      .finally(() => {
        if (btn) {
          btn.disabled = false;
          btn.classList.remove("is-loading");
        }
        // small delay to avoid ultra-fast double click
        setTimeout(() => {
          atcBusy = false;
        }, 600);
      });
  });

  /* ============ HEADER CART ICON OPENER ============ */
  document.addEventListener("click", function (e) {
    const icon = e.target.closest(
      ".site-nav__link, .header__icon--cart, .Header__Icon, .m-cart-icon-bubble, .navlink--cart, a[aria-label='Cart'], .header-actions__cart-icon, .header__icon"
    );
    if (!icon) return;
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

  console.log("Upcart: Progressbar + Upsell Products Initialized");
})();

document.addEventListener("DOMContentLoaded", function () {
  // Optional DOM hooks
});
