import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import CollectionBasedProgressBar from "../models/collection-based-progressbar-qty-price-based-modals.js";
import { cors } from "../utils/cors.js";

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
        const data = await CollectionBasedProgressBar.findOne({
            storeName: shop
        }).lean();
        return json({ ok: true, data: data || null }, { headers: { ...cors(request), "Cache-Control": "no-store" } });
    }
    catch (error) {
        return json({ ok: false, error: error?.message || "DB read failed" }, { status: 500, headers: cors(request) });
    }

};

export const action = async ({ request }) => {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors(request) });
    }
    if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, { status: 405, headers: cors(request) });
    }
    const { session } = await authenticate.admin(request);
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
    }
    catch (error) {
        return json({ ok: false, error: "Invalid JSON body" }, { status: 400, headers: cors(request) });
    }
    try {

        const filter = { storeName: shop };
        const update = { ...body, storeName: shop };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const result = await CollectionBasedProgressBar.find
        OneAndUpdate(filter, update, options).lean();



        return json({ ok: true, data: result }, { headers: cors(request) });
    }
    catch (error) {
        return json({ ok: false, error: error?.message || "DB write failed" }, { status: 500, headers: cors(request) });
    }

}