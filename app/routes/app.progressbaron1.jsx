// app/routes/app.bxgy.jsx
import React, { useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Grid, LegacyCard, BlockStack, Checkbox, TextField, Button, Tabs, InlineStack, Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server.js";

const API_URL = "/app/quickcart/bxgy";

/** Gate the page by Shopify admin session; also pass shop in case you want it */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function BuyXGetYPage() {
  const { shop } = useLoaderData();
  return (
    <Page fullWidth>
      <TitleBar title="Buy X Get Y Offer" />
      <Layout>
        <Layout.Section>
          <BuyXGetYSection shop={shop} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function BuyXGetYSection({ shop }) {
  // ---------- FORM STATE ----------
  const [enabled, setEnabled] = useState(true);
  const [buyQty, setBuyQty] = useState("2");
  const [getQty, setGetQty] = useState("1");

  const [msgMany, setMsgMany] = useState("Add {{remaining}} more item(s) to unlock B{{buy}}G{{get}}");
  const [msgOne, setMsgOne] = useState("Add 1 more item to unlock B{{buy}}G{{get}}");
  const [msgUnlocked, setMsgUnlocked] = useState("🎁 Offer unlocked! B{{buy}}G{{get}} applied at checkout");

  const [previewQty, setPreviewQty] = useState("0");
  const [tab, setTab] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState(null); // {type:"success"|"critical", msg:string}

  // ---------- DERIVED ----------
  const buy = useMemo(() => Math.max(0, parseInt(buyQty || "0", 10)), [buyQty]);
  const get = useMemo(() => Math.max(0, parseInt(getQty || "0", 10)), [getQty]);
  const qty = useMemo(() => Math.max(0, parseInt(previewQty || "0", 10)), [previewQty]);

  const remaining = useMemo(() => Math.max(0, buy - qty), [buy, qty]);
  const fillPercent = useMemo(() => (buy ? Math.min(100, Math.round((qty / buy) * 100)) : 0), [qty, buy]);

  const tmpl = (s) =>
    (s || "")
      .replace(/{{\s*remaining\s*}}/gi, String(remaining))
      .replace(/{{\s*buy\s*}}/gi, String(buy))
      .replace(/{{\s*get\s*}}/gi, String(get));

  const bannerText = useMemo(() => {
    if (!enabled) return "Offer is disabled";
    if (!buy) return "Set Buy quantity to start the preview";
    if (remaining <= 0) return tmpl(msgUnlocked);
    if (remaining === 1) return tmpl(msgOne);
    return tmpl(msgMany);
  }, [enabled, buy, remaining, tmpl, msgUnlocked, msgOne, msgMany]);

  const payload = useMemo(
    () => ({
      // shop optional; server infers from session, but you can include it
      // shop,
      enabled,
      offer: { buyQty: buy, getQty: get },
      messages: {
        remainingMany: msgMany,
        remainingOne: msgOne,
        unlocked: msgUnlocked,
      },
    }),
    [enabled, buy, get, msgMany, msgOne, msgUnlocked]
  );

  // ---------- HANDLERS ----------
  const handleSubmit = async () => {
    if (!Number.isFinite(buy) || buy < 1 || !Number.isFinite(get) || get < 1) {
      setNote({ type: "critical", msg: "Buy and Get must be numbers ≥ 1." });
      return;
    }

    setIsSubmitting(true);
    setNote(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out?.ok) {
        throw new Error(out?.error || `HTTP ${res.status} ${res.statusText}`);
      }

      setNote({ type: "success", msg: "BxGy configuration saved." });
      console.log("Saved:", out.data);
    } catch (e) {
      setNote({ type: "critical", msg: e?.message || "Failed to save configuration." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- RENDER ----------
  return (
    <Grid>
      {/* LEFT: form */}
      <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <LegacyCard sectioned>
          <BlockStack gap="500">
            {note && <Banner tone={note.type === "success" ? "success" : "critical"}>{note.msg}</Banner>}

            <Checkbox label="Enable Buy X Get Y" checked={enabled} onChange={setEnabled} />

            <Banner tone="info">
              Use placeholders in messages: <b>{`{{remaining}}`}</b>, <b>{`{{buy}}`}</b>, <b>{`{{get}}`}</b>
            </Banner>

            <InlineStack gap="300">
              <TextField
                label="Buy quantity (X)"
                type="number"
                inputMode="numeric"
                min={0}
                value={buyQty}
                onChange={setBuyQty}
                autoComplete="off"
              />
              <TextField
                label="Free quantity (Y)"
                type="number"
                inputMode="numeric"
                min={0}
                value={getQty}
                onChange={setGetQty}
                autoComplete="off"
              />
            </InlineStack>

            <LegacyCard sectioned>
              <BlockStack gap="300">
                <strong>Messages</strong>
                <TextField label="When 2+ remaining" value={msgMany} onChange={setMsgMany} autoComplete="off" />
                <TextField label="When 1 remaining" value={msgOne} onChange={setMsgOne} autoComplete="off" />
                <TextField label="When unlocked" value={msgUnlocked} onChange={setMsgUnlocked} autoComplete="off" />
              </BlockStack>
            </LegacyCard>

            <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
              Submit
            </Button>
          </BlockStack>
        </LegacyCard>
      </Grid.Cell>

      {/* RIGHT: preview */}
      <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <LegacyCard>
          <LegacyCard.Section>
            <Tabs
              tabs={[{ id: "desktop", content: "Desktop" }, { id: "mobile", content: "Mobile" }]}
              selected={tab}
              onSelect={setTab}
            />
          </LegacyCard.Section>

          <LegacyCard.Section>
            <BlockStack gap="400">
              <TextField
                label="Preview cart quantity"
                type="number"
                inputMode="numeric"
                min={0}
                value={previewQty}
                onChange={setPreviewQty}
                autoComplete="off"
              />
              <PreviewBxGy
                mode={tab === 0 ? "desktop" : "mobile"}
                enabled={enabled}
                buy={buy}
                get={get}
                fillPercent={fillPercent}
                bannerText={bannerText}
              />
            </BlockStack>
          </LegacyCard.Section>
        </LegacyCard>
      </Grid.Cell>
    </Grid>
  );
}

function PreviewBxGy({ mode, enabled, buy, get, fillPercent, bannerText }) {
  const isMobile = mode === "mobile";

  const frame = {
    width: isMobile ? 360 : "100%",
    maxWidth: isMobile ? 360 : 960,
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
    marginInline: "auto",
  };

  const barTrack = {
    width: "100%",
    height: 8,
    background: "#EEEFF3",
    borderRadius: 999,
    position: "relative",
    overflow: "hidden",
    marginTop: 6,
  };

  const barFill = {
    width: `${enabled ? fillPercent : 0}%`,
    height: "100%",
    background: "linear-gradient(90deg, #111827, #374151)",
    transition: "width 300ms ease",
  };

  return (
    <div style={frame}>
      <div style={{ textAlign: "center", fontSize: 14, marginBottom: 6 }}>{bannerText}</div>
      <div style={{ textAlign: "center", fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
        {enabled ? `Buy ${buy || 0} Get ${get || 0}` : "Offer disabled"}
      </div>

      <div style={{ position: "relative" }}>
        <div style={barTrack}>
          <div style={barFill} />
          {/* end marker dot */}
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -6,
              width: 12,
              height: 12,
              background: "#9CA3AF",
              borderRadius: 999,
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#6B7280" }}>
          <div>0</div>
          <div>Target: {buy} item{buy === 1 ? "" : "s"}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
          <div style={{ width: "33.33%", textAlign: "center" }} />
          <div style={{ width: "33.33%", textAlign: "center" }}>
            <div style={{ fontSize: 16 }}>🎁</div>
            <div>Unlock: B{buy}G{get}</div>
          </div>
          <div style={{ width: "33.33%", textAlign: "center" }} />
        </div>
      </div>
    </div>
  );
}
