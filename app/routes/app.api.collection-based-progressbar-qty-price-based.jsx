import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import CollectionBasedProgressBar from "../models/collection-based-progressbar-qty-price-based-modals.js";
import { cors } from "../utils/cors.js";

function normalizeMilestones(rawMilestones) {
    if (!Array.isArray(rawMilestones)) {
        return [];
    }

    return rawMilestones
        .map((milestone) => ({
            value: Number.parseFloat(milestone?.value),
            text: String(milestone?.text || "").trim(),
        }))
        .filter((milestone) => Number.isFinite(milestone.value) && milestone.value >= 0 && milestone.text.length > 0)
        .sort((a, b) => a.value - b.value);
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
        const progressbarEnabled = !!body?.progressbarEnabled;
        const mode = body?.mode === "quantity" ? "quantity" : "price";
        const collectionTag = String(body?.collectionTag || "").trim();
        const priceMilestones = normalizeMilestones(body?.priceMilestones);
        const quantityMilestones = normalizeMilestones(body?.quantityMilestones);

        if (!collectionTag) {
            return json(
                { ok: false, error: "Collection tag is required" },
                { status: 400, headers: cors(request) },
            );
        }

        if (mode === "price" && priceMilestones.length === 0) {
            return json(
                { ok: false, error: "At least one valid price milestone is required" },
                { status: 400, headers: cors(request) },
            );
        }

        if (mode === "quantity" && quantityMilestones.length === 0) {
            return json(
                { ok: false, error: "At least one valid quantity milestone is required" },
                { status: 400, headers: cors(request) },
            );
        }

        const filter = { storeName: shop };
        const update = {
            $set: {
                storeName: shop,
                progressbarEnabled,
                mode,
                collectionTag,
                milestones: {
                    price: priceMilestones,
                    quantity: quantityMilestones,
                },
            },
        };
        const options = {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        };
        const result = await CollectionBasedProgressBar.findOneAndUpdate(filter, update, options).lean();

        return json({ ok: true, data: result }, { headers: cors(request) });
    }
    catch (error) {
        return json({ ok: false, error: error?.message || "DB write failed" }, { status: 500, headers: cors(request) });
    }

}
