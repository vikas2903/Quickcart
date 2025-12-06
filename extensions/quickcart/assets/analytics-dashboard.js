/**
 * QuickCart Analytics Dashboard
 * Access via browser console: QuickCartDashboard.show()
 */

(function() {
  'use strict';

  function createDashboard() {
    // Remove existing dashboard if present
    const existing = document.getElementById('quickcart-analytics-dashboard');
    if (existing) {
      existing.remove();
      return;
    }

    const dashboard = document.createElement('div');
    dashboard.id = 'quickcart-analytics-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    if (!window.QuickCartAnalytics) {
      dashboard.innerHTML = `
        <div style="color: white; text-align: center; padding: 50px;">
          <h2>QuickCart Analytics Not Loaded</h2>
          <p>Please ensure the analytics script is loaded.</p>
        </div>
      `;
      document.body.appendChild(dashboard);
      return;
    }

    const metrics = window.QuickCartAnalytics.getMetrics();
    if (!metrics) {
      dashboard.innerHTML = `
        <div style="color: white; text-align: center; padding: 50px;">
          <h2>No Analytics Data</h2>
          <p>Analytics data will appear here once events are tracked.</p>
        </div>
      `;
      document.body.appendChild(dashboard);
      return;
    }

    const formatNumber = (num) => {
      if (typeof num !== 'number') return '0';
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatCurrency = (num) => {
      if (typeof num !== 'number') return '$0.00';
      return '$' + formatNumber(num);
    };

    const formatPercent = (num) => {
      if (typeof num !== 'number') return '0.00%';
      return num.toFixed(2) + '%';
    };

    dashboard.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; padding: 20px; background: white; min-height: 100vh;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #333;">📊 QuickCart Analytics Dashboard</h1>
          <div>
            <button id="qc-export-btn" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Export Data</button>
            <button id="qc-close-btn" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
            <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Install Date</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${new Date(metrics.installDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${metrics.daysSinceInstall} days ago</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Cart Opens</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${metrics.cart.opens.toLocaleString()}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Checkouts</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${metrics.cart.checkouts.toLocaleString()}</p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${formatPercent(metrics.cart.cartToCheckoutRate)} cart to checkout</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;">
            <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Conversions</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${metrics.cart.conversions.toLocaleString()}</p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${formatPercent(metrics.cart.checkoutConversionRate)} conversion rate</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">💰 Revenue Metrics</h2>
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Total Revenue:</span>
                <strong style="color: #333;">${formatCurrency(metrics.cart.totalRevenue)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Avg Cart Value:</span>
                <strong style="color: #333;">${formatCurrency(metrics.cart.avgCartValue)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #666;">Upsell Revenue:</span>
                <strong style="color: #28a745;">${formatCurrency(metrics.upsell.revenue)}</strong>
              </div>
            </div>
          </div>

          <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">📈 Upsell Performance</h2>
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Views:</span>
                <strong style="color: #333;">${metrics.upsell.views.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Clicks:</span>
                <strong style="color: #333;">${metrics.upsell.clicks.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Adds to Cart:</span>
                <strong style="color: #28a745;">${metrics.upsell.addsToCart.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Click Rate:</span>
                <strong style="color: #007bff;">${formatPercent(metrics.upsell.clickRate)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Conversion Rate:</span>
                <strong style="color: #28a745;">${formatPercent(metrics.upsell.conversionRate)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #666;">Overall Rate:</span>
                <strong style="color: #ffc107;">${formatPercent(metrics.upsell.overallRate)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 30px;">
          <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">📊 Before/After Comparison</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
              <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Cart Opens</h3>
              <div style="margin-bottom: 5px;">
                <span style="color: #999; font-size: 12px;">Before: </span>
                <strong>${metrics.beforeAfter.cartOpens.before.toLocaleString()}</strong>
              </div>
              <div style="margin-bottom: 5px;">
                <span style="color: #999; font-size: 12px;">After: </span>
                <strong>${metrics.beforeAfter.cartOpens.after.toLocaleString()}</strong>
              </div>
              <div style="color: ${parseFloat(metrics.beforeAfter.cartOpens.changePercent) >= 0 ? '#28a745' : '#dc3545'};">
                ${parseFloat(metrics.beforeAfter.cartOpens.changePercent) >= 0 ? '+' : ''}${formatPercent(metrics.beforeAfter.cartOpens.changePercent)} change
              </div>
            </div>

            <div>
              <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Conversions</h3>
              <div style="margin-bottom: 5px;">
                <span style="color: #999; font-size: 12px;">Before: </span>
                <strong>${metrics.beforeAfter.conversions.before.toLocaleString()}</strong>
              </div>
              <div style="margin-bottom: 5px;">
                <span style="color: #999; font-size: 12px;">After: </span>
                <strong>${metrics.beforeAfter.conversions.after.toLocaleString()}</strong>
              </div>
              <div style="color: ${parseFloat(metrics.beforeAfter.conversions.changePercent) >= 0 ? '#28a745' : '#dc3545'};">
                ${parseFloat(metrics.beforeAfter.conversions.changePercent) >= 0 ? '+' : ''}${formatPercent(metrics.beforeAfter.conversions.changePercent)} change
              </div>
            </div>

            <div>
              <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Revenue</h3>
              <div style="margin-bottom: 5px;">
                <span style="color: #999; font-size: 12px;">Before: </span>
                <strong>${formatCurrency(metrics.beforeAfter.revenue.before)}</strong>
              </div>
              <div style="margin-bottom: 5px;">
                <span style="color: #999; font-size: 12px;">After: </span>
                <strong>${formatCurrency(metrics.beforeAfter.revenue.after)}</strong>
              </div>
              <div style="color: ${parseFloat(metrics.beforeAfter.revenue.changePercent) >= 0 ? '#28a745' : '#dc3545'};">
                ${parseFloat(metrics.beforeAfter.revenue.changePercent) >= 0 ? '+' : ''}${formatPercent(metrics.beforeAfter.revenue.changePercent)} change
              </div>
            </div>

            <div>
              <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Avg Cart Value</h3>
              <div style="margin-bottom: 5px;">
                <span style="color: #999; font-size: 12px;">Before: </span>
                <strong>${formatCurrency(metrics.beforeAfter.avgCartValue.before)}</strong>
              </div>
              <div style="margin-bottom: 5px;">
                <span style="color: #999; font-size: 12px;">After: </span>
                <strong>${formatCurrency(metrics.beforeAfter.avgCartValue.after)}</strong>
              </div>
              <div style="color: ${parseFloat(metrics.beforeAfter.avgCartValue.changePercent) >= 0 ? '#28a745' : '#dc3545'};">
                ${parseFloat(metrics.beforeAfter.avgCartValue.changePercent) >= 0 ? '+' : ''}${formatPercent(metrics.beforeAfter.avgCartValue.changePercent)} change
              </div>
            </div>
          </div>
        </div>

        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">📦 Top Upsell Products</h2>
          <div style="max-height: 400px; overflow-y: auto;">
            ${Object.keys(metrics.upsell.products).length > 0 
              ? Object.entries(metrics.upsell.products)
                  .sort((a, b) => b[1].adds - a[1].adds)
                  .slice(0, 10)
                  .map(([productId, stats]) => `
                  <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong style="color: #333;">Product ID: ${productId}</strong>
                      <div style="color: #666; font-size: 12px; margin-top: 5px;">
                        Views: ${stats.views} | Clicks: ${stats.clicks} | Adds: ${stats.adds} | Revenue: ${formatCurrency(stats.revenue)}
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="color: #28a745; font-weight: bold;">${formatPercent((stats.adds / stats.clicks) * 100)}</div>
                      <div style="color: #999; font-size: 12px;">conversion</div>
                    </div>
                  </div>
                `).join('')
              : '<p style="color: #999; text-align: center; padding: 20px;">No upsell product data yet</p>'
            }
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dashboard);

    // Close button
    document.getElementById('qc-close-btn').addEventListener('click', () => {
      dashboard.remove();
    });

    // Export button
    document.getElementById('qc-export-btn').addEventListener('click', () => {
      if (window.QuickCartAnalytics) {
        window.QuickCartAnalytics.export();
      }
    });

    // Close on escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        dashboard.remove();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  // Expose to window
  window.QuickCartDashboard = {
    show: createDashboard
  };

  // Auto-show if URL has parameter
  if (window.location.search.includes('quickcart_analytics=true')) {
    setTimeout(createDashboard, 500);
  }

})();

