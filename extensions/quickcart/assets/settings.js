// Settings Loader
// Fetches settings from app dashboard and applies them dynamically

(function () {
  "use strict";

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
    if (!settings) return;

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
      if (settings.announcementBar.enabled) {
        const announcementBarElement =
          drawer.querySelector("[data-announcement-bar]") ||
          drawer.querySelector('[id*="announcement"]') ||
          drawer.querySelector(".data-announcement-bar") ||
          document.querySelector("[data-announcement-bar]");
        if (announcementBarElement) {
          announcementBarElement.style.display = settings.announcementBar
            .enabled
            ? ""
            : "none";
        }
        if (settings.announcementBar.background_color) {
          announcementBarElement.style.backgroundColor =
            settings.announcementBar.background_color;
        }
        if (settings.announcementBar.text_color) {
          announcementBarElement.style.color =
            settings.announcementBar.text_color;
        }
        if (settings.announcementBar.border_radius !== undefined) {
          announcementBarElement.style.borderRadius =
            settings.announcementBar.border_radius + "px";
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
      }
      if (settings.cartDrawer.button_color) {
        document.querySelector(".cdp-checkout").style.backgroundColor =
          settings.cartDrawer.button_color;
        document.querySelector(".combined-offer-badge").style.backgroundColor =
          settings.cartDrawer.button_color;
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
        announcementBarElement.style.display = settings.announcementBar.enabled
          ? ""
          : "none";
      }

      if (settings.announcementBar.background_color) {
        announcementBarElement.style.backgroundColor =
          settings.announcementBar.background_color;
      }
      if (settings.announcementBar.text_color) {
        announcementBarElement.style.color =
          settings.announcementBar.text_color;
      }
      if (settings.announcementBar.border_radius !== undefined) {
        announcementBarElement.style.borderRadius =
          settings.announcementBar.border_radius + "px";
      }

      if (settings.announcementBar.content) {
        // Split by comma and clean spaces
        const items = settings.announcementBar.content
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (items.length > 0) {
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
    }

    if (settings.announcementBar.items) {
      const itemsElement =
        announcementBarElement.querySelector("[data-announcement-items]") ||
        announcementBarElement.querySelector(".sr-banner-carousel-span");
      if (itemsElement) {
        itemsElement.innerHTML = settings.announcementBar.items;
      }
    }
    if (settings.announcementBar.display_time) {
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
          console.log(
            "Upsell collection enabled:",
            settings.collection.selectedCollection.handle,
          );
        }
      }
    }

    // Apply gift product settings
    if (settings.product) {
      const giftSection =
        drawer.querySelector(".cdp-gift-wrap-section") ||
        drawer.querySelector("[data-gift-product]");

      if (giftSection) {
        giftSection.style.display = settings.product.enabled ? "" : "none";

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
    }

    // Apply third-party integration
    if (settings.thirdPartyIntegration) {

        document.querySelector(".cdp-checkout").style.display = settings.thirdPartyIntegration.enabled ? "none" : "";

        if (settings.thirdPartyIntegration.htmlContent) {
          let third_party_html = document.querySelector("#third-party-integration").innerHTML = settings.thirdPartyIntegration.htmlContent;
          const third_party_btn = `
            <a href="#" class="cdp-checkout" data-checkout="" aria-label="Proceed to checkout" style="background-color: rgb(115, 39, 39);">${third_party_html}</a>
          `;

          document.querySelector(".cdp-footer-right").insertAdjacentElement("beforeend", third_party_btn);
        }
        
      
    }

    // Dispatch event to notify other scripts that settings have been applied
    window.dispatchEvent(
      new CustomEvent("quickcart-settings-loaded", {
        detail: settings,
      }),
    );
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
      console.log("Settings data:", data);

      if (data.ok && data.data) {
        const settings = data.data;

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
      document.addEventListener("DOMContentLoaded", fetchSettingsData);
    } else {
      fetchSettingsData();
    }
  }

  init();
})();
