let TOKEN_STORE = { access_token: null, refresh_token: null, expiry: 0 }; // replace with DB

export async function loader({ request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("Missing code", { status: 400 });

  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const tokens = await res.json();

  if (!res.ok) {
    console.error("Token exchange failed:", tokens);
    return new Response("OAuth failed", { status: 500 });
  }

  TOKEN_STORE.access_token = tokens.access_token;
  TOKEN_STORE.refresh_token = tokens.refresh_token || TOKEN_STORE.refresh_token;
  TOKEN_STORE.expiry = Date.now() + (tokens.expires_in - 60) * 1000; // minus 60s buffer

  return new Response("Gmail connected. You can close this tab.", { status: 200 });
}

// Export a helper to be imported elsewhere (or move to a shared module)
export function getTokenStore() {
  return TOKEN_STORE;
}
