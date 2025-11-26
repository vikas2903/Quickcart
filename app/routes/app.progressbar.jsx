import React, { useEffect, useMemo, useState } from "react";
import {
  Page,
  Layout,
  Grid,
  LegacyCard,
  BlockStack,
  Checkbox,
  TextField,
  Button,
  Tabs,
  InlineStack,
  Banner
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";

// must match the API route file above
const API_URL = "/app/quickcart/unlockprice";

/** Loader: get shop from admin session */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop }); // e.g. "d2c-apps.myshopify.com"
};

export default function ProgressBar() {
  const { shop } = useLoaderData();

  /* ---------- FORM STATE ---------- */
  const [enabled, setEnabled] = useState(true);
  const [prices, setPrices] = useState(["799", "1499", "2499"]);
  const [texts, setTexts] = useState([
    "Extra 5% off on ₹{{price}}",
    "Extra 10% off on ₹{{price}}",
    "Extra 15% off on ₹{{price}}",
  ]);
  const [progressBarColor, setProgressBarColor] = useState("#000000");

  const [previewTotal, setPreviewTotal] = useState("999");
  const [tab, setTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  const [savedata, setsaveddata] = useState({
    enabled : '',
    milestones: [],
    progressBarColor: '#000000'
  })
  const nf = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );
 

  const saveddata_progressbar  = async () =>{

    const retrive_saved_data = await  fetch(`https://quickcart-vf8k.onrender.com/app/quickcart/unlockprice?shop=${encodeURIComponent(shop)}`,
  {
    method:"GET",
    headers:{
      "Content-Type": "application/json",
      "X-Shopify-Shop-Domain": shop,
      Accept: "application/json",
    },
  })
    const getapidata = await retrive_saved_data.json();
    const getted_data = getapidata?.data
    return getted_data;
  
  }

  const pNums = useMemo(
    () => prices.map((v) => Math.max(0, Number(v) || 0)),
    [prices]
  );
  const cartTotal = useMemo(
    () => Math.max(0, Number(previewTotal) || 0),
    [previewTotal]
  );

  const milestones = useMemo(
    () =>
      pNums.map((price, i) => ({
        price,
        text: (texts[i] || "").replace("{{price}}", String(price)),
      })),
    [pNums, texts]
  );

  const maxPrice = useMemo(() => Math.max(...pNums, 0), [pNums]);
  const fillPercent = useMemo(
    () => (maxPrice ? Math.min(100, Math.round((cartTotal / maxPrice) * 100)) : 0),
    [cartTotal, maxPrice]
  );

  const nextMilestone = useMemo(() => {
    const sorted = milestones
      .filter((m) => m.price > 0)
      .sort((a, b) => a.price - b.price);
    return sorted.find((m) => cartTotal < m.price) || null;
  }, [milestones, cartTotal]);

  const awayText = useMemo(() => {
    if (!enabled) return "Progress bar is disabled";
    if (!nextMilestone) return "🎉 You’ve unlocked the highest offer!";
    const diff = Math.max(0, nextMilestone.price - cartTotal);
    return `You are ${nf.format(diff)} away from ${nextMilestone.text.replace(
      "{{price}}",
      String(nextMilestone.price)
    )} on ${nf.format(nextMilestone.price)}`;
  }, [enabled, nextMilestone, cartTotal, nf]);

  /* ---------- LOAD EXISTING (by shopName via header) ---------- */
  useEffect(() => {
    if (!shop) return;
    (async () => {
      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            "X-Shopify-Shop-Domain": shop,
            Accept: "application/json",
          },
        });
        const json = await res.json();
        if (json?.ok && json.data) {
          setEnabled(!!json.data.enabled);
          if (json.data.progressBarColor) {
            setProgressBarColor(json.data.progressBarColor);
          }
          const ms = Array.isArray(json.data.milestones)
            ? json.data.milestones
            : [];
          if (ms.length) {
            setPrices(ms.map((m) => String(m.price)));
            setTexts(ms.map((m) => String(m.text || "")));
          }
        }
      } catch (e) {
        console.warn("Failed to load unlock price config:", e);
      }
    })();
      async function fetchData() {
      const progressbardata = await saveddata_progressbar();

      console.log("progressbardata", progressbardata)

      let milestones  = progressbardata?.milestones
      let enalbled = progressbardata?.enabled
    
       const savedColor = progressbardata?.progressBarColor || '#000000';
       setsaveddata({enalbled, milestones, progressBarColor: savedColor});
    }
    fetchData();
    
  }, [shop, submitStatus]);

  /* ---------- INPUT HANDLERS ---------- */
  const onPriceChange = (i) => (val) =>
    setPrices((arr) => arr.map((v, idx) => (idx === i ? val : v)));
  const onTextChange = (i) => (val) =>
    setTexts((arr) => arr.map((v, idx) => (idx === i ? val : v)));

  /* ---------- SAVE ---------- */
  const handleSubmit = async () => {
    if (!shop) {
      setSubmitStatus({
        type: "error",
        message: "Shop domain missing. Cannot save.",
      });
      return;
    }

    const payload = {
      // you can include shopName in body too, but header is the source of truth
      shopName: shop,
      enabled,
      progressBarColor,
      milestones: milestones.map((m) => ({
        price: Number(m.price) || 0,
        text: String(m.text || "").trim(),
      })),
    };

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shop,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` — ${txt}` : ""}`);
      }

      setSubmitStatus({
        type: "success",
        message: "Configuration saved successfully.",
      });
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message: err?.message || "Failed to save configuration.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <Page fullWidth>
      <TitleBar title="Unlock Offers" />

      <Layout>
        <Layout.Section>
          <Grid>
            {/* LEFT: Form */}
            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
              <LegacyCard sectioned>
                <BlockStack gap="500">
                  {submitStatus && (
                    <Banner
                      tone={submitStatus.type === "success" ? "success" : "critical"}
                    >
                      {submitStatus.message}
                    </Banner>
                  )}

                  <Checkbox
                    label="Enable progress bar"
                    checked={enabled}
                    onChange={setEnabled}
                  />

                  {/* Progress Bar Color Picker */}
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Progress Bar Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="color"
                        value={progressBarColor}
                        onChange={(e) => setProgressBarColor(e.target.value)}
                        style={{
                          width: '50px',
                          height: '40px',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      />
                      <TextField
                        value={progressBarColor}
                        onChange={setProgressBarColor}
                        autoComplete="off"
                        placeholder="#000000"
                        maxLength={7}
                      />
                      <div style={{
                        display: 'flex',
                        gap: '6px'
                      }}>
                        {['#000000', '#2e7d32', '#1565d8', '#d32f2f', '#7b1fa2', '#ff6f00'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setProgressBarColor(color)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: color,
                              border: progressBarColor === color ? '3px solid #333' : '2px solid #ddd',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Banner tone="info">
                    Use <strong>{`{{price}}`}</strong> in the text to auto-insert
                    each milestone price.
                  </Banner>

                  {[0, 1, 2].map((i) => (
                    <LegacyCard key={i} sectioned>
                      <BlockStack gap="300">
                        <strong>Milestone {i + 1}</strong>
                        <TextField
                          label={`Price ${i + 1} (₹)`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={prices[i]}
                          onChange={onPriceChange(i)}
                          autoComplete="off"
                        />
                        <TextField
                          label={`Text ${i + 1}`}
                          value={texts[i]}
                          onChange={onTextChange(i)}
                          autoComplete="off"
                          helpText='Example: "Extra 10% off on ₹{{price}}"'
                        />
                      </BlockStack>
                    </LegacyCard>
                  ))}

                  <InlineStack gap="300"></InlineStack>
                  <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
                    Submit
                  </Button>
                </BlockStack>
              </LegacyCard>
            </Grid.Cell>

            {/* RIGHT: Preview */}
            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
              <LegacyCard>
                <LegacyCard.Section>
                  <Tabs
                    tabs={[
                      { id: "desktop", content: "Desktop" },
                      { id: "mobile", content: "Mobile" },
                    ]}
                    selected={tab}
                    onSelect={setTab}
                  />
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <BlockStack gap="400">
                    <TextField
                      label="Preview cart total (₹)"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={previewTotal}
                      onChange={setPreviewTotal}
                      autoComplete="off"
                    />
                    <Preview
                      mode={tab === 0 ? "desktop" : "mobile"}
                      enabled={enabled}
                      milestones={milestones}
                      fillPercent={fillPercent}
                      awayText={awayText}
                      nf={nf}
                      maxPrice={maxPrice}
                      progressBarColor={progressBarColor}
                    />
                  </BlockStack>
                </LegacyCard.Section>
              </LegacyCard>

              <LegacyCard>
                <LegacyCard.Section>
                   <Banner tone="info">
                    Discount applied at order value previous saved configuration
                  </Banner>


                  {
                    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Progress Bar Data</h2>

      {/* General Info Table */}
      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginBottom: "20px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <tbody>
          <tr>
            <th align="left">Shop Name</th>
            <td>{shop}</td>
          </tr>
          <tr>
            <th align="left">Enabled</th>
            <td>{savedata.enalbled ? "✅ Yes" : "❌ No"}</td>
          </tr>
          <tr>
            <th align="left">Progress Bar Color</th>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: savedata.progressBarColor || '#000000',
                  border: '1px solid #ddd'
                }} />
                <span>{savedata.progressBarColor || '#000000'}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Milestones Table */}
{savedata.enalbled ?
<div>
      <h3>Milestones</h3>
      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead style={{ backgroundColor: "#eee" }}>
          <tr>
            <th>Price (₹)</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {savedata.milestones.map((item, index) => (
            <tr key={index}>
              <td>{item.price}</td>
              <td>{item.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      : ''}
    </div>
                  }
                   
                </LegacyCard.Section>
              </LegacyCard>
            </Grid.Cell>
          </Grid>    
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/* ---------- PREVIEW ---------- */
function Preview({ mode, enabled, milestones, fillPercent, awayText, nf, maxPrice, progressBarColor }) {
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
    background: progressBarColor || "#000000",
    transition: "width 300ms ease",
  };

  const markerWrap = {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 10,
    color: "#6B7280",
    fontSize: 12,
  };

  const markers = milestones
    .filter((m) => m.price > 0 && maxPrice > 0)
    .map((m, idx) => ({
      left: `${Math.min(100, (m.price / maxPrice) * 100)}%`,
      label: m.text.replace("{{price}}", String(m.price)),
      price: m.price,
      key: idx,
      emoji: idx === 0 ? "🥳" : "😺",
    }));

  return (
    <div style={frame}>
      <div style={{ textAlign: "center", fontSize: 14, marginBottom: 6 }}>
        {awayText}
      </div>

      <div style={{ position: "relative" }}>
        <div style={barTrack}>
          <div style={barFill} />
          {markers.map((m) => (
            <div
              key={m.key}
              style={{
                position: "absolute",
                top: -2,
                left: `calc(${m.left} - 6px)`,
                width: 12,
                height: 12,
                background: "#9CA3AF",
                borderRadius: 999,
              }}
            />
          ))}
        </div>

        <div style={markerWrap}>
          {markers.map((m) => (
            <div key={m.key} style={{ width: "33.33%", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{m.emoji}</div>
              <div>{m.label}</div>
              <div style={{ opacity: 0.8 }}>{nf.format(m.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
