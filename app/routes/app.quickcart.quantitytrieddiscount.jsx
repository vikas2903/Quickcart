import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import QuantityBasedProgressBar from "../models/quantity_based_discount.js";
import { cors } from "../utils/cors.js";
import {
  COMPLETION_TEXT_METAFIELDS,
  normalizeCompletionText,
  readCompletionTextMetafield,
  saveCompletionTextMetafield,
} from "../utils/progressbar-completion-text.server.js";

function normalizeSteps(rawSteps) {
  if (!Array.isArray(rawSteps)) return [];

  return rawSteps
    .map((step) => ({
      qty: Number.parseInt(step?.qty, 10),
      label: String(step?.label || "").trim(),
    }))
    .filter(
      (step) => Number.isInteger(step.qty) && step.qty > 0 && step.label.length > 0,
    )
    .sort((a, b) => a.qty - b.qty);
}

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(request) });
  }

  const shop = (request.headers.get("x-shopify-shop-domain") || "")
    .toLowerCase()
    .trim();

  if (!shop) {
    return json(
      { ok: false, error: "Missing X-Shopify-Shop-Domain header" },
      { status: 400, headers: cors(request) },
    );
  }

  await connectDatabase();

  try {
    const data = await QuantityBasedProgressBar.findOne({ shop }).lean();
    let completionText = "";

    try {
      const { admin } = await authenticate.admin(request);
      completionText = await readCompletionTextMetafield(
        admin,
        COMPLETION_TEXT_METAFIELDS.quantity,
      );
    } catch {
      // Storefront app-proxy requests do not have an Admin API session.
    }

    return json(
      { ok: true, data: data ? { ...data, completionText } : null },
      { headers: { ...cors(request), "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return json(
      { ok: false, error: error?.message || "DB read failed" },
      { status: 500, headers: cors(request) },
    );
  }
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(request) });
  }

  if (request.method !== "POST") {
    return json(
      { ok: false, error: "Method not allowed" },
      { status: 405, headers: cors(request) },
    );
  }

  const { session, admin } = await authenticate.admin(request);
  const shopFromSession = (session?.shop || "").toLowerCase().trim();
  const shop = (request.headers.get("x-shopify-shop-domain") || shopFromSession)
    .toLowerCase()
    .trim();

  if (!shop) {
    return json(
      { ok: false, error: "Missing shop (header or session)" },
      { status: 400, headers: cors(request) },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(
      { ok: false, error: "Invalid JSON" },
      { status: 400, headers: cors(request) },
    );
  }

  const enabled = !!body?.enabled;
  const color = String(body?.color || "#000000").trim() || "#000000";
  const steps = normalizeSteps(body?.steps);
  const completionText = normalizeCompletionText(body?.completionText);

  if (steps.length === 0) {
    return json(
      { ok: false, error: "At least one valid quantity step is required" },
      { status: 400, headers: cors(request) },
    );
  }

  await connectDatabase();

  try {
    const savedCompletionText = await saveCompletionTextMetafield(
      admin,
      COMPLETION_TEXT_METAFIELDS.quantity,
      completionText,
    );

    const saved = await QuantityBasedProgressBar.findOneAndUpdate(
      { shop },
      {
        $set: { enabled, color, steps },
        $setOnInsert: { shop },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return json(
      { ok: true, data: { ...saved, completionText: savedCompletionText } },
      { headers: cors(request) },
    );
  } catch (error) {
    return json(
      { ok: false, error: error?.message || "Failed to save quantity progress bar" },
      { status: 500, headers: cors(request) },
    );
  }
};
