
let shop = document.querySelector('#shop-primary-url').value;
async function getbxgy(shop){
  
    const url = `https://accepts-consult-seven-accordance.trycloudflare.com/app/quickcart/bxgy?shop=${encodeURIComponent(shop)}`;
    const response = await fetch("url", { credentials: "same-origin" })

    if(!response.ok){
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json   =  await response.json();

    if(json?.ok === false){
        throw new Error(json.error || "Endpoint returned error");
    }
    const data = json?.data;
    console.log("Backend data", data);

}

getbxgy(shop);




let progressbar_qty = document.querySelector('.reward-progress-line .fill');
let progressbar_qty_text = document.querySelector('.reward-progress-text');
let progressbar_qty_enabled = true;
let progressbar_qty_buyqty = 2;
let progressbar_qty_getqty = 1;


(function () {
    // Custom function to run when cart updates
    async function onCartUpdateQty() {
        try {
            const response = await fetch("/cart.js");
            const cart = await response.json();

            // console.log("onCartUpdateQty--:", cart);
            let updated_qty = cart?.item_count;


            if (progressbar_qty_buyqty === 2) {

                if (updated_qty == 1) {
                    progressbar_qty.style.width = '33%';
                    progressbar_qty_text.innerHTML = 'You are ' + (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) + ' items away from getting Free gift';
                }
                else if (updated_qty == 2) {
                    progressbar_qty.style.width = '66%';
                    progressbar_qty_text.innerHTML = 'You are ' + (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) + ' items away from getting Free gift';
                }
                else if (updated_qty == 3) {
                    progressbar_qty.style.width = '100%';
                    progressbar_qty_text.innerHTML = '🎉 Congratulations! You got a free gift';
                }else if (updated_qty > 3) {
                    progressbar_qty.style.width = '100%';
                    progressbar_qty_text.innerHTML = '🎉 Congratulations! You got a free gift';
                }
                else {
                    progressbar_qty.style.width = '0%';
                    progressbar_qty_text.innerHTML = 'You are ' + (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) + ' items away from getting Free gift';
                }
            } else if (progressbar_qty_buyqty === 1) {
                document.querySelector('.last-step').style.display = 'none';

                if (updated_qty == 1) {
                    progressbar_qty.style.width = '50%';
                    progressbar_qty_text.innerHTML = 'You are ' + (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) + ' items away from getting Free gift';
                }else if(updated_qty == 2){
                    progressbar_qty.style.width = '100%';
                    progressbar_qty_text.innerHTML = '🎉 Congratulations! You got a free gift';

                }else if(updated_qty > 2){
                    progressbar_qty.style.width = '100%';
                    progressbar_qty_text.innerHTML = '🎉 Congratulations! You got a free gift';
                }
                else{
                    progressbar_qty.style.width = '0%';
                    progressbar_qty_text.innerHTML = 'You are ' + (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) + ' items away from getting Free gift';
                }

            }
            else {
                document.querySelector('.reward-progress-text').innerHTML("contact with support");
            }



            // 👉 Your custom logic here

        } catch (err) {
            console.error("Error fetching cart:", err);
        }
    }

    // ---- 1. Listen for Shopify events (if theme supports) ----
    document.addEventListener("cart:updated", onCartUpdateQty);

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
    onCartUpdateQty();
})();
(function () {
    // Custom function to run when cart updates
    async function onCartUpdateQty() {
        try {
            const response = await fetch("/cart.js");
            const cart = await response.json();

            // console.log("Cart updated:", cart);

         
        } catch (err) {
            console.error("Error fetching cart:", err);
        }
    }

    // ---- 1. Listen for Shopify events (if theme supports) ----
    document.addEventListener("cart:updated", onCartUpdateQty);

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


    onCartUpdateQty();
})();
