export async function ensureAccessToken(store) {
  if (store.access_token && Date.now() < store.expiry) return store.access_token;

  if (!store.refresh_token) throw new Error("No refresh token. Connect Gmail again.");

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: store.refresh_token,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await res.json();

  if (!res.ok) {
    console.error("Refresh failed:", data);
    throw new Error("Failed to refresh Gmail token");
  }

  store.access_token = data.access_token;
  store.expiry = Date.now() + (data.expires_in - 60) * 1000;
  return store.access_token;
}

export function buildRawEmail({ from, to, subject, text, html }) {
  // Build simple RFC 2822 message
  let msg =
    `To: ${to}\r\n` +
    `From: ${from}\r\n` +
    `Subject: ${subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    (html
      ? `Content-Type: text/html; charset="UTF-8"\r\n\r\n${html}\r\n`
      : `Content-Type: text/plain; charset="UTF-8"\r\n\r\n${text || ""}\r\n`);

  // base64url encode
  return Buffer
    .from(msg, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
