// async function getbxgy(shop) {
//   const url = `https://kinda-rail-thousand-annoying.trycloudflare.com/app/api/bxfrule`;

//   const response = await fetch(url, {
//     method: "GET",
//     credentials: "include", // ensures cookies/sessions travel
//     headers: {
//       "Content-Type": "application/json",
//       "X-Shopify-Shop-Domain": shop, // required by backend
//       Accept: "application/json",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//   }

//   const json = await response.json();

//   if (json?.ok === false) {
//     throw new Error(json.error || "Endpoint returned error");
//   }

//   console.log("Free Product backend data", json.data);

// }

// getbxgy('d2c-apps.myshopify.com');

// (function () {
//     // Custom function to run when cart updates
//     let shopName = "d2c-apps.myshopify.com";
//     async function onCartUpdateBxGF() {
//         try {
//             const url = `https://optimum-linda-lobby-azerbaijan.trycloudflare.com/app/api/bxfrule`;
//             let response = await fetch(url, {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "X-Shopify-Shop-Domain": shopName,
//                     Accept: "application/json",
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//             }
//             const json = await response.json();
//             if (json?.ok === false) {
//                 throw new Error(json.error || "Endpoint returned error");
//             }
//             const rule = json?.data || null;
//             console.log("FreeProduct Database Api Data:", rule);
 
//             if (!rule?.enabled) {
//                 console.log("BxGF offer is disabled");
//                 return;
//             }else{
//                 const cartReponse  = await fetch('/cart.js', {
//                     method: "GET", 
//                     headers:{
//                         "Content-Type" :"application/json"
//                     }
//                 });
//                 const cartData = await cartReponse.json();
                
//                 let cartItems = cartData?.items || [];
//                 let codtionProduct = rule.buyProductIds.map(gid => gid.split('/').pop());

//                 console.log("cartHasProduct", cartItems);
//                 console.log("codtionProduct", codtionProduct);

//             }
//         } catch (err) {
//             console.error("Error fetching cart:", err);
//         }
//     }

//     // ---- 1. Listen for Shopify events (if theme supports) ----
//     document.addEventListener("cart:updated", onCartUpdateBxGF);

//     // ---- 2. Intercept Shopify AJAX API calls (/cart/add, /cart/change, /cart/update) ----
//     const originalFetch = window.fetch;
//     window.fetch = async (...args) => {
//         const response = await originalFetch(...args);

//         if (
//             typeof args[0] === "string" &&
//             (args[0].includes("/cart/add") ||
//                 args[0].includes("/cart/change") ||
//                 args[0].includes("/cart/update"))
//         ) {
//             document.dispatchEvent(new Event("cart:updated"));
//         }

//         return response;
//     };

//     // ---- 3. Intercept older themes using XMLHttpRequest ----
//     const originalOpen = XMLHttpRequest.prototype.open;
//     XMLHttpRequest.prototype.open = function (...args) {
//         this.addEventListener("load", function () {
//             if (
//                 typeof args[1] === "string" &&
//                 (args[1].includes("/cart/add") ||
//                     args[1].includes("/cart/change") ||
//                     args[1].includes("/cart/update"))
//             ) {
//                 document.dispatchEvent(new Event("cart:updated"));
//             }
//         });
//         return originalOpen.apply(this, args);
//     };

//     // ---- 4. Run once on page load ----
//     onCartUpdateBxGF();
// })();


