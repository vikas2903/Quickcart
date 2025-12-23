
// let price_range_one   = 899;
// let price_range_two   = 1499;
// let price_range_three = 2499;
// const enabled = true;

// let price_range_text_one   = "Extra 5% off on ₹799";
// let price_range_text_two   = "Extra 10% off on ₹1499";
// let price_range_text_three = "Extra 15% off on ₹2499";

let price_range_one   = 0;
let price_range_two   = 0;
let price_range_three = 0;
let enabled_unlock = false;
let price_range_text_one   = "";
let price_range_text_two   = "";
let price_range_text_three = "";
let progressBarColor = "#000000";

// let shopNamee = document.querySelector("#shop-primary-url").value;

// async function getUnlockPrice(shop) {
//   try {
//     const url_unlock_price = `https://complete-uh-jpg-theoretical.trycloudflare.com/app/quickcart/unlockprice?shop=${encodeURIComponent(shop)}`;
//     const response = await fetch(url_unlock_price, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Shop-Domain": shop,
//         Accept: "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//     }

//     const json = await response.json();

//     if (json?.ok === false) {
//       throw new Error(json.error || "Endpoint returned error");
//     }

//     const data = json?.data || null;
//     console.log("UnlockPrice data:", data);

//     enabled_unlock = !!data?.enabled;

//      price_range_one   = data?.milestones?.[0]?.price ? data.milestones[0].price : 899;
//   } catch (err) {
//     console.error("UnlockPrice fetch failed:", err);
//     enabled_unlock = false;
//   }
// }

// getUnlockPrice(shopNamee);

// getUnlockPrice(shopName);
// console.log("Vikas_Enabled :", enabled_unlock);


const progressbar = document.querySelector(".progress.progress-bar-js-control");
const subheading_progressbar  = document.querySelector(".milstone_label");    // check: maybe ".milestone_label" in your HTML
const nearestAmount = document.querySelector(".nearestAmount");

const milestone_text_one   = document.querySelector("#step-one .mils_text_only");
const milestone_text_two   = document.querySelector("#step-two .mils_text_only");
const milestone_text_three = document.querySelector("#step-three .mils_text_only");

let shopNamee = document.querySelector("#shop-primary-url").value; 

function toMoney(amount, currency = "INR", locale = "en-IN") {
  const val = Math.max(0, Number(amount) || 0);
  let formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
  // Replace Rs. with ₹ symbol
  return formatted.replace(/Rs\.?/g, "₹");
}

