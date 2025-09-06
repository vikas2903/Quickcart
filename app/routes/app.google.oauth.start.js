import { redirect } from "@remix-run/node";

export async function loader() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.send");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",   // get refresh_token
    prompt: "consent",        // force refresh_token first time
    scope
  });
  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
