// Select progress bar wrapper and bar
let progress_bar_percentage = document.querySelector('.progress-bar .progress');
let nearestamount = document.querySelector('.nearestAmount');
let milstone_label = document.querySelector('.milstone_label');

// Define milestone prices and messages
let milestonePrices = [
  { price: 799, text: 'Extra 5% off on ₹799' },
  { price: 1499, text: 'Extra 10% off on ₹1499' },
  { price: 2499, text: 'Extra 15% off on ₹2499' }
];

// Fetch Shopify cart
async function getShopifyCart() {
  try {
    const response = await fetch('/cart.js', { method: 'GET', headers: { 'Content-Type': 'application/json' }});
    if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching Shopify cart:', error);
    return null;
  }
}

// Update progress bar and milestone info
function updateProgressBar(cart) {
  if (!cart) return;

  let cart_total = cart.original_total_price / 100; // Convert cents to ₹


  console.log(cart_total);
  
  // progress_bar_percentage.style.width = `${progressPercent}%`;
}

// Initialize on page load
setTimeout(async () => {
  const cart = await getShopifyCart();
  if (cart) updateProgressBar(cart);
}, 1000);

// Listen for cart updates
document.addEventListener('cart:updated', async () => {
  const cart = await getShopifyCart();
  if (cart) updateProgressBar(cart);
});

// Patch Shopify AJAX cart calls to dispatch event
(function interceptCart() {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (args[0].includes('/cart/add') || args[0].includes('/cart/change') || args[0].includes('/cart/update')) {
      document.dispatchEvent(new Event('cart:updated'));
    }
    return response;
  };
})();
