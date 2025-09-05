// app/utils/verifyShopifyWebhook.js
import crypto from "crypto";

/**
 * Verify Shopify webhook HMAC.
 * @param {string|Buffer} rawBody - exact request body as sent
 * @param {string} hmacHeader - value from "x-shopify-hmac-sha256"
 * @param {string} secret - your app's API secret key
 * @returns {boolean}
 */
export function verifyShopifyHmac(rawBody, hmacHeader, secret) {
  if (!hmacHeader || !secret) return false;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), "utf8"))
    .digest("base64");
  // timing-safe compare
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}
