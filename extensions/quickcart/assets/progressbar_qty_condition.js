let shop = document.querySelector("#shop-primary-url").value;
let progressbar_qty = document.querySelector(".reward-progress-line .fill");
let progressbar_qty_text = document.querySelector(".reward-progress-text");

let progressbar_qty_enabled = null;

let progressbar_qty_buyqty = 0;
let progressbar_qty_getqty = 0;

let progressbar_text_remainingMany = "";
let progressbar_text_remainingOne = "";
let progressbar_text_unlocked = "";

// let free_product_text = document.querySelector(".p_buy3get1, .p_buy2get1, .p_buy1get1");




async function getbxgy(shop) {
  const url = `https://complete-uh-jpg-theoretical.trycloudflare.com/app/quickcart/bxgy`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include", // ensures cookies/sessions travel
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Shop-Domain": shop, // required by backend
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
  let bxgyResponse = json.data;

  console.log("Enabled:", bxgyResponse.enabled);

  // console.log("Offer Buy Qty:", bxgyResponse.offer.buyQty);
  // console.log("Offer Get Qty:", bxgyResponse.offer.getQty);
  // console.log("Remaing Many:", bxgyResponse.offer.remainingMany);
  // console.log("Remaing Many:", bxgyResponse.offer.remainingOne);
  // console.log("Remaing 1", bxgyResponse.messages.unlocked);

  console.log("Backend data", json.data);

  progressbar_qty_enabled = bxgyResponse.enabled;
  progressbar_qty_buyqty = bxgyResponse.offer.buyQty;
  progressbar_qty_getqty = bxgyResponse.offer.getQty;

  progressbar_text_remainingMany = bxgyResponse.offer.remainingMany;
  progressbar_text_remainingOne = bxgyResponse.offer.buyQty;
  progressbar_text_unlocked = bxgyResponse.messages.unlocked;
}
getbxgy(shop);

(function () {
  // Custom function to run when cart updates
  async function onCartUpdateQty() {
    try {
      const response = await fetch("/cart.js");
      const cart = await response.json();
      // console.log("onCartUpdateQty--:", cart);
      if (progressbar_qty_buyqty === 3 &&  progressbar_qty_getqty === 1 ) {
        document.querySelector(".buy3get1").style.display = "block";
          document.querySelector(".p_buy3get1 ").style.opacity = 1;
        }
        if (progressbar_qty_buyqty === 3 && progressbar_qty_getqty === 2 ) {
        document.querySelector(".buy3get2").style.display = "block";
         document.querySelector(".buy3get1").style.display = "block"
          document.querySelector(".p_buy3get2 ").style.opacity = 1;
        }
        if (progressbar_qty_enabled == false) {
        document.querySelector(".reward-progress").style.display = "none";
        }
    
      let updated_qty = cart?.item_count;

      if (progressbar_qty_buyqty === 2) {
        document.querySelector(".p_buy2get1 ").style.opacity = 1;
        if (updated_qty == 1) {
          progressbar_qty.style.width = "33%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " Products away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        } else if (updated_qty == 2) {
          progressbar_qty.style.width = "66%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        } else if (updated_qty == 3) {
          progressbar_qty.style.width = "100%";
          progressbar_qty_text.innerHTML =
            `🎉 Congratulations! You got a ${progressbar_qty_getqty} free product`;
        } else if (updated_qty > 3) {
          progressbar_qty.style.width = "100%";
          progressbar_qty_text.innerHTML =
                  `🎉 Congratulations! You got a ${progressbar_qty_getqty} free product`;
        } else {
          progressbar_qty.style.width = "0%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting Free gift";
        }
      } else if (progressbar_qty_buyqty === 1) {
        document.querySelector(".last-step").style.display = "none";
        document.querySelector(".p_buy1get1").style.opacity = 1;

        if (updated_qty == 1) {
          progressbar_qty.style.width = "50%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) + " Product away from getting " + progressbar_qty_getqty +" Free Product";
        } else if (updated_qty == 2) {
          progressbar_qty.style.width = "100%";
          progressbar_qty_text.innerHTML =
            `🎉 Congratulations! You got a ${progressbar_qty_getqty} free product`;
        } else if (updated_qty > 2) {
          progressbar_qty.style.width = "100%";
          progressbar_qty_text.innerHTML =
           `🎉 Congratulations! You got a ${progressbar_qty_getqty} free product`;
        } else {
          progressbar_qty.style.width = "0%";
          progressbar_qty_text.innerHTML = 
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) + " Product away from getting " + progressbar_qty_getqty + " Free Product";
        }
      } else if (progressbar_qty_buyqty === 3 && progressbar_qty_getqty === 1) {
   
  if (updated_qty == 1) {
          progressbar_qty.style.width = "25%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " Products away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        } else if (updated_qty == 2) {
          progressbar_qty.style.width = "50%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        } else if (updated_qty == 3) {
          progressbar_qty.style.width = "75%";
         progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        }else if (updated_qty == 4) {
          progressbar_qty.style.width = "100%";
          progressbar_qty_text.innerHTML =
            `🎉 Congratulations! You got a ${progressbar_qty_getqty} free product`;
        }
        
        else if (updated_qty > 4) {
          progressbar_qty.style.width = "100%";
          progressbar_qty_text.innerHTML =
                  `🎉 Congratulations! You got a ${progressbar_qty_getqty} free product`;
        } else {
          progressbar_qty.style.width = "0%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting Free gift";
        }
      }else if (progressbar_qty_buyqty === 3 && progressbar_qty_getqty === 2 ) {
        document.querySelector(".p_buy3get2").style.opacity = 1;

  if (updated_qty == 1) {
          progressbar_qty.style.width = "20%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " Products away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        } else if (updated_qty == 2) {
          progressbar_qty.style.width = "40%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        } else if (updated_qty == 3) {
          progressbar_qty.style.width = "60%";
         progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        }else if (updated_qty == 4) {
          progressbar_qty.style.width = "80%"; 
       progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting " +
            progressbar_qty_getqty +
            " Free Product";
        }else if (updated_qty == 5) {
          progressbar_qty.style.width = "100%";
          progressbar_qty_text.innerHTML =
            `🎉 Congratulations! You got a ${progressbar_qty_getqty} free product`;
        }else if (updated_qty < 5) {
          progressbar_qty.style.width = "100%";
          progressbar_qty_text.innerHTML =
                  `🎉 Congratulations! You got a ${progressbar_qty_getqty} free product`;
        } else {
          progressbar_qty.style.width = "0%";
          progressbar_qty_text.innerHTML =
            "You are " +
            (progressbar_qty_buyqty + progressbar_qty_getqty - updated_qty) +
            " items away from getting Free gift";
        }
      }
       else {
        document
          .querySelector(".reward-progress-text")
          .innerHTML("contact with support");
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
