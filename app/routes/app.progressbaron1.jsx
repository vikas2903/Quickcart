import React, { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Grid, LegacyCard, BlockStack, Checkbox, TextField, Button, Tabs, InlineStack, Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server.js";
import { useTranslation } from "react-i18next";

const API_URL = "/app/quickcart/bxgy";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function BuyXGetYPage() {
  const { shop } = useLoaderData();
  const { t } = useTranslation();
 
  return (
    <Page fullWidth>
      <TitleBar title={t("progressbaron1.page-title")} />
      <Layout>
        <Layout.Section>
          <BuyXGetYSection shop={shop} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function BuyXGetYSection({ shop }) {
  const { t } = useTranslation();

  const [savedata, setsavedata] = useState({
    enabled: "",
    offer: []
  });

  const defaultMessages = useMemo(
    () => ({
      many: t("progressbaron1.remaining-many-message"),
      one: t("progressbaron1.remaining-one-message"),
      unlocked: t("progressbaron1.offer-unlocked-message"),
    }),
    [t]
  );

  const [enabled, setEnabled] = useState(true);
  const [buyQty, setBuyQty] = useState("2");
  const [getQty, setGetQty] = useState("1");
  const [msgMany, setMsgMany] = useState(defaultMessages.many);
  const [msgOne, setMsgOne] = useState(defaultMessages.one);
  const [msgUnlocked, setMsgUnlocked] = useState(defaultMessages.unlocked);
  const [previewQty, setPreviewQty] = useState("1");
  const [tab, setTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState(null);

  useEffect(() => {
    setMsgMany((current) => (current === defaultMessages.many ? defaultMessages.many : current));
    setMsgOne((current) => (current === defaultMessages.one ? defaultMessages.one : current));
    setMsgUnlocked((current) => (current === defaultMessages.unlocked ? defaultMessages.unlocked : current));
  }, [defaultMessages]);

  const buy = useMemo(() => Math.max(0, parseInt(buyQty || "0", 10)), [buyQty]);
  const get = useMemo(() => Math.max(0, parseInt(getQty || "0", 10)), [getQty]);
  const qty = useMemo(() => Math.max(0, parseInt(previewQty || "0", 10)), [previewQty]);

  const remaining = useMemo(() => Math.max(0, buy - qty), [buy, qty]);
  const fillPercent = useMemo(
    () => (buy ? Math.min(100, Math.round((qty / buy) * 100)) : 0),
    [qty, buy]
  );

  const tmpl = (s) =>
    (s || "")
      .replace(/{{\s*remaining\s*}}/gi, String(remaining))
      .replace(/{{\s*buy\s*}}/gi, String(buy))
      .replace(/{{\s*get\s*}}/gi, String(get));

  const bannerText = useMemo(() => {
    if (!enabled) return t("progressbaron1.offer-disabled");
    if (!buy) return t("progressbaron1.set-buy-quantity-message");
    if (remaining <= 0) return tmpl(msgUnlocked);
    if (remaining === 1) return tmpl(msgOne);
    return tmpl(msgMany);
  }, [enabled, buy, remaining, msgUnlocked, msgOne, msgMany, t]);

  const payload = useMemo(
    () => ({
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

  const handleSubmit = async () => {
    if (!Number.isFinite(buy) || buy < 1 || !Number.isFinite(get) || get < 1) {
      setNote({ type: "critical", msg: t("progressbaron1.invalid-quantity-message") });
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

      setNote({ type: "success", msg: t("progressbaron1.save-success-message") });
      setsavedata({
        enabled,
        offer: { buyQty: buy, getQty: get },
      });
    } catch (e) {
      setNote({ type: "critical", msg: e?.message || t("progressbaron1.save-error-message") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveddata_progressbar = async () => {
    const retrive_saved_data = await fetch("https://quickcart-vf8k.onrender.com/app/quickcart/bxgy", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Shop-Domain": shop,
        Accept: "application/json",
      },
    });
    const getapidata = await retrive_saved_data.json();
    return getapidata?.data;
  };

  useEffect(() => {
    let getdata = async () => {
      let data = await saveddata_progressbar();
      let nextEnabled = data?.enabled;
      let offer = data?.offer;

      setsavedata({
        enabled: nextEnabled,
        offer: offer,
      });

      setEnabled(!!nextEnabled);
      setBuyQty(String(offer?.buyQty ?? 2));
      setGetQty(String(offer?.getQty ?? 1));
    };

    getdata();
  }, [shop]);

  return (
    <Grid>
      <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <LegacyCard sectioned>
          <BlockStack gap="500">
            {note && <Banner tone={note.type === "success" ? "success" : "critical"}>{note.msg}</Banner>}

            <Checkbox label={t("progressbaron1.enable-label")} checked={enabled} onChange={setEnabled} />

            <Banner tone="info">
              {t("progressbaron1.main-message")}
            </Banner>

            <InlineStack gap="300">
              <TextField
                label={t("progressbaron1.buy-quantity-label")}
                type="number"
                inputMode="numeric"
                min={0}
                value={buyQty}
                onChange={setBuyQty}
                autoComplete="off"
              />
              <TextField
                label={t("progressbaron1.free-quantity-label")}
                type="number"
                inputMode="numeric"
                min={0}
                value={getQty}
                onChange={setGetQty}
                autoComplete="off"
              />
            </InlineStack>

            <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
              {t("progressbaron1.submit-button")}
            </Button>
          </BlockStack>
        </LegacyCard>
      </Grid.Cell>

      <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <div className="" style={{ marginBottom: "20px" }}>
          <Banner
            tone="info"
            title={t("progressbaron1.create-discount-title")}
            action={{
              content: t("progressbaron1.create-discount-action"),
              onAction: () => {
                const discountUrl = `https://${shop}/admin/discounts/`;
                window.open(discountUrl, "_blank", "noopener,noreferrer");
              }
            }}
            onDismiss={() => {}}
          >
            <p>{t("progressbaron1.create-discount-text")}</p>
          </Banner>
        </div>

        <LegacyCard>
          <LegacyCard.Section>
            <Tabs
              tabs={[
                { id: "desktop", content: t("progressbaron1.tab-desktop") },
                { id: "mobile", content: t("progressbaron1.tab-mobile") }
              ]}
              selected={tab}
              onSelect={setTab}
            />
          </LegacyCard.Section>

          <LegacyCard.Section>
            <BlockStack gap="400">
              <TextField
                label={t("progressbaron1.preview-quantity-label")}
                type="number"
                inputMode="numeric"
                min={1}
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

        <LegacyCard>
          <LegacyCard.Section>
            <Banner tone="info">
              {t("progressbaron1.saved-config-banner")}
            </Banner>

            <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
              <h2>{t("progressbaron1.data-title")}</h2>

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
                    <th align="left">{t("progressbaron1.shop-name")}</th>
                    <td>{shop}</td>
                  </tr>
                  <tr>
                    <th align="left">{t("progressbaron1.enabled")}</th>
                    <td>{savedata.enabled ? t("progressbaron1.yes") : t("progressbaron1.no")}</td>
                  </tr>

                  {savedata.enabled ? (
                    <>
                      <tr>
                        <th align="left">{t("progressbaron1.buy-quantity-row")}</th>
                        <td>{savedata?.offer?.buyQty}</td>
                      </tr>
                      <tr>
                        <th align="left">{t("progressbaron1.get-quantity-row")}</th>
                        <td>{savedata?.offer?.getQty}</td>
                      </tr>
                    </>
                  ) : (
                    ""
                  )}
                </tbody>
              </table>
            </div>
          </LegacyCard.Section>
        </LegacyCard>
      </Grid.Cell>
    </Grid>
  );
}

function PreviewBxGy({ mode, enabled, buy, get, fillPercent, bannerText }) {
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
        {enabled
          ? t("progressbaron1.preview-offer-label", { buy: buy || 0, get: get || 0 })
          : t("progressbaron1.preview-offer-disabled-label")}
      </div>

      <div style={{ position: "relative" }}>
        <div style={barTrack}>
          <div style={barFill} />
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
          <div>{t("progressbaron1.target-label", { count: buy, buy })}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
          <div style={{ width: "33.33%", textAlign: "center" }} />
          <div style={{ width: "33.33%", textAlign: "center" }}>
            <div style={{ fontSize: 16 }}>*</div>
            <div>{t("progressbaron1.unlock-label", { buy, get })}</div>
          </div>
          <div style={{ width: "33.33%", textAlign: "center" }} />
        </div>
      </div>
    </div>
  );
}
