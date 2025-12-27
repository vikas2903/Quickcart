// // Cart Drawer Settings Loader
// // Fetches settings from app dashboard and applies them

// (function() {
//   'use strict';
  
//   // Get shop domain from current page
//   function getShopDomain() {
//     // First try to get from drawer element data attribute
//     const drawer = document.getElementById('CartDrawerPremium');
//     if (drawer) {
//       const shop = drawer.getAttribute('data-shop');
//       if (shop) return shop;
//     }
//     // Try to get from Shopify global
//     if (window.Shopify && window.Shopify.shop) {
//       return window.Shopify.shop;
//     }
//     // Try to get from meta tag
//     const metaShop = document.querySelector('meta[name="shopify-checkout-api-token"]');
//     if (metaShop) {
//       const shop = metaShop.getAttribute('data-shop');
//       if (shop) return shop;
//     }
//     // Try to get from window.location
//     const hostname = window.location.hostname;
//     if (hostname.includes('.myshopify.com')) {
//       return hostname;
//     }
//     // Fallback: try to extract from any script tag
//     const scripts = document.querySelectorAll('script[src*="shopify"]');
//     for (const script of scripts) {
//       const match = script.src.match(/shop=([^&]+)/);
//       if (match) return decodeURIComponent(match[1]);
//     }
//     return null;
//   }

//   // Apply settings to CSS variables and elements
//   function applySettings(settings) {
//     if (!settings) return;

//     const root = document.documentElement;
//     const drawer = document.getElementById('CartDrawerPremium');
//     if (!drawer) return;

//     // Apply CSS variables
//     if (settings.primary_color) {
//       root.style.setProperty('--bg_color', settings.primary_color);
//     }
//     if (settings.border_radius !== undefined) {
//       root.style.setProperty('--border_radius', settings.border_radius + 'px');
//     }
//     if (settings.count_down_bg) {
//       root.style.setProperty('--count_down_bg', settings.count_down_bg);
//     }
//     if (settings.countdown_text_color) {
//       root.style.setProperty('--countdown_text_color', settings.countdown_text_color);
//     }
//     if (settings.countdown_chip_bg) {
//       root.style.setProperty('--countdown_chip_bg', settings.countdown_chip_bg);
//     }
//     if (settings.countdown_chip_text) {
//       root.style.setProperty('--countdown_chip_text', settings.countdown_chip_text);
//     }
//     if (settings.countdown_border_radius !== undefined) {
//       root.style.setProperty('--countdown_border_radius', settings.countdown_border_radius + 'px');
//     }
//     if (settings.countdown_chip_radius !== undefined) {
//       root.style.setProperty('--countdown_chip_radius', settings.countdown_chip_radius + 'px');
//     }
//     if (settings.body_color) {
//       root.style.setProperty('--body_background_color', settings.body_color);
//     }
//     if (settings.text_color) {
//       root.style.setProperty('--text_color', settings.text_color);
//     }

//     // Apply custom CSS if provided
//     if (settings.custom_css_code) {
//       let customStyle = document.getElementById('cartdrawer-custom-css');
//       if (!customStyle) {
//         customStyle = document.createElement('style');
//         customStyle.id = 'cartdrawer-custom-css';
//         document.head.appendChild(customStyle);
//       }
//       customStyle.textContent = settings.custom_css_code;
//     }

//     // Apply conditional visibility settings
//     const countdownEl = drawer.querySelector('[data-countdown]') || drawer.querySelector('.sr-countdown');
//     if (countdownEl) {
//       countdownEl.style.display = settings.show_countdown ? '' : 'none';
//     }

//     const announcementEl = drawer.querySelector('[data-announcement]') || drawer.querySelector('.cdp-announce');
//     if (announcementEl) {
//       announcementEl.style.display = settings.show_announcementbar_text ? '' : 'none';
//     }

//     // Update announcement text if element exists
//     if (settings.announcementbar_text) {
//       const announcementTextEl = drawer.querySelector('#sr-cart-banner');
//       if (announcementTextEl && window.cartDrawerSettings) {
//         // The announcement bar snippet will handle this
//       }
//     }

//     // Update upsell collection (this would need to be handled in the main JS)
//     // Update gift product visibility
//     const giftSection = drawer.querySelector('.cdp-gift-wrap-section');
//     if (giftSection) {
//       giftSection.style.display = settings.show_gift_product ? '' : 'none';
//     }

//     // Update checkout integration
//     const checkoutWrapper = drawer.querySelector('#third-party-integration-wrapper');
//     const defaultCheckout = drawer.querySelector('.cdp-checkout[data-checkout]');
//     if (settings.show_checkout_field && settings.checkout_integration_code) {
//       if (checkoutWrapper) {
//         checkoutWrapper.style.display = '';
//         if (checkoutWrapper.innerHTML.trim() === '') {
//           checkoutWrapper.innerHTML = settings.checkout_integration_code;
//         }
//       }
//       if (defaultCheckout) {
//         defaultCheckout.style.display = 'none';
//       }
//     } else {
//       if (checkoutWrapper) {
//         checkoutWrapper.style.display = 'none';
//       }
//       if (defaultCheckout) {
//         defaultCheckout.style.display = '';
//       }
//     }

//     // Store settings for use in other scripts
//     window.cartDrawerSettings = settings;
//   }

//   // Fetch settings from API
//   async function loadSettings() {
//     const shop = getShopDomain();
//     if (!shop) {
//       console.warn('Cart Drawer Settings: Could not determine shop domain');
//       return;
//     }

//     try {
//       // Get app URL from drawer element or use default
//       const drawer = document.getElementById('CartDrawerPremium');
//       const appUrl = drawer?.getAttribute('data-app-url') || 'https://quickcart-vf8k.onrender.com';
//       const apiUrl = `${appUrl}/app/api/cartdrawer`;
      
//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'X-Shopify-Shop-Domain': shop,
//           'Accept': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}`);
//       }

//       const json = await response.json();
//       if (json.ok && json.data) {
//         applySettings(json.data);
//       }
//     } catch (error) {
//       console.warn('Cart Drawer Settings: Failed to load settings', error);
//       // Continue with default settings
//     }
//   }

//   // Load settings when DOM is ready
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', loadSettings);
//   } else {
//     loadSettings();
//   }

//   // Also load when cart drawer is opened (in case it loads dynamically)
//   document.addEventListener('cartDrawerOpen', loadSettings);
// })();

