import React, {useMemo, useState} from "react";
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
  Banner,
} from "@shopify/polaris";
import {TitleBar} from "@shopify/app-bridge-react";

// 👉 Change this to your backend route if needed
const API_URL = "/api/progress-bar";

export default function ProgressBar() {
  /* ---------- FORM STATE ---------- */
  const [enabled, setEnabled] = useState(true);

  // Prices & texts for 3 milestones
  const [prices, setPrices] = useState(["799", "1499", "2499"]);
  const [texts, setTexts] = useState([
    "Extra 5% off on ₹{{price}}",
    "Extra 10% off on ₹{{price}}",
    "Extra 15% off on ₹{{price}}",
  ]);

  // Preview controls
  const [previewTotal, setPreviewTotal] = useState("999");
  const [tab, setTab] = useState(0);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // {type:"success"|"error", message:string} | null

  const nf = useMemo(
    () => new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 0}),
    []
  );

  const pNums = useMemo(() => prices.map(v => Math.max(0, Number(v) || 0)), [prices]);
  const cartTotal = useMemo(() => Math.max(0, Number(previewTotal) || 0), [previewTotal]);

  // Build milestones in the same order as user input
  const milestones = useMemo(
    () =>
      pNums.map((price, i) => ({
        price,
        text: (texts[i] || "").replace("{{price}}", String(price)),
      })),
    [pNums, texts]
  );

  const maxPrice = useMemo(() => Math.max(...pNums, 0), [pNums]);
  const fillPercent = useMemo(() => (maxPrice ? Math.min(100, Math.round((cartTotal / maxPrice) * 100)) : 0), [
    cartTotal,
    maxPrice,
  ]);

  const nextMilestone = useMemo(() => {
    const sorted = milestones
      .filter(m => m.price > 0)
      .sort((a, b) => a.price - b.price);
    return sorted.find(m => cartTotal < m.price) || null;
  }, [milestones, cartTotal]);

  const awayText = useMemo(() => {
    if (!enabled) return "Progress bar is disabled";
    if (!nextMilestone) return "🎉 You’ve unlocked the highest offer!";
    const diff = Math.max(0, nextMilestone.price - cartTotal);
    return `You are ${nf.format(diff)} away from ${nextMilestone.text.replace("{{price}}", String(nextMilestone.price))} on ${nf.format(nextMilestone.price)}`;
  }, [enabled, nextMilestone, cartTotal, nf]);

  /* ---------- HANDLERS ---------- */
  const onPriceChange = (i) => (val) => {
    const arr = [...prices];
    arr[i] = val;
    setPrices(arr);
  };
  const onTextChange = (i) => (val) => {
    const arr = [...texts];
    arr[i] = val;
    setTexts(arr);
  };

  const handleSubmit = async () => {
    const payload = {
      enabled,
      milestones: milestones.map(m => ({ price: m.price, text: m.text })),
    };

    // 👉 Console the JSON (your request)
    console.log("Submitting progress-bar config:", payload);

    // 👉 POST to your APIB
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text ? `– ${text}` : ""}`);
      }

      setSubmitStatus({type: "success", message: "Configuration saved successfully."});
    } catch (err) {
      console.error("POST failed:", err);
      setSubmitStatus({type: "error", message: err?.message || "Failed to save configuration."});
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <Page fullWidth>
      <TitleBar title="Unloack Offers" />

      <Layout>
        <Layout.Section>
          <Grid>
            {/* LEFT: Single-column form */}
            <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 6, lg: 6, xl: 6}}>
              <LegacyCard sectioned>
                <BlockStack gap="500">
                  {submitStatus && (
                    <Banner tone={submitStatus.type === "success" ? "success" : "critical"}>
                      {submitStatus.message}
                    </Banner>
                  )}

                  <Checkbox label="Enable progress bar" checked={enabled} onChange={setEnabled} />

                  <Banner tone="info">
                    Use <strong>{`{{price}}`}</strong> in the text to auto-insert each milestone price.
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

            {/* RIGHT: Live Preview */}
            <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 6, lg: 6, xl: 6}}>
              <LegacyCard>
                <LegacyCard.Section>
                  <Tabs
                    tabs={[{id: "desktop", content: "Desktop"}, {id: "mobile", content: "Mobile"}]}
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
                    />
                  </BlockStack>
                </LegacyCard.Section>
              </LegacyCard>
            </Grid.Cell>
          </Grid>
        </Layout.Section>
      </Layout>
    </Page>
  );
ut}

/* ---------- PREVIEW COMPONENT ---------- */
function Preview({mode, enabled, milestones, fillPercent, awayText, nf, maxPrice}) {
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

  const markerWrap = {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 10,
    color: "#6B7280",
    fontSize: 12,
  };

  const markers = milestones
    .filter(m => m.price > 0 && maxPrice > 0)
    .map((m, idx) => ({
      left: `${Math.min(100, (m.price / maxPrice) * 100)}%`,
      label: m.text.replace("{{price}}", String(m.price)),
      price: m.price,
      key: idx,
      emoji: idx === 0 ? "🥳" : "😺",
    }));

  return (
    <div style={frame}>
      <div style={{textAlign: "center", fontSize: 14, marginBottom: 6}}>
        {awayText}
      </div>

      <div style={{position: "relative"}}>
        <div style={barTrack}>
          <div style={barFill} />
          {markers.map(m => (
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
            <div key={m.key} style={{width: "33.33%", textAlign: "center"}}>
              <div style={{fontSize: 16}}>{m.emoji}</div>
              <div>{m.label}</div>
              <div style={{opacity: 0.8}}>{nf.format(m.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
