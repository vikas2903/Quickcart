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

(function () {
    // Custom function to run when cart updates
    let shopName = "d2c-apps.myshopify.com";
    async function onCartUpdateBxGF() {
        try {
            const url = `https://incentives-chess-emily-mysimon.trycloudflare.com/app/api/bxfrule`;
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Shop-Domain": shopName,
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
            const rule = json?.data || null;
            console.log("FreeProduct Database Api Data:", rule);

            if (!rule?.enabled) {
                console.log("BxGF offer is disabled");
                return;
            }else{
                const cartReponse  = await fetch('/cart.js', {
                    method: "GET", 
                    headers:{
                        "Content-Type" :"application/json"
                    }
                });
                const cartData = await cartReponse.json();
                
                const cartItems = cartData?.items || [];

                cartItems.map((product_id) =>{
                   let  cartProductExistProduct = product_id.product_id;
                   console.log("FreeProduct Cart Product Id:", cartProductExistProduct);
                   return cartProductExistProduct;
                })
                
               

                // console.log("FreeProduct Cart Data", cartItems.map(i => ({product_id: i.product_id })));
                
            }
        } catch (err) {
            console.error("Error fetching cart:", err);
        }
    }

    // ---- 1. Listen for Shopify events (if theme supports) ----
    document.addEventListener("cart:updated", onCartUpdateBxGF);

    // ---- 2. Intercept Shopify AJAX API calls (/cart/add, /cart/change, /cart/update) ----
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

    // ---- 3. Intercept older themes using XMLHttpRequest ----
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

    // ---- 4. Run once on page load ----
    onCartUpdateBxGF();
})();
