// app/routes/app.bxgy.jsx
import React, { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server.js";
import {
  Page, Layout, Card, BlockStack, Checkbox, TextField, Autocomplete, Button, Banner,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

const API_RULE   = "/app/api/bxfrule";
const API_SEARCH = "/app/api/products/search";
const API_LOOKUP = "/app/api/products/lookup";

export default function BxgyPage() {
  const { shop } = useLoaderData();
  const shortShop = shop.replace(".myshopify.com", "");
  console.log("vikasShortShop",shortShop);
  // form state
  const [enabled, setEnabled] = useState(true);
  const [buyQty, setBuyQty] = useState("2");

  // BUY (multi)
  const [buySelected, setBuySelected] = useState([]);   // array of product GIDs
  const [buyQuery, setBuyQuery] = useState("");
  const [buyOptions, setBuyOptions] = useState([]);

  // FREE (single)
  const [freeSelected, setFreeSelected] = useState([]); // array with 1 GID
  const [freeQuery, setFreeQuery] = useState("");
  const [freeOptions, setFreeOptions] = useState([]);

  const [status, setStatus] = useState(null); // { type: "success" | "critical", text: string }

  // Load saved rule
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_RULE, { headers: { "X-Shopify-Shop-Domain": shop } });
        const json = await res.json();
        if (json?.ok && json.data) {
          setEnabled(!!json.data.enabled);
          setBuyQty(String(json.data.buyQty || 2));
          const savedBuy = Array.isArray(json.data.buyProductIds) ? json.data.buyProductIds : [];
          const savedFree = json.data.freeProductId ? [json.data.freeProductId] : [];
          setBuySelected(savedBuy);
          setFreeSelected(savedFree);

          // resolve product titles for saved IDs so chips show labels
          const ids = [...savedBuy, ...savedFree];
          if (ids.length) {
            const query = ids.map(id => `id=${encodeURIComponent(id)}`).join("&");
            const look = await fetch(`${API_LOOKUP}?${query}`, { headers: { "X-Shopify-Shop-Domain": shop } });
            const lj = await look.json();
            if (lj?.ok) {
              const allOpts = lj.items.map(i => ({ value: i.id, label: i.title }));
              setBuyOptions(allOpts.filter(o => savedBuy.includes(o.value)));
              setFreeOptions(allOpts.filter(o => savedFree.includes(o.value)));
            }
          }
        }
      } catch (e) {
        console.warn("Load rule failed", e);
      }
    })();
  }, [shop]);

  // search BUY as user types
  useEffect(() => {
    const q = buyQuery.trim();
    const t = setTimeout(async () => {
      const url = `${API_SEARCH}?q=${encodeURIComponent(q)}&limit=50`;
      const res = await fetch(url, { headers: { "X-Shopify-Shop-Domain": shop } });
      const js = await res.json();
      if (js?.ok) setBuyOptions(js.items.map(i => ({ value: i.id, label: i.title })));
    }, 250);
    return () => clearTimeout(t);
  }, [buyQuery, shop]);

  // search FREE as user types
  useEffect(() => {
    const q = freeQuery.trim();
    const t = setTimeout(async () => {
      const url = `${API_SEARCH}?q=${encodeURIComponent(q)}&limit=50`;
      const res = await fetch(url, { headers: { "X-Shopify-Shop-Domain": shop } });
      const js = await res.json();
      if (js?.ok) setFreeOptions(js.items.map(i => ({ value: i.id, label: i.title })));
    }, 250);
    return () => clearTimeout(t);
  }, [freeQuery, shop]);

  const handleSave = async () => {
    setStatus(null);
    try {
      const payload = {
        enabled,
        buyQty: Number(buyQty) || 0,
        buyProductIds: buySelected,         // ✅ correct key
        freeProductId: freeSelected[0] || "",
      };
      const res = await fetch(API_RULE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shop,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${txt}`);
      }
      setStatus({ type: "success", text: "Saved!" });
    } catch (e) {
      setStatus({ type: "critical", text: e.message || "Save failed" });
    }
  };

  return (
    <Page title="Buy X, Get 1 Free (by product)">
      <Layout>
        <Layout.Section>
          
          <Card >
            <BlockStack gap="400">
              {status && <Banner tone={status.type}>{status.text}</Banner>}

              <Checkbox label="Enable rule" checked={enabled} onChange={setEnabled} />
              <Banner tone="info">
                <p>
                  <strong>Important:</strong> This rule will give free product to the customer when they buy the selected products.
                </p>
                </Banner>

              <TextField
                label="Buy quantity (X)"
                type="number"
                min={1}
                value={buyQty}
                onChange={setBuyQty}
                autoComplete="off"
              />

              {/* BUY products (multi-select) */}
              <Autocomplete
                allowMultiple
                options={buyOptions}
                selected={buySelected}
                onSelect={setBuySelected}
                textField={
                  <Autocomplete.TextField
                    label="Buy products (search & select multiple)"
                    value={buyQuery}
                    onChange={setBuyQuery}
                    autoComplete="off"
                    placeholder="Search products…"
                  />
                }
              />

              {/* FREE product (single-select) */}
              <Autocomplete
                options={freeOptions}
                selected={freeSelected}
                onSelect={setFreeSelected}
                textField={
                  <Autocomplete.TextField
                    label="Free product (search & select one)"
                    value={freeQuery}
                    onChange={setFreeQuery}
                    autoComplete="off"
                    placeholder="Search products…"
                  />
                }
              />

              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
