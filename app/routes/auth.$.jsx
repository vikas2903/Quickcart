import { authenticate } from "../shopify.server";

// Temporary robust loader: catch and log errors during auth (useful for debugging
// installs that produce 500s). Remove or simplify this once the root cause is fixed.
export const loader = async ({ request }) => {
  try {
    await authenticate.admin(request);
    return null;
  } catch (err) {
    // Log full error server-side (Render / Heroku logs)
    console.error("auth.$ loader error:", err);
    // Return a controlled 500 response so the embed shows an Application Error
    // but the stack is available in server logs.
    throw new Response("Authentication error. See server logs for details.", { status: 500 });
  }
};
