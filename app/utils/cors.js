// app/utils/cors.js
export function cors(request) {
  const origin = request.headers.get("origin");

  // whitelist only Shopify + your app host
  const allowed = [
    /\.myshopify\.com$/,         // all merchant stores
    /\.shopify\.com$/,           // admin/shopify domains
    "https://quickcart-68ln.onrender.com", // your app host
  ];

  let allowOrigin = "";
  if (
    origin &&
    allowed.some(rule =>
      typeof rule === "string" ? rule === origin : rule.test(origin)
    )
  ) {
    allowOrigin = origin;
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin || "*", // tighten later
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Shopify-Shop-Domain",
    "Access-Control-Allow-Credentials": "true",
  };
}
