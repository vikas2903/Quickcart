import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useTranslation } from "react-i18next";

// must match the API route file above
const API_URL = "/app/quickcart/unlockprice";

/** Loader: get shop from admin session */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const requestLocale = url.searchParams.get("locale");
  // const primaryLocale = requestLocale || session?.primaryLocale || "en-US";
  const accessToken = session.accessToken; 

  const API_VERSION = "2025-07";
  const shopRes = await fetch(`https://${session.shop}/admin/api/${API_VERSION}/shop.json`, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
  
    const shopData = await shopRes.json();
    console.log("shopData", shopData);
    const currency = shopData?.shop?.currency || "USD";
    const primaryLocale = shopData?.shop?.primary_locale || "en";

  return json({ shop: session.shop, primaryLocale: primaryLocale }); 
};

export default function ProgressBar() {
  const { shop, primaryLocale } = useLoaderData();
 
  console.log("vss_primaryLocale", primaryLocale);

  const { t, i18n: reactI18n } = useTranslation();
  const defaultTextsRef = useRef([]);

  const targetLanguage = useMemo(() => {
    if (!primaryLocale) return "en";

    const normalizedLocale = primaryLocale.replace("_", "-");
    const availableLanguages = Object.keys(reactI18n?.options?.resources || {});

    if (availableLanguages.includes(normalizedLocale)) {
      return normalizedLocale;
    }

    const baseLanguage = normalizedLocale.split("-")[0];
    if (availableLanguages.includes(baseLanguage)) {
      return baseLanguage;
    }

    return "en";
  }, [primaryLocale, reactI18n]);

  useEffect(() => {
    if (targetLanguage && reactI18n) {
      if (reactI18n.language !== targetLanguage) {
        reactI18n.changeLanguage(targetLanguage);
      }
    }
  }, [targetLanguage, reactI18n]);

  const defaultTexts = useMemo(
    () => [
      t("settings.default-milestone-text-1"),
      t("settings.default-milestone-text-2"),
      t("settings.default-milestone-text-3"),
    ],
    [t, reactI18n.resolvedLanguage]
  );

  /* ---------- FORM STATE ---------- */
  const [enabled, setEnabled] = useState(true);
  const [prices, setPrices] = useState(["799", "1499", "2499"]);
  const [texts, setTexts] = useState(defaultTexts);
  const [progressBarColor, setProgressBarColor] = useState("#000000");

  const [previewTotal, setPreviewTotal] = useState("999");
  const [tab, setTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const [savedata, setsaveddata] = useState({
    enabled: "",
    milestones: [],
    progressBarColor: "#000000"
  });

  useEffect(() => {
    const previousDefaultTexts = defaultTextsRef.current;

    setTexts((currentTexts) => {
      const shouldRefreshDefaults =
        !currentTexts.some(Boolean) ||
        currentTexts.every((text, index) => text === previousDefaultTexts[index]);

      return shouldRefreshDefaults ? defaultTexts : currentTexts;
    });

    defaultTextsRef.current = defaultTexts;
  }, [defaultTexts]);

  const nf = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const saveddata_progressbar = async () => {
    const retrive_saved_data = await fetch(
      `https://quickcart-vf8k.onrender.com/app/quickcart/unlockprice?shop=${encodeURIComponent(shop)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shop,
          Accept: "application/json",
        },
      }
    );
    const getapidata = await retrive_saved_data.json();
    const getted_data = getapidata?.data;
    return getted_data;
  };

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
    if (!enabled) return t("settings.progress-disabled-message");
    if (!nextMilestone) return t("settings.highest-offer-unlocked-message");
    const diff = Math.max(0, nextMilestone.price - cartTotal);
    return t("settings.away-from-milestone-message", {
      amount: nf.format(diff),
      milestone: nextMilestone.text.replace("{{price}}", String(nextMilestone.price)),
      price: nf.format(nextMilestone.price),
    });
  }, [enabled, nextMilestone, cartTotal, nf, t]);

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

      console.log("progressbardata", progressbardata);

      let milestones = progressbardata?.milestones;
      let enalbled = progressbardata?.enabled;

      const savedColor = progressbardata?.progressBarColor || "#000000";
      setsaveddata({ enalbled, milestones, progressBarColor: savedColor });
    }

    fetchData();
  }, [shop]);

  /* ---------- INPUT HANDLERS ---------- */
  const onPriceChange = (i) => (val) =>
    setPrices((arr) => arr.map((v, idx) => (idx === i ? val : v)));
  const onTextChange = (i) => (val) =>
    setTexts((arr) => arr.map((v, idx) => (idx === i ? val : v)));

  /* ---------- SAVE ---------- */
  const handleSubmit = async () => {
    if (!shop) {
      const message = t("settings.shop-domain-missing-error");
      setSubmitStatus({
        type: "error",
        message,
      });
      toast.error(message);
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
        throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` - ${txt}` : ""}`);
      }

      setSubmitStatus({
        type: "success",
        message: t("settings.save-success-message"),
      });
      setsaveddata({
        enalbled: enabled,
        milestones: payload.milestones,
        progressBarColor,
      });
      toast.success(t("settings.save-success-message"));
    } catch (err) {
      const message = err?.message || t("settings.save-error-message");
      setSubmitStatus({
        type: "error",
        message,
      });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} transition={Slide} />
      <Page fullWidth>
        <TitleBar title={t("settings.page-title")} />

        <Layout>
          <Layout.Section>
            <Grid>
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

                    <Banner tone="info">{t("settings.main-message")}</Banner>

                    <Checkbox
                      label={t("settings.enable-pricebased-app-progressbar")}
                      checked={enabled}
                      onChange={setEnabled}
                    />

                    {[0, 1, 2].map((i) => (
                      <LegacyCard key={i} sectioned>
                        <BlockStack gap="300">
                          <strong>
                            {t("settings.pricebased-app-progressbar-title-milestone")} {i + 1}
                          </strong>
                          <TextField
                            label={`${t("settings.pricebased-app-progressbar-placeholder-milestone-price")} ${i + 1}`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={prices[i]}
                            onChange={onPriceChange(i)}
                            autoComplete="off"
                          />
                          <TextField
                            label={`${t("settings.pricebased-app-progressbar-placeholder-milestone-text")} ${i + 1}`}
                            value={texts[i]}
                            onChange={onTextChange(i)}
                            autoComplete="off"
                          />
                        </BlockStack>
                      </LegacyCard>
                    ))}

                    <InlineStack gap="300" />
                    <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
                      {t("settings.pricebased-app-progressbar-submit-btn")}
                    </Button>
                  </BlockStack>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                <div className="" style={{ marginBottom: "20px" }}>
                  <Banner
                    tone="info"
                    title={t("settings.create-discount-info-title")}
                    action={{
                      content: t("settings.create-discount-info-link"),
                      onAction: () => {
                        const discountUrl = `https://${shop}/admin/discounts/`;
                        window.open(discountUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    <p>{t("settings.create-discount-info-text")}</p>
                  </Banner>
                </div>

                <LegacyCard>
                  <LegacyCard.Section>
                    <Tabs
                      tabs={[
                        { id: "desktop", content: t("settings.tab-1-title") },
                        { id: "mobile", content: t("settings.tab-2-title") },
                      ]}
                      selected={tab}
                      onSelect={setTab}
                    />
                  </LegacyCard.Section>

                  <LegacyCard.Section>
                    <BlockStack gap="400">
                      <TextField
                        label={t("settings.tab-info")}
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
                    <Banner tone="info">{t("settings.info-baner")}</Banner>

                    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
                      <h2>{t("settings.info-baner-title")}</h2>

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
                            <th align="left">{t("settings.shop-name")}</th>
                            <td>{shop}</td>
                          </tr>
                          <tr>
                            <th align="left">{t("settings.enable")}</th>
                            <td>{savedata.enalbled ? t("settings.yes") : t("settings.no")}</td>
                          </tr>
                          {/* <tr>
                          <th align="left">{t("settings.progress-bar-color")}</th>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "4px",
                                  backgroundColor: savedata.progressBarColor || "#000000",
                                  border: "1px solid #ddd"
                                }}
                              />
                              <span>{savedata.progressBarColor || "#000000"}</span>
                            </div>
                          </td>
                          </tr> */}
                        </tbody>
                      </table>

                      {savedata.enalbled ? (
                        <div>
                          <h3>{t("settings.milestones-heading")}</h3>
                          <table
                            border="1"
                            cellPadding="8"
                            cellSpacing="0"
                            style={{ borderCollapse: "collapse", width: "100%" }}
                          >
                            <thead style={{ backgroundColor: "#eee" }}>
                              <tr>
                                <th>{t("settings.price-column")}</th>
                                <th>{t("settings.text-column")}</th>
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
                      ) : (
                        ""
                      )}
                    </div>
                  </LegacyCard.Section>
                </LegacyCard>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}

/* ---------- PREVIEW ---------- */
function Preview({ mode, enabled, milestones, fillPercent, awayText, nf, maxPrice, progressBarColor }) {
  const { t } = useTranslation();
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
                top: -18,
                left: m.left,
                transform: "translateX(-50%)",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="https://pickrr.s3.amazonaws.com/2025-08-01T06:57:59.706663_party_icon_colored.png"
                alt={t("settings.party-icon-alt")}
                style={{
                  width: "24px",
                  height: "24px",
                  objectFit: "contain",
                }}
              />
            </div>
          ))}
        </div>

        <div style={markerWrap}>
          {markers.map((m) => (
            <div key={m.key} style={{ width: "33.33%", textAlign: "center" }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{m.label}</div>
              <div style={{ opacity: 0.8, fontSize: 11 }}>{nf.format(m.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 
