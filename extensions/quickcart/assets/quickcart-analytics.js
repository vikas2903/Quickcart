/**
 * QuickCart Analytics Tracking System
 * Tracks upsell performance, conversion rates, and app performance metrics
 */

(function() {
  'use strict';

  // Storage keys
  const STORAGE_KEY = 'quickcart_analytics';
  const INSTALL_DATE_KEY = 'quickcart_install_date';
  const BASELINE_KEY = 'quickcart_baseline_metrics';

  // Initialize analytics
  function initAnalytics() {
    // Set install date if not exists
    if (!localStorage.getItem(INSTALL_DATE_KEY)) {
      localStorage.setItem(INSTALL_DATE_KEY, new Date().toISOString());
    }

    // Initialize baseline metrics if not exists (for before/after comparison)
    if (!localStorage.getItem(BASELINE_KEY)) {
      const baseline = {
        cartOpens: 0,
        checkouts: 0,
        conversions: 0,
        totalRevenue: 0,
        avgCartValue: 0,
        date: new Date().toISOString()
      };
      localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
    }

    // Initialize analytics data
    if (!localStorage.getItem(STORAGE_KEY)) {
      const initialData = {
        installDate: localStorage.getItem(INSTALL_DATE_KEY),
        sessions: [],
        dailyStats: {},
        upsellStats: {
          views: 0,
          clicks: 0,
          addsToCart: 0,
          revenue: 0,
          products: {}
        },
        cartStats: {
          opens: 0,
          checkouts: 0,
          conversions: 0,
          totalRevenue: 0,
          avgCartValue: 0
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  }

  // Get analytics data
  function getAnalytics() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Save analytics data
  function saveAnalytics(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Get today's date key
  function getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  // Send event to server
  async function sendEventToServer(eventType, eventData, sessionId) {
    try {
      // Try to send to server API (if available)
      if (typeof fetch !== 'undefined' && typeof window !== 'undefined') {
        // Get shop domain from current URL or Shopify global
        let shopDomain = '';
        if (window.Shopify && window.Shopify.shop) {
          shopDomain = window.Shopify.shop;
        } else if (window.location.hostname) {
          // Extract shop from hostname if it's a myshopify.com domain
          const hostname = window.location.hostname;
          if (hostname.includes('.myshopify.com')) {
            shopDomain = hostname;
          }
        }
        
        if (shopDomain) {
          fetch('/app/api/analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventType,
              eventData,
              sessionId,
              shop: shopDomain,
              shopName: shopDomain
            }),
            credentials: 'same-origin'
          }).catch(err => {
            // Silently fail if server is not available
            console.debug('[QuickCart Analytics] Server sync failed:', err);
          });
        }
      }
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.debug('[QuickCart Analytics] Server sync error:', error);
    }
  }

  // Track event
  function trackEvent(eventType, eventData = {}) {
    try {
      const analytics = getAnalytics();
      if (!analytics) {
        initAnalytics();
        return trackEvent(eventType, eventData);
      }

      const today = getTodayKey();
      const sessionId = eventData.sessionId || generateSessionId();
      
      // Initialize daily stats if not exists
      if (!analytics.dailyStats[today]) {
        analytics.dailyStats[today] = {
          date: today,
          cartOpens: 0,
          checkouts: 0,
          conversions: 0,
          upsellViews: 0,
          upsellClicks: 0,
          upsellAdds: 0,
          revenue: 0
        };
      }

      // Track session
      const timestamp = new Date().toISOString();
      
      // Send to server (async, don't wait)
      sendEventToServer(eventType, eventData, sessionId);

      // Record event in session
      const session = {
        sessionId,
        eventType,
        eventData,
        timestamp
      };
      analytics.sessions.push(session);

      // Update daily stats based on event type
      switch(eventType) {
        case 'cart_open':
          analytics.cartStats.opens++;
          analytics.dailyStats[today].cartOpens++;
          break;
        
        case 'checkout_click':
          analytics.cartStats.checkouts++;
          analytics.dailyStats[today].checkouts++;
          break;
        
        case 'conversion':
          analytics.cartStats.conversions++;
          analytics.dailyStats[today].conversions++;
          if (eventData.revenue) {
            analytics.cartStats.totalRevenue += eventData.revenue;
            analytics.dailyStats[today].revenue += eventData.revenue;
          }
          break;
        
        case 'upsell_view':
          analytics.upsellStats.views++;
          analytics.dailyStats[today].upsellViews++;
          if (eventData.productId) {
            if (!analytics.upsellStats.products[eventData.productId]) {
              analytics.upsellStats.products[eventData.productId] = {
                views: 0,
                clicks: 0,
                adds: 0,
                revenue: 0
              };
            }
            analytics.upsellStats.products[eventData.productId].views++;
          }
          break;
        
        case 'upsell_click':
          analytics.upsellStats.clicks++;
          analytics.dailyStats[today].upsellClicks++;
          if (eventData.productId) {
            if (!analytics.upsellStats.products[eventData.productId]) {
              analytics.upsellStats.products[eventData.productId] = {
                views: 0,
                clicks: 0,
                adds: 0,
                revenue: 0
              };
            }
            analytics.upsellStats.products[eventData.productId].clicks++;
          }
          break;
        
        case 'upsell_add_to_cart':
          analytics.upsellStats.addsToCart++;
          analytics.dailyStats[today].upsellAdds++;
          if (eventData.productId) {
            if (!analytics.upsellStats.products[eventData.productId]) {
              analytics.upsellStats.products[eventData.productId] = {
                views: 0,
                clicks: 0,
                adds: 0,
                revenue: 0
              };
            }
            analytics.upsellStats.products[eventData.productId].adds++;
            if (eventData.revenue) {
              analytics.upsellStats.revenue += eventData.revenue;
              analytics.upsellStats.products[eventData.productId].revenue += eventData.revenue;
            }
          }
          break;
      }

      // Calculate average cart value
      if (analytics.cartStats.conversions > 0) {
        analytics.cartStats.avgCartValue = analytics.cartStats.totalRevenue / analytics.cartStats.conversions;
      }

      // Keep only last 1000 sessions to prevent storage bloat
      if (analytics.sessions.length > 1000) {
        analytics.sessions = analytics.sessions.slice(-1000);
      }

      // Keep only last 90 days of daily stats
      const daysToKeep = 90;
      const sortedDays = Object.keys(analytics.dailyStats).sort();
      if (sortedDays.length > daysToKeep) {
        sortedDays.slice(0, sortedDays.length - daysToKeep).forEach(day => {
          delete analytics.dailyStats[day];
        });
      }

      saveAnalytics(analytics);
      
      // Log to console in development
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('myshopify.com')) {
        console.log('[QuickCart Analytics]', eventType, eventData);
      }
    } catch (error) {
      console.error('[QuickCart Analytics Error]', error);
    }
  }

  // Generate session ID
  function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get performance metrics
  function getPerformanceMetrics() {
    const analytics = getAnalytics();
    if (!analytics) return null;

    const baseline = JSON.parse(localStorage.getItem(BASELINE_KEY) || '{}');
    const installDate = new Date(analytics.installDate);
    const now = new Date();
    const daysSinceInstall = Math.ceil((now - installDate) / (1000 * 60 * 60 * 24));

    // Calculate upsell metrics
    const upsellClickRate = analytics.upsellStats.views > 0 
      ? (analytics.upsellStats.clicks / analytics.upsellStats.views * 100).toFixed(2)
      : 0;
    
    const upsellConversionRate = analytics.upsellStats.clicks > 0
      ? (analytics.upsellStats.addsToCart / analytics.upsellStats.clicks * 100).toFixed(2)
      : 0;

    const overallUpsellRate = analytics.cartStats.opens > 0
      ? (analytics.upsellStats.addsToCart / analytics.cartStats.opens * 100).toFixed(2)
      : 0;

    // Calculate checkout conversion rate
    const checkoutConversionRate = analytics.cartStats.checkouts > 0
      ? (analytics.cartStats.conversions / analytics.cartStats.checkouts * 100).toFixed(2)
      : 0;

    // Calculate cart to checkout rate
    const cartToCheckoutRate = analytics.cartStats.opens > 0
      ? (analytics.cartStats.checkouts / analytics.cartStats.opens * 100).toFixed(2)
      : 0;

    // Before/After comparison
    const beforeAfter = {
      cartOpens: {
        before: baseline.cartOpens || 0,
        after: analytics.cartStats.opens,
        change: analytics.cartStats.opens - (baseline.cartOpens || 0),
        changePercent: baseline.cartOpens > 0
          ? (((analytics.cartStats.opens - baseline.cartOpens) / baseline.cartOpens) * 100).toFixed(2)
          : 0
      },
      conversions: {
        before: baseline.conversions || 0,
        after: analytics.cartStats.conversions,
        change: analytics.cartStats.conversions - (baseline.conversions || 0),
        changePercent: baseline.conversions > 0
          ? (((analytics.cartStats.conversions - baseline.conversions) / baseline.conversions) * 100).toFixed(2)
          : 0
      },
      revenue: {
        before: baseline.totalRevenue || 0,
        after: analytics.cartStats.totalRevenue,
        change: analytics.cartStats.totalRevenue - (baseline.totalRevenue || 0),
        changePercent: baseline.totalRevenue > 0
          ? (((analytics.cartStats.totalRevenue - baseline.totalRevenue) / baseline.totalRevenue) * 100).toFixed(2)
          : 0
      },
      avgCartValue: {
        before: baseline.avgCartValue || 0,
        after: analytics.cartStats.avgCartValue,
        change: analytics.cartStats.avgCartValue - (baseline.avgCartValue || 0),
        changePercent: baseline.avgCartValue > 0
          ? (((analytics.cartStats.avgCartValue - baseline.avgCartValue) / baseline.avgCartValue) * 100).toFixed(2)
          : 0
      }
    };

    return {
      installDate: analytics.installDate,
      daysSinceInstall,
      upsell: {
        views: analytics.upsellStats.views,
        clicks: analytics.upsellStats.clicks,
        addsToCart: analytics.upsellStats.addsToCart,
        revenue: analytics.upsellStats.revenue,
        clickRate: parseFloat(upsellClickRate),
        conversionRate: parseFloat(upsellConversionRate),
        overallRate: parseFloat(overallUpsellRate),
        products: analytics.upsellStats.products
      },
      cart: {
        opens: analytics.cartStats.opens,
        checkouts: analytics.cartStats.checkouts,
        conversions: analytics.cartStats.conversions,
        totalRevenue: analytics.cartStats.totalRevenue,
        avgCartValue: analytics.cartStats.avgCartValue,
        checkoutConversionRate: parseFloat(checkoutConversionRate),
        cartToCheckoutRate: parseFloat(cartToCheckoutRate)
      },
      beforeAfter,
      dailyStats: analytics.dailyStats
    };
  }

  // Export analytics data as JSON
  function exportAnalytics() {
    const analytics = getAnalytics();
    const metrics = getPerformanceMetrics();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      analytics,
      metrics
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quickcart-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Display analytics in console (for debugging)
  function logAnalytics() {
    const metrics = getPerformanceMetrics();
    if (metrics) {
      console.group('📊 QuickCart Analytics');
      console.log('Install Date:', metrics.installDate);
      console.log('Days Since Install:', metrics.daysSinceInstall);
      console.log('\n🛒 Cart Stats:');
      console.log('  Opens:', metrics.cart.opens);
      console.log('  Checkouts:', metrics.cart.checkouts);
      console.log('  Conversions:', metrics.cart.conversions);
      console.log('  Total Revenue:', metrics.cart.totalRevenue);
      console.log('  Avg Cart Value:', metrics.cart.avgCartValue);
      console.log('  Cart to Checkout Rate:', metrics.cart.cartToCheckoutRate + '%');
      console.log('  Checkout Conversion Rate:', metrics.cart.checkoutConversionRate + '%');
      console.log('\n📈 Upsell Stats:');
      console.log('  Views:', metrics.upsell.views);
      console.log('  Clicks:', metrics.upsell.clicks);
      console.log('  Adds to Cart:', metrics.upsell.addsToCart);
      console.log('  Revenue:', metrics.upsell.revenue);
      console.log('  Click Rate:', metrics.upsell.clickRate + '%');
      console.log('  Conversion Rate:', metrics.upsell.conversionRate + '%');
      console.log('  Overall Rate:', metrics.upsell.overallRate + '%');
      console.log('\n📊 Before/After Comparison:');
      console.log('  Cart Opens:', metrics.beforeAfter.cartOpens);
      console.log('  Conversions:', metrics.beforeAfter.conversions);
      console.log('  Revenue:', metrics.beforeAfter.revenue);
      console.log('  Avg Cart Value:', metrics.beforeAfter.avgCartValue);
      console.groupEnd();
    }
  }

  // Initialize on load
  initAnalytics();

  // Expose API to window
  window.QuickCartAnalytics = {
    track: trackEvent,
    getMetrics: getPerformanceMetrics,
    export: exportAnalytics,
    log: logAnalytics,
    init: initAnalytics
  };

  // Auto-track page views and checkout completion
  if (typeof window !== 'undefined') {
    // Track checkout completion (if on thank you page)
    if (window.location.pathname.includes('/thank_you') || 
        window.location.pathname.includes('/checkouts/') && window.location.search.includes('thank_you')) {
      // Try to get order data from Shopify
      if (window.Shopify && window.Shopify.checkout) {
        const orderTotal = window.Shopify.checkout.total_price || 0;
        trackEvent('conversion', {
          revenue: orderTotal / 100, // Convert cents to dollars
          orderId: window.Shopify.checkout.order_id
        });
      } else {
        // Fallback: track conversion without order data
        trackEvent('conversion', {
          revenue: 0
        });
      }
    }
  }

})();

