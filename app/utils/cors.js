// app/utils/cors.js
export function cors(request) {
  const origin = request.headers.get("origin");

  // whitelist only Shopify + your app host
  const allowed = [
    /\.myshopify\.com$/,         // all merchant stores
    /\.shopify\.com$/,           // admin/shopify domains
    "https://quickcart-vf8k.onrender.com", // your app host
  ];

  let allowOrigin = null;
  if (
    origin &&
    allowed.some(rule =>
      typeof rule === "string" ? rule === origin : rule.test(origin)
    )
  ) {
    allowOrigin = origin;
  }

  // Build CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Shopify-Shop-Domain",
  };

  // If we have an allowed origin, use it with credentials
  // If no origin or not allowed, use * but without credentials (CORS spec requirement)
  if (allowOrigin) {
    corsHeaders["Access-Control-Allow-Origin"] = allowOrigin;
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
  } else {
    // Fallback: allow all origins but without credentials
    // This is needed for storefront extensions that might not send origin header
    corsHeaders["Access-Control-Allow-Origin"] = "*";
    // Note: Cannot use credentials with wildcard origin
  }

  return corsHeaders;
}
