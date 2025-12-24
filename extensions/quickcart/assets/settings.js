// Settings Loader
// Fetches settings from app dashboard

(function() {
  'use strict';
  
  // Get shop domain from current page
  function getShopDomain() {
    // First try to get from drawer element data attribute
    const drawer = document.getElementById('CartDrawerPremium');
    if (drawer) {
      const shop = drawer.getAttribute('data-shop');
      if (shop) return shop;
    }
    // Try to get from Shopify global
    if (window.Shopify && window.Shopify.shop) {
      return window.Shopify.shop;
    }
    // Try to get from meta tag
    const metaShop = document.querySelector('meta[name="shopify-checkout-api-token"]');
    if (metaShop) {
      const shop = metaShop.getAttribute('data-shop');
      if (shop) return shop;
    }
    // Try to get from window.location
    const hostname = window.location.hostname;
    if (hostname.includes('.myshopify.com')) {
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

  // Fetch settings from API
  async function fetchSettingsData() {
    const shop = getShopDomain();
    if (!shop) {
      console.warn('Settings: Could not determine shop domain');
      return;
    }

    try {
      // Get app URL from drawer element or use default
      const drawer = document.getElementById('CartDrawerPremium');
      const appUrl = drawer?.getAttribute('data-app-url') || 'https://quickcart-vf8k.onrender.com';
      const settingPageEndpoint = `${appUrl}/app/api/settings`;
      
      const response = await fetch(settingPageEndpoint, {
        method: 'GET',
        headers: {
          'X-Shopify-Shop-Domain': shop,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Settings data:", data);
      console.log("Settings shop:", shop);

      // You can process the settings data here if needed
      if (data.ok && data.data) {
        // Apply settings as needed
        return data.data;
      }
    } catch (error) {
      console.error('Settings: Failed to load settings', error);
      // Continue with default settings or handle error as needed
    }
  }

  // Load settings when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchSettingsData);
  } else {
    fetchSettingsData();
  }
})();