( async function () {

  const reponseUnlockOffers = await fetch(`https://quickcart-vf8k.onrender.com/app/quickcart/unlockprice?shop=${encodeURIComponent(shopNamee)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Shop-Domain": shopNamee,
      Accept: "application/json",
    },
  })



  const jsonUnlockOffers = await reponseUnlockOffers.json();
  if(jsonUnlockOffers?.ok === false) {
    console.log("Error:", jsonUnlockOffers.error || "Endpoint returned error"); 
    enabled_unlock = false;
  } else {
    const data = jsonUnlockOffers?.data || null;
    // console.log("UnlockPrice data:", data);
    enabled_unlock = !!data?.enabled;

    // Get progress bar color from settings
    progressBarColor = data?.progressBarColor || "#000000";

    price_range_one   = data?.milestones?.[0]?.price ? data.milestones[0].price : 899;
    price_range_two   = data?.milestones?.[1]?.price ? data.milestones[1].price : 1499;
    price_range_three =   data?.milestones?.[2]?.price ? data.milestones[2].price : 2499;

    price_range_text_one   = data?.milestones?.[0]?.text ? data.milestones[0].text : "Extra 5% off on ₹899";
    price_range_text_two   =  data?.milestones?.[1]?.text ? data.milestones[1].text : "Extra 10% off on ₹1499";
    price_range_text_three = data?.milestones?.[2]?.text ? data.milestones[2].text : "Extra 15% off on ₹2499";

   if (milestone_text_one)   milestone_text_one.innerHTML   = price_range_text_one;
   if (milestone_text_two)   milestone_text_two.innerHTML   = price_range_text_two;
   if (milestone_text_three) milestone_text_three.innerHTML = price_range_text_three;

   // Apply progress bar color
   if (progressbar) {
     progressbar.style.backgroundColor = progressBarColor;
   }
   // Also set CSS variable for consistency
   document.documentElement.style.setProperty('--sr-progress-bar-bg-color', progressBarColor);
  }
  if(enabled_unlock) {
    document.querySelector('#mini-cart-progress-section').style.display = 'unset';
  
  async function onCartUpdate() {
    try {
      const res  = await fetch("/cart.js", { headers: { Accept: "application/json" } });
      const cart = await res.json();
      const currency = cart?.currency || "INR";
      const cartEstimatedPrice = (cart?.total_price || 0) / 100;

      if (!progressbar) return;

      // Get milestone dot elements
      const stepOneDot = document.querySelector("#step-one .milestone-dot");
      const stepTwoDot = document.querySelector("#step-two .milestone-dot");
      const stepThreeDot = document.querySelector("#step-three .milestone-dot");

      // Icon URLs
      const coloredIcon = "https://pickrr.s3.amazonaws.com:443/2025-08-01T06:57:59.706663_party_icon_colored.png";
      const outlineIcon = "https://pickrr.s3.amazonaws.com:443/2025-08-01T06:27:20.558528_party_icon_outline.png";

      // Helper function to activate a milestone
      function activateMilestone(dotElement) {
        if (dotElement) {
          dotElement.classList.remove('greyscale');
          dotElement.classList.add('active');
          const img = dotElement.querySelector('img');
          if (img) img.src = coloredIcon;
        }
      }

      // Helper function to deactivate a milestone
      function deactivateMilestone(dotElement) {
        if (dotElement) {
          dotElement.classList.add('greyscale');
          dotElement.classList.remove('active');
          const img = dotElement.querySelector('img');
          if (img) img.src = outlineIcon;
        }
      }

      if (cartEstimatedPrice >= price_range_three) {
        // Tier 3+ (full bar) - ALL milestones active
        progressbar.style.width = "100%";
        activateMilestone(stepOneDot);
        activateMilestone(stepTwoDot);
        activateMilestone(stepThreeDot);
        if (subheading_progressbar) {
          document.querySelector('.progress-bar-sub-heading').classList.add('hide');
          subheading_progressbar.innerHTML = "🎉 Congratulations! You unlocked the maximum discount.";
        }
        if (nearestAmount) nearestAmount.innerHTML = toMoney(0, currency);

      } else if (cartEstimatedPrice >= price_range_two) {
        // Between tier 2 and 3 - first 2 milestones active
        progressbar.style.width = "66%";
        activateMilestone(stepOneDot);
        activateMilestone(stepTwoDot);
        deactivateMilestone(stepThreeDot);
        if (subheading_progressbar) subheading_progressbar.innerHTML = price_range_text_three;
        if (nearestAmount) nearestAmount.innerHTML = toMoney(price_range_three - cartEstimatedPrice, currency);
        document.querySelector('.progress-bar-sub-heading').classList.remove('hide');

      } else if (cartEstimatedPrice >= price_range_one) {
        // Between tier 1 and 2 - first milestone active
        progressbar.style.width = "33%";
        activateMilestone(stepOneDot);
        deactivateMilestone(stepTwoDot);
        deactivateMilestone(stepThreeDot);
        if (subheading_progressbar) subheading_progressbar.innerHTML = price_range_text_two;
        if (nearestAmount) nearestAmount.innerHTML = toMoney(price_range_two - cartEstimatedPrice, currency);
        document.querySelector('.progress-bar-sub-heading').classList.remove('hide');

      } else {
        // Below tier 1 - NO milestones active
        progressbar.style.width = "0%";
        deactivateMilestone(stepOneDot);
        deactivateMilestone(stepTwoDot);
        deactivateMilestone(stepThreeDot);
        if (subheading_progressbar) subheading_progressbar.innerHTML = price_range_text_one;
        if (nearestAmount) nearestAmount.innerHTML = toMoney(price_range_one - cartEstimatedPrice, currency);
        document.querySelector('.progress-bar-sub-heading').classList.remove('hide');
      }
    } catch (err) {
      console.error("Error fetching cart", err);
    }
  }

  // Update when the cart changes (AJAX)
  document.addEventListener("cart:updated", onCartUpdate);

  // Wrap once so we don’t double-patch on theme reloads
  if (!window.__pbWrapped) {
    window.__pbWrapped = true;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      if (url.includes("/cart/add") || url.includes("/cart/change") || url.includes("/cart/update")) {
        document.dispatchEvent(new Event("cart:updated"));
      }
      return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args) {
      this.addEventListener("load", () => {
        const url = typeof args[1] === "string" ? args[1] : "";
        if (url && (url.includes("/cart/add") || url.includes("/cart/change") || url.includes("/cart/update"))) {
          document.dispatchEvent(new Event("cart:updated"));
        }
      });
      return originalOpen.apply(this, args);
    };
  }

  // First paint
  onCartUpdate();
}else{
  document.querySelector('#mini-cart-progress-section').style.display = 'none';
}
})();

