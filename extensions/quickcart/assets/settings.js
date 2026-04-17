// Settings Loader
// Fetches settings from app dashboard and applies them dynamically

(function () {
  "use strict";


  function upcart_loader(show = true) {
    const loader = document.getElementById('upcart_loader');
    if (!loader) {
      console.warn('upcart_loader: element not found');
      return;
    }

    loader.style.display = show ? 'block' : 'none';
  }

  // Make loader function globally accessible
  window.upcart_loader = upcart_loader;

  // Initialize loader as hidden
  upcart_loader(false);

  // Store settings globally for access
  window.QuickCartSettings = window.QuickCartSettings || {};

  // Get shop domain from current page
  function getShopDomain() {
    // First try to get from drawer element data attribute
    const drawer = document.getElementById("CartDrawerPremium");
    if (drawer) {
      const shop = drawer.getAttribute("data-shop");
      if (shop) return shop;
    }
    // Try to get from Shopify global
    if (window.Shopify && window.Shopify.shop) {
      return window.Shopify.shop;
    }
    // Try to get from meta tag
    const metaShop = document.querySelector(
      'meta[name="shopify-checkout-api-token"]',
    );
    if (metaShop) {
      const shop = metaShop.getAttribute("data-shop");
      if (shop) return shop;
    }
    // Try to get from window.location
    const hostname = window.location.hostname;
    if (hostname.includes(".myshopify.com")) {
      return hostname;
    }
    // Fallback: try to extract from any script tag
    const scripts = document.querySelectorAll('script[src*="shopify"]');
    for (const script of scripts) {
      const match = script.src.match(/shop=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return null;
  }

  // Apply settings to the page dynamically
  function applySettings(settings) {

    const cartNoteSettings = settings.cartNoteDeliveryEstimate;
    const cartNoteElement = document.querySelector("#upCartNote");
    const deliveryInfoBox = document.querySelector("#deliveryInfoBox");
    const cartnotenable = cartNoteSettings?.cartnoteenable;

    if(cartNoteSettings){

        const deliveryDays = Number(cartNoteSettings.estimatedeliverydate ?? 7);
        const deliverEnable = cartNoteSettings.estimatedeliveryenable;

        if (cartNoteElement) {
          cartNoteElement.style.display = cartnotenable ? 'block' : 'none';
        }

        if (deliveryInfoBox) {
          deliveryInfoBox.style.display = deliverEnable ? 'block' : 'none';
        }

        

        const textEl = document.getElementById("deliveryText");
        if (!textEl || !deliverEnable) return;

        function formatDate(date) {
          return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            weekday: 'short'
          });
        }


        function getDeliveryDate(days) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          return formatDate(d);
        }


        function renderDelivery() {
          const deliveryDate = getDeliveryDate(deliveryDays);
          const type = deliveryDays <= 3 ? "⚡ Express" : "🚚 Standard";

          textEl.innerText = `${type} Delivery by ${deliveryDate}`;
        }

        renderDelivery();
        document.addEventListener("cart:updated", renderDelivery);

    }

    
    if (settings.thirdPartyIntegration.enabled == true) {
      document.querySelector(".cdp-footer-right").classList.add("thirdPartyIntegration_true");
    } else {
      document.querySelector(".cdp-footer-right").classList.remove("thirdPartyIntegration_true");
    }


    const root = document.documentElement;
    const drawer = document.getElementById("CartDrawerPremium");
    if (!drawer) return;

    // Store settings globally
    window.QuickCartSettings.data = settings;

    // Apply CSS variables for countdown
    if (settings.countdown) {
      if (settings.countdown.count_down_bg) {
        root.style.setProperty(
          "--count_down_bg",
          settings.countdown.count_down_bg,
        );
      }
      if (settings.countdown.countdown_text_color) {
        root.style.setProperty(
          "--countdown_text_color",
          settings.countdown.countdown_text_color,
        );
      }
      if (settings.countdown.countdown_chip_bg) {
        root.style.setProperty(
          "--countdown_chip_bg",
          settings.countdown.countdown_chip_bg,
        );
      }
      if (settings.countdown.countdown_chip_text) {
        root.style.setProperty(
          "--countdown_chip_text",
          settings.countdown.countdown_chip_text,
        );
      }
      if (settings.countdown.countdown_border_radius !== undefined) {
        root.style.setProperty(
          "--countdown_border_radius",
          settings.countdown.countdown_border_radius + "px",
        );
      }
      if (settings.countdown.countdown_chip_radius !== undefined) {
        root.style.setProperty(
          "--countdown_chip_radius",
          settings.countdown.countdown_chip_radius + "px",
        );
      }
      if (settings.countdown.show_countdown) {
        const countdownElement =
          document.querySelector("[data-countdown]") ||
          document.querySelector(".sr-countdown") ||
          drawer.querySelector('[id*="countdown"]');
        if (countdownElement) {
          countdownElement.style.display = settings.countdown.show_countdown
            ? ""
            : "none";
        }
      }

      // Show/hide countdown
      const countdownElement =
        document.querySelector("[data-countdown]") ||
        document.querySelector(".sr-countdown") ||
        drawer.querySelector('[id*="countdown"]');
      if (countdownElement) {
        if (settings.countdown.countdown_text_color) {
          const countdownElement =
            document.querySelector("[data-countdown]") ||
            document.querySelector(".sr-countdown") ||
            drawer.querySelector('[id*="countdown"]');
          if (countdownElement) {
            countdownElement.style.color =
              settings.countdown.countdown_text_color;
          }
        }
        countdownElement.style.display = settings.countdown.show_countdown
          ? ""
          : "none";
      }
    }

    // Apply CSS variables for cart drawer
    if (settings.cartDrawer) {
      if (settings.cartDrawer.body_color) {
        root.style.setProperty(
          "--body_background_color",
          settings.cartDrawer.body_color,
        );
      }
      if (settings.cartDrawer.text_color) {
        root.style.setProperty("--text_color", settings.cartDrawer.text_color);
      }


      if (settings.cartDrawer.border_radius !== undefined) {
        root.style.setProperty(
          "--border_radius",
          settings.cartDrawer.border_radius + "px",
        );


        document.querySelector(".cdp-checkout").style.borderRadius =
          settings.cartDrawer.button_border_radius + "px";


        document.querySelector(".cdp-lines").style.borderRadius =
          settings.cartDrawer.border_radius + "px";


        document.querySelector("[data-announcement-bar]").style.borderRadius =
          settings.cartDrawer.border_radius + "px";

        document.querySelector(".cdp-content").style.borderRadius =
          settings.cartDrawer.border_radius + "px";

        function applyLineRadius() {
          document.querySelectorAll(".cdp-line").forEach((item) => {
            item.style.borderRadius = settings.cartDrawer.border_radius + "px";
          });
        }

        // Run once
        applyLineRadius();

        // Watch for cart item add/remove
        const cartContainer = document.querySelector(".cdp-lines");

        if (cartContainer) {
          const observer = new MutationObserver(() => {
            applyLineRadius();
          });

          observer.observe(cartContainer, {
            childList: true,
            subtree: true
          });
        }


        // document.querySelectorAll(".cdp-qty").forEach((item) => {
        //   item.style.borderRadius =
        //     settings.cartDrawer.border_radius + "px";
        // });
      }


      if (settings.cartDrawer.button_color) {

        document.querySelector(".cdp-checkout").style.backgroundColor =
          settings.cartDrawer.button_color;

        document.querySelectorAll('.mob_upsell .cdp-u-final').forEach((item) => {
          item.style.color = settings.cartDrawer.button_color;
        });


        document.querySelector('.cdp-checkout').style.color = settings.cartDrawer.button_text_color;

        document.querySelector(".combined-offer-badge").style.backgroundColor =
          settings.cartDrawer.button_color;
        document.querySelectorAll(" .ball").forEach((ball) => {
          ball.style.backgroundColor =
            settings.cartDrawer.button_color;
        })
      }

      if (settings.cartDrawer.button_text_color) {
        root.style.setProperty(
          "--checkout_text_color",
          settings.cartDrawer.button_text_color,
        );
        document.querySelector(".combined-offer-badge").style.color =
          settings.cartDrawer.button_text_color;
      }

      if (settings.cartDrawer.button_border_radius !== undefined) {
        root.style.setProperty(
          "--checkout_border_radius",
          settings.cartDrawer.button_border_radius + "px",
        );
      }

    }



    // Apply announcement bar settings
    if (settings.announcementBar) {
      const announcementBarElement =
        drawer.querySelector("[data-announcement-bar]") ||
        drawer.querySelector('[id*="announcement"]') ||
        drawer.querySelector(".data-announcement-bar") ||
        document.querySelector("[data-announcement-bar]");

      if (announcementBarElement) {
        if (settings.announcementBar.enabled) {
          announcementBarElement.style.display = "";
          if (settings.announcementBar.background_color) {
            announcementBarElement.style.backgroundColor =
              settings.announcementBar.background_color;
          }
          if (settings.announcementBar.text_color) {
            announcementBarElement.style.color =
              settings.announcementBar.text_color;
          }

          if (settings.cartDrawer.border_radius !== undefined) {
            announcementBarElement.style.borderRadius =
              settings.cartDrawer.border_radius + "px";
          }

          if (settings.announcementBar.content) {
            const content = settings.announcementBar.content.trim();
            const items = content.split(",").map(item => item.trim()).filter(Boolean);
            if (items.length === 1) {
              announcementBarElement.innerHTML = items[0];
            } else if (items.length > 1) {
              // Clear existing content
              announcementBarElement.innerHTML = "";

              // Build Swiper structure
              const swiper = document.createElement("div");
              swiper.classList.add("sr-banner-swiper", "swiper");
              swiper.setAttribute("data-announcement-swiper", "");

              const wrapper = document.createElement("div");
              wrapper.classList.add("swiper-wrapper");

              items.forEach((text) => {
                const slide = document.createElement("div");
                slide.classList.add("swiper-slide");
                slide.textContent = text;
                wrapper.appendChild(slide);
              });

              swiper.appendChild(wrapper);
              announcementBarElement.appendChild(swiper);

              // Notify listeners to re-init swiper
              window.dispatchEvent(new CustomEvent("announcementbar:updated"));
            }
          }
        } else {
          announcementBarElement.style.display = "none";
          announcementBarElement.innerHTML = "";
        }
      }


    }

    // Apply collection (upsell) settings
    if (settings.collection) {
      const collectionContainer =
        drawer.querySelector("[data-upsell-collection]") ||
        drawer.querySelector(".cdp-v-track");

      if (collectionContainer) {
        if (
          !settings.collection.enabled ||
          !settings.collection.selectedCollection?.handle
        ) {
          // Hide if disabled or no collection selected
          collectionContainer
            .closest(".cdp-upsell")
            ?.style.setProperty("display", "none");
        } else {
          // Collection is enabled - you may want to dynamically load products here
          // This would require an additional API call to fetch collection products
          // console.log(
          //   "Upsell collection enabled:",
          //   settings.collection.selectedCollection.handle,
          // );
        }
      }
    }

    // =======================================
    // if (settings.shippingBar.enabled == true) {
    //   const shippingBarElement = drawer.querySelector("[data-shipping-progress]");
    //   shippingBarElement.querySelector(".shipping-progress__fill-icon").style.backgroundColor = settings.shippingBar.fillColor;
    //   shippingBarElement.querySelector(".shipping-progress__fill").style.backgroundColor = settings.shippingBar.fillColor;
    //   shippingBarElement.querySelector(".shipping-progress__bar").style.backgroundColor = settings.shippingBar.bgColor;

    // } else {
    //   const shippingBarElement = drawer.querySelector("[data-shipping-progress]");
    //   shippingBarElement.remove()
    // }

    // ==============================================

    // Apply gift product settings
    if (settings.product) {
      try {
        const giftSection =
          drawer.querySelector(".cdp-gift-wrap-section") ||
          drawer.querySelector("[data-gift-product]");

        if (giftSection) {
          giftSection.style.display = settings.product.enabled ? "" : "none";
          const giftBoxInfo = giftSection.querySelector(".gift-box-info");
          if (settings.product.enabled && settings.product.selectedProduct?.handle) {
            giftBoxInfo.innerHTML = settings.product.productInfo;
          }
          // You may want to dynamically load the gift product here
          if (
            settings.product.enabled &&
            settings.product.selectedProduct?.handle
          ) {
            console.log(
              "Gift product enabled:",
              settings.product.selectedProduct.handle,
            );
          }
        }
      } catch (err) {
        console.log("erorererererer " + err.message);
      }


    }

    // console.log('3333333333333333333');

    // Apply third-party integration

    // console.log("third party integration", settings.thirdPartyIntegration);


    if (settings.thirdPartyIntegration) {
      const existingCheckout = document.querySelector(".cdp-checkout");
      const footerRight = document.querySelector(".cdp-footer-right");

      if (settings.thirdPartyIntegration.enabled == false) {
        {
          const thirdPartyHtml = document.querySelector("#third-party-integration-wrapper");
          if (thirdPartyHtml) {
            thirdPartyHtml.style.display = "none";
          }
        }
      } else {
        document.querySelector(".cdp-checkout").style.display = "block";
      }

      if (settings.thirdPartyIntegration.enabled) {
        // Hide or remove existing checkout button
        if (existingCheckout) {
          existingCheckout.style.display = "none";
        } else {
          const thirdPartyHtml = document.querySelector("#third-party-integration-wrapper");
          if (thirdPartyHtml) {
            thirdPartyHtml.style.display = "none";
          }
        }

        // Remove any existing third-party button to avoid duplicates
        const existingThirdPartyBtn = document.querySelector(".cdp-third-party-checkout");
        if (existingThirdPartyBtn) {
          existingThirdPartyBtn.remove();
        }

        // Create button wrapper and insert htmlContent inside
        if (settings.thirdPartyIntegration.htmlContent && footerRight) {
          // const thirdPartyButton = document.createElement("a");
          // thirdPartyButton.href = "#";
          // thirdPartyButton.className = "cdp-checkout cdp-third-party-checkout";
          // thirdPartyButton.setAttribute("data-checkout", "");
          // thirdPartyButton.setAttribute("aria-label", "Proceed to checkout");
          // thirdPartyButton.innerHTML = settings.thirdPartyIntegration.htmlContent;
          // footerRight.appendChild(thirdPartyButton);
        }
      } else {
        // Show existing checkout button if third party is disabled
        if (existingCheckout) {
          existingCheckout.style.display = "";
        }

        // Remove third-party button if it exists
        const existingThirdPartyBtn = document.querySelector(".cdp-third-party-checkout");
        if (existingThirdPartyBtn) {
          existingThirdPartyBtn.remove();
        }
      }
    }

    // Apply quickview button visibility (from cart drawer settings)
    if (settings.enable_quickview_button !== undefined) {
      const quickviewButtons = drawer.querySelectorAll("[data-quickview-button]");
      quickviewButtons.forEach((btn) => {
        btn.style.display = settings.enable_quickview_button ? "" : "none";
      });
    }

    // Apply upsell_collection settings ()


    if (settings.collection !== undefined) {


      // let emptyContent = `<div class="cdp-u-empty">Add an upsell collection Go to Upcart App Dashboard 
      //          at left side app navigation show styling & display settings ->  Select Upsell Collection 
      // </div>`;

      // let upsell_next_insert =  document.querySelector('.mob_upsell');



      if (settings.collection.enabled == true) {
        document.querySelector('.mob_upsell').style.display = '';

      } else {
        document.querySelector('.mob_upsell').style.display = 'none';
        // upsell_next_insert.insertAdjacentHTML('afterend', emptyContent);
      }
    }



    // Dispatch event to notify other scripts that settings have been applied
    window.dispatchEvent(
      new CustomEvent("quickcart-settings-loaded", {
        detail: settings,
      }),
    );
  }


  // Fetch cart drawer settings separately (for quickview button, etc.)
  async function fetchCartDrawerSettings() {
    const shop = getShopDomain();
    if (!shop) {
      console.warn("Cart Drawer Settings: Could not determine shop domain");
      return;
    }

    // try {
    //   const drawer = document.getElementById("CartDrawerPremium");
    //   const appUrl =
    //     drawer?.getAttribute("data-app-url") ||
    //     "https://quickcart-vf8k.onrender.com";
    //   const apiUrl = `${appUrl}/app/api/cartdrawer`;

    //   const response = await fetch(apiUrl, {
    //     method: "GET",
    //     headers: {
    //       "X-Shopify-Shop-Domain": shop,
    //       Accept: "application/json",
    //     },
    //   });

    //   if (!response.ok) {
    //     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    //   }

    //   const data = await response.json();
    //   if (data.ok && data.data) {
    //     const cartDrawerSettings = data.data;
    //     const drawer = document.getElementById("CartDrawerPremium");

    //     if (drawer) {
    //       // Apply quickview button visibility
    //       if (cartDrawerSettings.enable_quickview_button !== undefined) {
    //         const quickviewButtons = drawer.querySelectorAll("[data-quickview-button]");
    //         quickviewButtons.forEach((btn) => {
    //           btn.style.display = cartDrawerSettings.enable_quickview_button ? "" : "none";
    //         });
    //       }
    //     }

    //     // Store cart drawer settings globally
    //     window.QuickCartSettings.cartDrawer = cartDrawerSettings;
    //   }
    // } catch (error) {
    //   console.error("Cart Drawer Settings: Failed to load settings", error);
    // }
  }


  // Fetch settings from API
  async function fetchSettingsData() {
    const shop = getShopDomain();
    if (!shop) {
      console.warn("Settings: Could not determine shop domain");
      return;
    }

    try {
      // Get app URL from drawer element or use default
      const drawer = document.getElementById("CartDrawerPremium");
      const appUrl =
        drawer?.getAttribute("data-app-url") ||
        "https://quickcart-vf8k.onrender.com";
      const settingPageEndpoint = `${appUrl}/app/api/settings`;

      const response = await fetch(settingPageEndpoint, {
        method: "GET",
        headers: {
          "X-Shopify-Shop-Domain": shop,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("Settings data:", data);

      if (data.ok && data.data) {
        const settings = data.data; 

        console.log("_UpcartData", settings)

        // Apply settings to the page
        applySettings(settings);

        // Store formatted settings for easy access
        window.QuickCartSettings.formatted = {
          announcementBar_content: settings?.announcementBar?.content,
          enable_announcementBar: settings?.announcementBar?.enabled,
          cartdrawer_body_color: settings?.cartDrawer?.body_color,
          cartdrawer_border_radius: settings?.cartDrawer?.border_radius,
          cartdrawer_text_color: settings?.cartDrawer?.text_color,
          enableupsell_collection: settings?.collection?.enabled,
          selected_collection_handle:
            settings?.collection?.selectedCollection?.handle,
          countdown_background: settings?.countdown?.count_down_bg,
          countdown_text_color: settings?.countdown?.countdown_text_color,
          countdown_chip_background: settings?.countdown?.countdown_chip_bg,
          countdown_chip_text_color: settings?.countdown?.countdown_chip_text,
          enable_countdown: settings?.countdown?.show_countdown,
          enable_gift_product: settings?.product?.enabled,
          selected_gift_product_handle:
            settings?.product?.selectedProduct?.handle,
          enable_thirdparty_integration:
            settings?.thirdPartyIntegration?.enabled,
          third_party_html_content:
            settings?.thirdPartyIntegration?.htmlContent,
        };



        return settings;
      }
    } catch (error) {
      console.error("Settings: Failed to load settings", error);
    }
  }


  // Load settings when DOM is ready
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        fetchSettingsData();
        fetchCartDrawerSettings();
      });
    } else {
      fetchSettingsData();
      fetchCartDrawerSettings();
    }

    // Refresh cart drawer settings when drawer opens for dynamic updates
    const drawer = document.getElementById("CartDrawerPremium");
    if (drawer) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && mutation.attributeName === "aria-hidden") {
            const isOpen = drawer.getAttribute("aria-hidden") === "false";
            if (isOpen) {
              // Refresh cart drawer settings when drawer opens
              fetchCartDrawerSettings();
            }
          }
        });
      });
      observer.observe(drawer, { attributes: true, attributeFilter: ["aria-hidden"] });
    }

    // Also listen for custom cart drawer open events
    document.addEventListener("cartDrawerOpen", () => {
      fetchCartDrawerSettings();
    });
  }



  init();
})();
