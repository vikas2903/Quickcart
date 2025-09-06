import { ensureAccessToken, buildRawEmail } from "../utils/google.server.js";
import { getTokenStore } from "./app.google.oauth.callback.js"; // adjust path to where you exported it

export async function action({ request }) {
  const body = await request.json();
  const { name, email, storeEmail, description } = body || {};

  // 1) Make sure we have a valid access token
  const tokenStore = getTokenStore(); // replace with a DB fetch in real code
  const accessToken = await ensureAccessToken(tokenStore);

  // 2) Build the message
  const SUPPORT_TO = "vikasprasad2903@gmail.com";       // where you want to receive
  const FROM_ADDR  = "me"; // 'me' = the authenticated Gmail account

  const subject = `Support Request from ${name || "Unknown"}`;
  const html =
    `<p><strong>Name:</strong> ${name || "-"}</p>` +
    `<p><strong>Email:</strong> ${email || "-"}</p>` +
    `<p><strong>Store Email:</strong> ${storeEmail || "-"}</p>` +
    `<p><strong>Description:</strong></p>` +
    `<pre style="white-space:pre-wrap;">${(description || "").replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]))}</pre>`;

  const raw = buildRawEmail({
    from: SUPPORT_TO,  // Gmail API will send as the authorized account; header From can match that
    to: SUPPORT_TO,
    subject,
    html
  });

  // 3) Send via Gmail API
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Gmail send failed:", data);
    return new Response("send failed", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
