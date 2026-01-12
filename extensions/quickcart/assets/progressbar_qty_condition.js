let shop = document.querySelector("#shop-primary-url").value;
let progressbar_qty = document.querySelector(".reward-progress-line .fill");
let progressbar_qty_text = document.querySelector(".reward-progress-text");

let progressbar_qty_enabled = false;
let progressbar_qty_buyqty = 0;
let progressbar_qty_getqty = 0;

let progressbar_text_remainingMany = "";
let progressbar_text_remainingOne = "";
let progressbar_text_unlocked = "";

// let free_product_text = document.querySelector(".p_buy3get1, .p_buy2get1, .p_buy1get1");




async function getbxgy(shop) {
  const url = `https://quickcart-vf8k.onrender.com/app/quickcart/bxgy`; 

  try {
    const response = await fetch(url, {
      method: "GET",
      // Remove credentials: "include" to avoid CORS issues with wildcard origin
      // credentials: "include", 
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Shop-Domain": shop, // required by backend
        Accept: "application/json",
      },
    });

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error("BXGY API error:", response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response from BXGY API:", text.substring(0, 200));
      throw new Error("Server returned non-JSON response");
    }

    const json = await response.json();

    if (json?.ok === false) {
      throw new Error(json.error || "Endpoint returned error");
    }
    
    let bxgyResponse = json.data || json;

    // Safely extract data with defaults
    progressbar_qty_enabled = bxgyResponse?.enabled || false;
    progressbar_qty_buyqty = bxgyResponse?.offer?.buyQty || 0;
    progressbar_qty_getqty = bxgyResponse?.offer?.getQty || 0;

    progressbar_text_remainingMany = bxgyResponse?.offer?.remainingMany || "";
    progressbar_text_remainingOne = bxgyResponse?.offer?.remainingOne || "";
    progressbar_text_unlocked = bxgyResponse?.messages?.unlocked || "";
  } catch (error) {
    console.error("Error fetching BXGY configuration:", error);
    // Set defaults on error to prevent breaking the app
    progressbar_qty_enabled = false;
    progressbar_qty_buyqty = 0;
    progressbar_qty_getqty = 0;
    progressbar_text_remainingMany = "";
    progressbar_text_remainingOne = "";
    progressbar_text_unlocked = "";
  }
}

// Fetch settings separately (if needed)
async function getSettings(shop) {
  try {
    const settingsData = await fetch(`https://quickcart-vf8k.onrender.com/app/api/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Shop-Domain": shop,
        Accept: "application/json",
      },
    });
    
    if (settingsData.ok) {
      const jsonSettings = await settingsData.json();
      console.log("dataFromDB", jsonSettings);
      return jsonSettings;
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
  return null;
}

// Initialize both
if (shop) {
  getbxgy(shop);
  getSettings(shop);
}

(function () {
  // Custom function to run when cart updates

  
  async function onCartUpdateQty() {
    
    try {

      if(progressbar_qty_enabled){
       document.querySelector(".reward-progress").style.display = "block";
      }else{
       document.querySelector(".reward-progress").style.display = "none";
      }
      
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