(function () {
  // ---------- Helpers ----------
  const toPlainId = (value) => {
    const m = String(value).match(/(\d+)(?:\?.*)?$/);
    return m ? m[1] : "";
  };

  const getShopName = () =>
    document.querySelector("#shop-primary-url")?.value?.trim() ||
    window.Shopify?.shop ||
    location.hostname;

  // ---------- Main ----------
  async function onCartUpdateBxGF() {
    const shopName = getShopName();

    try {
      // 1) Fetch BXG rule
      const ruleUrl = "https://quickcart-vf8k.onrender.com/app/api/bxfrule";
      const resp = await fetch(ruleUrl, { 
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shopName,
          Accept: "application/json",
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

      const json = await resp.json();
      if (json?.ok === false) throw new Error(json.error || "Endpoint returned error");

      const rule = json?.data || null;
      // console.log("FreeProduct Database Api Data:", rule);

      if (!rule?.enabled) {
        console.log("BxGF offer is disabled");
        return;
      }

      // 2) Fetch cart
      const cartRes = await fetch("/cart.js", { headers: { Accept: "application/json" } });
      if (!cartRes.ok) throw new Error("cart.js failed");
      const cartData = await cartRes.json();
      const cartItems = cartData?.items || [];

      // 3) Normalize IDs
      const conditionIdSet = new Set((rule.buyProductIds || []).map(toPlainId));
      const freeIdSet = new Set((rule.getProductIds || []).map(toPlainId));

      // Prefer product_id for matching; fallback to variant id/id if missing
      const lineId = (li) => toPlainId(li.product_id ?? li.variant_id ?? li.id);

      const cartProductIds = cartItems.map(lineId);
      const matchingCartLines = cartItems.filter((li) => conditionIdSet.has(lineId(li)));
      const hasAnyConditionProduct = matchingCartLines.length > 0;

      

    // 4) Debug logs (same scenario style)
    //   console.log("cartHasProduct", cartItems);
    //   console.log("codtionProduct", Array.from(conditionIdSet));
    //   console.log("cartProductIds", cartProductIds);

    
      setTimeout(async() => {
        // console.log("hasAnyConditionProduct", hasAnyConditionProduct);
        
//  if (hasAnyConditionProduct) {
//   const freeProductidDb = rule.freeProductId ? rule.freeProductId.split('/').pop() : "";
//   if (hasAnyConditionProduct) {
//     try {
//       // get first variant from PRODUCT ID (not handle)
//       const prodJson = await fetch(`/products.json?ids=${encodeURIComponent(freeProductidDb)}`, {
//         headers: { Accept: "application/json" }
//       }).then(r => r.json());

//       const firstVariantId = prodJson?.products?.[0]?.variants?.[0]?.id;
//       if (!firstVariantId) return;

//       // avoid duplicate add if already present
//       const cart = await fetch("/cart.js", { headers: { Accept: "application/json" } }).then(r => r.json());
//       const alreadyInCart = (cart.items || []).some(li =>
//         String(li.product_id) === String(freeProductidDb) && (li.properties?._free === "1")
//       );

//       if (!alreadyInCart) {
//         await fetch("/cart/add.js", {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Accept: "application/json" },
//           body: JSON.stringify({
//             items: [{ id: firstVariantId, quantity: 1, properties: { _free: "1" } }]
//           })
//         });
//       }
//     } catch (e) {
//       console.error("Failed to add free product:", e);
//     }
//   }
// } else {
//   const freeProductidDb = rule.freeProductId ? rule.freeProductId.split('/').pop() : "";
//   if (freeProductidDb) {
//     try {
//       // remove ONLY the free line(s) we added earlier (marked with properties._free === "1")
//       const cart = await fetch("/cart.js", { headers: { Accept: "application/json" } }).then(r => r.json());
//       const linesToRemove = (cart.items || [])
//         .filter(li => String(li.product_id) === String(freeProductidDb) && (li.properties?._free === "1"))
//         .map(li => li.key);

//       for (const key of linesToRemove) {
//         await fetch("/cart/change.js", {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Accept: "application/json" },
//           body: JSON.stringify({ id: key, quantity: 0 })
//         });
//       }
//     } catch (e) {
//       console.error("Failed to remove free product:", e);
//     }
//   }
// } 
      }, 2000);
 
 
//  if (hasAnyConditionProduct) {
//   const freeProductidDb = rule.freeProductId ? rule.freeProductId.split('/').pop() : "";
//   if (freeProductidDb) {
//     try {
//       // get first variant from PRODUCT ID (not handle)
//       const prodJson = await fetch(`/products.json?ids=${encodeURIComponent(freeProductidDb)}`, {
//         headers: { Accept: "application/json" }
//       }).then(r => r.json());

//       const firstVariantId = prodJson?.products?.[0]?.variants?.[0]?.id;
//       if (!firstVariantId) return;

//       // avoid duplicate add if already present
//       const cart = await fetch("/cart.js", { headers: { Accept: "application/json" } }).then(r => r.json());
//       const alreadyInCart = (cart.items || []).some(li =>
//         String(li.product_id) === String(freeProductidDb) && (li.properties?._free === "1")
//       );

//       if (!alreadyInCart) {
//         await fetch("/cart/add.js", {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Accept: "application/json" },
//           body: JSON.stringify({
//             items: [{ id: firstVariantId, quantity: 1, properties: { _free: "1" } }]
//           })
//         });
//       }
//     } catch (e) {
//       console.error("Failed to add free product:", e);
//     }
//   }
// } else {
//   const freeProductidDb = rule.freeProductId ? rule.freeProductId.split('/').pop() : "";
//   if (freeProductidDb) {
//     try {
//       // remove ONLY the free line(s) we added earlier (marked with properties._free === "1")
//       const cart = await fetch("/cart.js", { headers: { Accept: "application/json" } }).then(r => r.json());
//       const linesToRemove = (cart.items || [])
//         .filter(li => String(li.product_id) === String(freeProductidDb) && (li.properties?._free === "1"))
//         .map(li => li.key);

//       for (const key of linesToRemove) {
//         await fetch("/cart/change.js", {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Accept: "application/json" },
//           body: JSON.stringify({ id: key, quantity: 0 })
//         });
//       }
//     } catch (e) {
//       console.error("Failed to remove free product:", e);
//     }
//   }
// }

        
   

      // TODO: your business logic here (e.g., add/remove free item)
      // if (hasAnyConditionProduct && !cartHasFreeProduct) { ... }
      // if (!hasAnyConditionProduct && cartHasFreeProduct) { ... }


      

    } catch (err) {
      console.error("Error in onCartUpdateBxGF:", err);
    }
  }

  // ---- 1. Listen for Shopify events (if theme supports) ----
  document.addEventListener("cart:updated", onCartUpdateBxGF);

  // ---- 2/3. Intercept fetch/XHR once to re-run on cart changes ----
  if (!window.__bxgfWrapped) {
    window.__bxgfWrapped = true;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      try {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
        if (url && (url.includes("/cart/add") || url.includes("/cart/change") || url.includes("/cart/update"))) {
          document.dispatchEvent(new Event("cart:updated"));
        }
      } catch {}
      return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args) {
      try {
        this.addEventListener("load", () => {
          const url = typeof args[1] === "string" ? args[1] : "";
          if (url && (url.includes("/cart/add") || url.includes("/cart/change") || url.includes("/cart/update"))) {
            document.dispatchEvent(new Event("cart:updated"));
          }
        });
      } catch {}
      return originalOpen.apply(this, args);
    };
  }

  // ---- 4. Run once on page load ----
  onCartUpdateBxGF();
})();






 