
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import "./assests/style.css";
import { Page, Layout, BlockStack, Banner, Grid, LegacyCard, Button, Box, Select, InlineStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";
import connectDatabase from "../lib/dbconnect.js";
import { Store } from "../models/storemodal.js";
import 'antd/dist/reset.css'

import { useTranslation } from "react-i18next";


// export const loader = async ({ request }) => {
//   const { session ,admin} = await authenticate.admin(request);
//   const shopName = session.shop;

//   const accessToken = session.accessToken;


//   if (!shopName) {
//     console.error("Missing shopName in session during dashboard loader", { session });
//     throw new Response(JSON.stringify({ error: "Missing shop in session" }), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   try {
//     await connectDatabase();


//     await Store.updateOne(
//       { shopName: shopName },
//       {
//         $set: { shopName: shopName, shop: shopName, accessToken, uninstalledAt: null },
//         $setOnInsert: { installedAt: new Date() },
//         $currentDate: { updatedAt: true },
//       },
//       { upsert: true }
//     );
//   } catch (e) {
//     console.error("Database operation failed", { shopName, error: e && e.message, stack: e && e.stack });

//     throw new Response(JSON.stringify({ error: "Failed to connect to database or upsert store", details: e && e.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   const storeDoc = await Store.findOne({ shopName }).lean();
//   const installedAt = storeDoc?.installedAt || storeDoc?.createdAt;
//   const sinceISO = new Date(installedAt).toISOString().replace(/\.\d{3}Z$/, "Z");

//   // GraphQL query with aliases
//   const query = `#graphql
//     query OrdersData($since: String!, $today: String!) {
//       totalOrders: ordersCount(query: $since) { count }
//       totalOrdersList: orders(first: 250, query: $since) {
//         edges { node { totalPrice } }
//       }
//       todayOrders: ordersCount(query: $today) { count }
//       todayOrdersList: orders(first: 250, query: $today) {
//         edges { node { totalPrice } }
//       }
//     }
//   `;

//   const variables = {
//     since: `created_at:>=${sinceISO} status:any`,
//     today: `created_at:>=${new Date().toISOString().slice(0, 10)} status:any`,
//   };

//   const API_VERSION = "2025-07";
//   const endpoint = `https://${shopName}/admin/api/${API_VERSION}/graphql.json`;

//   const res = await fetch(endpoint, {
//     method: "POST",
//     headers: {
//       "X-Shopify-Access-Token": accessToken,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ query, variables }),
//   });


//   const payload = await res.json();

//   console.log("payload", payload);

//   if (payload.errors) {
//     return new Response(
//       JSON.stringify({ error: payload.errors, sinceISO }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }

//   // Extract data
//   const totalOrders = payload?.data?.totalOrders?.count ?? 0;
//   const totalAmount = payload?.data?.totalOrdersList?.edges?.reduce(
//     (acc, { node }) => acc + parseFloat(node.totalPrice || 0),
//     0
//   ) ?? 0;

//   const todayCount = payload?.data?.todayOrders?.count ?? 0;
//   const todayAmount = payload?.data?.todayOrdersList?.edges?.reduce(
//     (acc, { node }) => acc + parseFloat(node.totalPrice || 0),
//     0
//   ) ?? 0;

//   // Theme logic (unchanged)
//   const url = new URL(request.url);
//   const host = url.searchParams.get("host") ?? "";
//   const shop = url.searchParams.get("shop") ?? "";

//   // ---- Fetch main theme safely ----
//   const api = `https://${shopName}/admin/api/2023-10`;
//   const headers = {
//     "Content-Type": "application/json",
//     "X-Shopify-Access-Token": accessToken,
//   };

//   let themes = [];
//   let mainThemeId = null;

//   // Fetch ALL themes (published + preview) for the theme selector
//   try {
//     const resAll = await fetch(`${api}/themes.json`, { method: "GET", headers });
//     if (!resAll.ok) {
//       throw new Error(`HTTP ${resAll.status}: ${resAll.statusText}`);
//     }
//     const dataAll = await resAll.json();
//     const arrAll = Array.isArray(dataAll?.themes) ? dataAll.themes : [];
//     themes = arrAll;
//     const main = arrAll.find((t) => t.role === "main") ||
//       arrAll.find((t) => t.role === "live") ||
//       arrAll[0];
//     mainThemeId = main?.id ?? null;
//   } catch (e) {
//     console.warn("❌ Themes fetch failed:", e.message);
//   }

//   // Normalize themes for UI: { id, name, role, roleLabel }
//   const roleLabels = { main: "Published", live: "Published", unpublished: "Preview" };
//   const themesForSelect = themes.map((t) => ({
//     id: t.id,
//     name: t.name || `Theme ${t.id}`,
//     role: t.role || "unpublished",
//     roleLabel: roleLabels[t.role] || "Preview",
//   }));

//   const themeIds = themes.map((t) => t.id).filter(Boolean);

//   // Graphql query for get curecny code 

//   const shopRes = await fetch(`https://${shopName}/admin/api/${API_VERSION}/shop.json`, {
//     method: "GET",
//     headers: {
//       "X-Shopify-Access-Token": accessToken,
//       "Content-Type": "application/json",
//     },
//   });



//   const shopData = await shopRes.json();
//   console.log("shopData", shopData);
//   const currency = shopData?.shop?.currency || "USD";
//   const primaryLocale = shopData?.shop?.primary_locale || "en";


//   const currencySymbolMap = {
//     "INR": "₹",
//     "USD": "$",
//     "EUR": "€",
//     "GBP": "£",
//     "AUD": "A$",
//     "CAD": "C$",
//     "JPY": "¥",
//     "SGD": "S$",
//   };

//   const currencySymbol = currencySymbolMap[currency] || currency


//   // Combine order data with theme data
//   return json({
//     host,
//     shop,
//     mainThemeId,
//     themeIds,
//     themes: themesForSelect,
//     totalOrders,
//     totalAmount,
//     todayCount,
//     todayAmount,
//     sinceISO,
//     currency,
//     currencySymbol,
//     primaryLocale,
//     payload
//   });

// };

export const loader = async ({ request }) => {
  // ✅ Destructure admin too
  const { session, admin } = await authenticate.admin(request);
  const shopName = session.shop;

  if (!shopName) {
    throw new Response(JSON.stringify({ error: "Missing shop in session" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectDatabase();
    await Store.updateOne(
      { shopName },
      {
        $set: { shopName, shop: shopName, uninstalledAt: null },
        $setOnInsert: { installedAt: new Date() },
        $currentDate: { updatedAt: true },
      },
      { upsert: true }
    );
  } catch (e) {
    throw new Response(
      JSON.stringify({ error: "DB error", details: e?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const storeDoc = await Store.findOne({ shopName }).lean();
  const installedAt = storeDoc?.installedAt || storeDoc?.createdAt;
  const sinceISO = new Date(installedAt).toISOString().replace(/\.\d{3}Z$/, "Z");

  const query = `#graphql
    query OrdersData($since: String!, $today: String!) {
      totalOrders: ordersCount(query: $since) { count }
      totalOrdersList: orders(first: 250, query: $since) {
        edges { node { totalPrice } }
      }
      todayOrders: ordersCount(query: $today) { count }
      todayOrdersList: orders(first: 250, query: $today) {
        edges { node { totalPrice } }
      }
    }
  `;

  const variables = {
    since: `created_at:>=${sinceISO} status:any`,
    today: `created_at:>=${new Date().toISOString().slice(0, 10)} status:any`,
  };

  // ✅ Use admin.graphql — auto handles token refresh
  const response = await admin.graphql(query, { variables });
  const payload = await response.json();

  if (payload.errors) {
    return new Response(
      JSON.stringify({ error: payload.errors, sinceISO }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const totalOrders = payload?.data?.totalOrders?.count ?? 0;
  const totalAmount = payload?.data?.totalOrdersList?.edges?.reduce(
    (acc, { node }) => acc + parseFloat(node.totalPrice || 0), 0
  ) ?? 0;
  const todayCount = payload?.data?.todayOrders?.count ?? 0;
  const todayAmount = payload?.data?.todayOrdersList?.edges?.reduce(
    (acc, { node }) => acc + parseFloat(node.totalPrice || 0), 0
  ) ?? 0;

  // ✅ Use admin.rest for themes — auto handles token refresh
  let themes = [];
  let mainThemeId = null;
  try {
    const themesResponse = await admin.graphql(`#graphql
      query DashboardThemes {
        themes(first: 20) {
          nodes {
            id
            name
            role
          }
        }
      }
    `);
    const themesPayload = await themesResponse.json();
    const themeNodes = themesPayload?.data?.themes?.nodes ?? [];

    themes = themeNodes
      .map((theme) => {
        const legacyId = String(theme.id || "").match(/\/(\d+)$/)?.[1] ?? null;
        return {
          id: legacyId,
          name: theme.name || (legacyId ? `Theme ${legacyId}` : "Theme"),
          role: theme.role || "UNPUBLISHED",
        };
      })
      .filter((theme) => theme.id);

    const main = themes.find((t) => t.role === "MAIN") ||
      themes.find((t) => t.role === "LIVE") ||
      themes[0];
    mainThemeId = main?.id ?? null;
  } catch (e) {
    console.warn("❌ Themes fetch failed:", e.message);
  }

  const roleLabels = {
    MAIN: "Published",
    LIVE: "Published",
    UNPUBLISHED: "Preview",
    DEVELOPMENT: "Preview",
    DEMO: "Preview",
  };
  const themesForSelect = themes.map((t) => ({
    id: t.id,
    name: t.name || `Theme ${t.id}`,
    role: t.role || "UNPUBLISHED",
    roleLabel: roleLabels[t.role] || "Preview",
  }));
  const themeIds = themes.map((t) => t.id).filter(Boolean);

  // ✅ Use admin.rest for shop data
  const shopResponse = await admin.graphql(`#graphql
    query DashboardShop {
      shop {
        currencyCode
      }
    }
  `);
  const shopPayload = await shopResponse.json();
  const currency = shopPayload?.data?.shop?.currencyCode || "USD";
  const primaryLocale = "en";

  const currencySymbolMap = {
    INR: "₹", USD: "$", EUR: "€", GBP: "£",
    AUD: "A$", CAD: "C$", JPY: "¥", SGD: "S$",
  };
  const currencySymbol = currencySymbolMap[currency] || currency;

  const url = new URL(request.url);
  const host = url.searchParams.get("host") ?? "";
  const shop = url.searchParams.get("shop") ?? "";

  return json({
    host, shop, mainThemeId, themeIds, themes: themesForSelect,
    totalOrders, totalAmount, todayCount, todayAmount,
    sinceISO, currency, currencySymbol, primaryLocale, payload
  });
};


export default function Dashboard() {
  const data = useLoaderData();
  const navigation = useNavigation();
  const { t, i18n: reactI18n } = useTranslation();

  const {
    host,
    shop,
    mainThemeId,
    themes: themesList = [],
    currency,
    currencySymbol,
    totalOrders = 0,
    totalAmount = 0,
    todayCount = 0,
    todayAmount = 0,
    primaryLocale = "en",
  } = data;

  useEffect(() => {
    if (!primaryLocale || !reactI18n) return;

    const normalizedLocale = primaryLocale.replace("_", "-");
    const availableLanguages = Object.keys(reactI18n?.options?.resources || {});
    const targetLanguage = availableLanguages.includes(normalizedLocale)
      ? normalizedLocale
      : normalizedLocale.split("-")[0];

    if (reactI18n.language !== targetLanguage) {
      reactI18n.changeLanguage(targetLanguage);
    }
  }, [primaryLocale, reactI18n]);

  const storeShort = shop?.replace(".myshopify.com", "");

  const [dismiss, setDismiss] = useState(true);
  const [dismiss1, setDismiss1] = useState(true);
  const [selectedThemeId, setSelectedThemeId] = useState(mainThemeId?.toString() ?? "");

  // Keep selected theme in sync when loader data changes (e.g. after nav)
  const effectiveThemeId = selectedThemeId || mainThemeId?.toString() || (themesList[0]?.id?.toString() ?? "");

  // Sync theme selection when loader data arrives (e.g. after switching from another page)
  useEffect(() => {
    const mainId = mainThemeId?.toString();
    const firstId = themesList[0]?.id?.toString();
    if (mainId && !selectedThemeId) setSelectedThemeId(mainId);
    else if (firstId && !selectedThemeId) setSelectedThemeId(firstId);
  }, [mainThemeId, themesList, selectedThemeId]);

  const isPageLoading = navigation.state === "loading";
  const themeButtonsDisabled = !storeShort || (!effectiveThemeId && !mainThemeId);

  const themeOptions = [
    { label: "Select a theme to enable the app", value: "" },
    ...themesList.map((t) => ({
      label: `${t.name} (${t.roleLabel})`,
      value: String(t.id),
    })),
  ];

  // helper to append host/shop to internal links
  const withParams = (path) => {
    const params = new URLSearchParams();
    if (host) params.set("host", host);
    if (shop) params.set("shop", shop);
    return `${path}${path.includes("?") ? "&" : "?"}${params.toString()}`;
  };

  // Helper to build theme editor URL for a given theme id
  const getThemeEditorUrl = (themeId) => {
    const id = themeId || effectiveThemeId;
    if (!id || !storeShort) return null;
    return `https://admin.shopify.com/store/${storeShort}/themes/${id}/editor?context=apps`;
  };

  // Open theme editor for the selected theme (from dropdown)
  const handleOpenSelectedTheme = () => {
    const url = getThemeEditorUrl(effectiveThemeId);
    if (url) {
      window.open(url, "_blank");
    } else {
      const shouldReload = window.confirm(
        "Theme ID not found. Click OK to reload the page and try again."
      );
      if (shouldReload) window.location.reload();
    }
  };

  // Open theme editor for the live/published theme only
  const handleOpenLiveTheme = () => {
    const liveId = mainThemeId?.toString();
    const url = liveId && storeShort
      ? `https://admin.shopify.com/store/${storeShort}/themes/${liveId}/editor?context=apps`
      : null;
    if (url) {
      window.open(url, "_blank");
    } else {
      const shouldReload = window.confirm(
        "Live theme not found. Click OK to reload the page and try again."
      );
      if (shouldReload) window.location.reload();
    }
  };

  const analyticsCards = [
    {
      value: (Number(totalOrders) >= 10000 ? "9999+" : totalOrders) || 0,
      label: t("dashboard.grid-total-orders"),
      accent: "Orders since install",
    },
    {
      value: `${currencySymbol || currency || ""}${(Number(totalAmount) || 0).toLocaleString()}`,
      label: t("dashboard.grid-total-amount"),
      accent: "Revenue influenced",
    },
    {
      value: (Number(todayCount) || 0).toLocaleString(),
      label: t("dashboard.grid-today-orders"),
      accent: "Orders today",
    },
    {
      value: `${currencySymbol || currency || ""}${(Number(todayAmount) || 0).toLocaleString()}`,
      label: t("dashboard.grid-today-amount"),
      accent: "Revenue today",
    },
  ];

  const quickActions = [
    {
      title: "Progress bars",
      description: "Compare all 4 progress bar types on one page and choose the right setup for your offer.",
      url: withParams("/app/progressbar-guide"),
      primary: true,
      buttonText: "View progress bars",
    },
    {
      title: "Cart customization",
      description: "Customize your cart drawer design, offers, messages, and customer-facing cart features.",
      url: withParams("/app/settings"),
      primary: false,
      buttonText: "Customize cart",
    },
    {
      title: "Documentation",
      description: "Read simple setup steps, feature guides, and instructions to use QuickCart correctly.",
      url: withParams("/app/documentation"),
      buttonText: "Open docs",
    },
    {
      title: "Help and support",
      description: "Get help with setup, troubleshooting, videos, and support contact details in one place.",
      url: withParams("/app/help"),
      buttonText: "Open help",
    },
  ];

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <BlockStack gap="500">
        <Layout>
          {isPageLoading && (
            <Layout.Section>
              <Banner tone="info" title={t("dashboard.loading-banner-title")} vs-comments="on loading information">
                {t("dashboard.loading-banner-message")}
              </Banner>
            </Layout.Section>
          )}
          {!isPageLoading && themeButtonsDisabled && dismiss1 && (
            <Layout.Section>
              <Banner tone="attention" title={t("dashboard.integration-button-if-not-working-title")}>
                {t("dashboard.integration-button-if-not-working-info")}
              </Banner>
            </Layout.Section>
          )}


          {/* <Layout.Section>
            <LegacyCard sectioned>
              <div className="dashboard-hero">
                <div className="dashboard-hero__content">
                  <div className="dashboard-eyebrow">Quickcart cart drawer</div>
                  <h1 className="dashboard-hero__title">
                    Manage your cart drawer in one place.
                  </h1>
                  <p className="dashboard-hero__text">
                    Customize the cart drawer, then open your Shopify theme editor to enable it for customers.
                  </p>
                  <div className="dashboard-hero__steps">
                    <div className="dashboard-hero__step">
                      <span className="dashboard-hero__step-number">1</span>
                      <span>Update drawer settings and design.</span>
                    </div>
                    <div className="dashboard-hero__step">
                      <span className="dashboard-hero__step-number">2</span>
                      <span>Enable the app block in your theme.</span>
                    </div>
                  </div>
                  <InlineStack gap="300" wrap>
                    <Button variant="primary" url={withParams("/app/settings")}>
                      Customize drawer
                    </Button>
                    <Button onClick={handleOpenSelectedTheme} disabled={!effectiveThemeId || !storeShort}>
                      Enable in theme
                    </Button>
                  </InlineStack>
                  <div className="dashboard-hero__note">
                    Use the buttons above to finish setup faster.
                  </div>
                </div>
              </div>
            </LegacyCard>
          </Layout.Section> */}

          <Layout.Section>
            {dismiss1 && (
              <LegacyCard sectioned>
                <div className="dashboard-setup-card">
                  <div className="dashboard-setup-card__header">
                    <div>
                      <div className="dashboard-setup-card__eyebrow">Theme activation</div>
                      <h2 className="dashboard-setup-card__title">{t("dashboard.enable-app-title")}</h2>
                      <p className="dashboard-setup-card__text">{t("dashboard.enable-app-integration-info")}</p>
                    </div>
                    <Button onClick={() => setDismiss1(false)}>Dismiss</Button>
                  </div>

                  {themesList.length > 0 && (
                    <div className="dashboard-theme-controls">
                      <div className="dashboard-theme-controls__select">
                        <Select
                          label="Choose theme (Published or Preview)"
                          options={themeOptions}
                          value={effectiveThemeId}
                          onChange={setSelectedThemeId}
                        />
                      </div>
                      <div className="dashboard-theme-controls__actions">
                        <Button variant="primary" onClick={handleOpenSelectedTheme} disabled={!effectiveThemeId || !storeShort}>
                          Open selected theme
                        </Button>
                        <Button onClick={handleOpenLiveTheme} disabled={!mainThemeId || !storeShort}>
                          Open live theme
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </LegacyCard>
            )}
          </Layout.Section>

          <Layout.Section>
            <div className="dashboard-section-heading">
              <div>
                <div className="dashboard-eyebrow">Performance snapshot</div>
                <h2 className="dashboard-section-heading__title">Quick overview</h2>
              </div>
            </div>
            <Grid>
              {analyticsCards.map((card) => (
                <Grid.Cell key={card.label} columnSpan={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }}>
                  <LegacyCard sectioned>
                    <div className="dashboard-metric-card">
                      <div className="dashboard-metric-card__accent">{card.accent}</div>
                      <h3 className="dashboard-metric-card__value">{card.value}</h3>
                      <p className="dashboard-metric-card__label">{card.label}</p>
                    </div>
                  </LegacyCard>
                </Grid.Cell>
              ))}
            </Grid>
          </Layout.Section>

          <Layout.Section>
            <div className="dashboard-section-heading">
              <div>
                <div className="dashboard-eyebrow">Workspace</div>
                <h2 className="dashboard-section-heading__title">Next steps</h2>
              </div>
            </div>
            <Grid>
              {quickActions.map((action) => (
                <Grid.Cell key={action.title} columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                  <LegacyCard sectioned>
                    <div className="dashboard-action-card">
                      <div className="dashboard-action-card__icon">{action.title.charAt(0)}</div>
                      <h3 className="dashboard-action-card__title">{action.title}</h3>
                      <p className="dashboard-action-card__text">{action.description}</p>
                      <Button variant={action.primary ? "primary" : undefined} url={action.url}>
                        {action.buttonText}
                      </Button>
                    </div>
                  </LegacyCard>
                </Grid.Cell>
              ))}
            </Grid>
          </Layout.Section>

          {/* 
          <Layout.Section>
            <h4 className="i-gs-section-title" style={{ textTransform: "uppercase" }}>{t("dashboard.progressbar-section-title")}  </h4>

            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/price_based_disount.png?v=1768556274"
                    alt="Unlock Offers"
                  />

                  <h4 className="i-gs-grid-heading"> {t("dashboard.progressbar1-block-title")} </h4>
                  <p className="i-gs-grid-subheading">{t("dashboard.progressbar1-block-info")} </p>
                  <Button fullWidth url={withParams("/app/progressbar")} variant="primary">{t("dashboard.progressbar1-block-button")}</Button>

                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/buy-one-get-one.png?v=1768556274"
                    alt="Buy X Get Y"
                  />
                  <h4 className="i-gs-grid-heading">{t("dashboard.progressbar2-block-title")}</h4>
                  <p className="i-gs-grid-subheading">{t("dashboard.progressbar2-block-info")}</p>
                  <Button fullWidth url={withParams("/app/progressbaron1")}>{t("dashboard.progressbar2-block-button")}</Button>
                </LegacyCard>
              </Grid.Cell>



            </Grid>
          </Layout.Section>

          <Layout.Section>
            <h4 className="i-gs-section-title" style={{ textTransform: "uppercase" }}>{t("dashboard.cart-drawer-section-title")}</h4>

            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/upsell_product.png?v=1768556274"
                    alt="Unlock Offers"
                  />
                  <h4 className="i-gs-grid-heading">{t("dashboard.block-upsell")}</h4>
                  <p className="i-gs-grid-subheading">{t("dashboard.block-upsell-info")}</p>
                  <Button fullWidth url={withParams("/app/settings")} variant="primary">
                    {t("dashboard.block-upsell-button")}
                  </Button>
                </LegacyCard>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/one-product.png?v=1768556274"
                    alt="Mystry Box"
                  />
                  <h4 className="i-gs-grid-heading">{t("dashboard.block-Mystrybox")}</h4>
                  <p className="i-gs-grid-subheading">{t("dashboard.block-Mystrybox-info")}</p>
                  <Button fullWidth url={withParams("/app/settings")}>{t("dashboard.block-Mystrybox-button")}</Button>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/third_party.png?v=1768556274"
                    alt="Buy X Get Y"
                  />
                  <h4 className="i-gs-grid-heading">{t("dashboard.block-thirdparty-integration")}</h4>
                  <p className="i-gs-grid-subheading">{t("dashboard.block-thirdparty-integration-info")}</p>
                  <Button fullWidth url={withParams("/app/settings")}>{t("dashboard.block-thirdparty-integration-button")}</Button>
                </LegacyCard>
              </Grid.Cell>


              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/announcement-carousel.png?v=1768556274"
                    alt="Buy X Get Y"
                  />
                  <h4 className="i-gs-grid-heading">{t("dashboard.block-announcementbar-title")}</h4>
                  <p className="i-gs-grid-subheading">{t("dashboard.block-announcementbar-info")}</p>
                  <Button fullWidth url={withParams("/app/settings")}>{t("dashboard.block-announcementbar-button")}</Button>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/stopwatch.png?v=1768556274"
                    alt="Buy X Get Y"
                  />
                  <h4 className="i-gs-grid-heading">{t("dashboard.block-countdown-title")}</h4>
                  <p className="i-gs-grid-subheading">{t("dashboard.block-countdown-info")}</p>
                  <Button fullWidth url={withParams("/app/settings")}>{t("dashboard.block-countdown-button")}</Button>
                </LegacyCard>
              </Grid.Cell>


            </Grid>
          </Layout.Section>

          <Layout.Section>
            <h4 className="i-gs-section-title">{t("dashboard.block-freegift-title")}</h4>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/gift_product.png?v=1768556274"
                    alt="Gift Product"
                  />
                  <h4 className="i-gs-grid-heading">{t("dashboard.block-freegift-title")}</h4>
                  <p className="i-gs-grid-subheading">{t("dashboard.block-freegift-info")}</p>
                  <Button variant="primary" fullWidth url={withParams("/app/giftproduct")}> {t("dashboard.block-freegift-button")}</Button>
                </LegacyCard>

              </Grid.Cell>
            </Grid>
          </Layout.Section>
            */}



          {/* <Layout.Section>
            <h4 className="i-gs-section-title">Integrate with theme</h4>
            <Box paddingBlockEnd="300">
              <Banner tone="attention" title="You must enable the app from your store">
                <p>
                  Customers will not see the cart drawer until you enable QuickCart in your store Theme Editor: <strong>Customize → App blocks → QuickCart</strong>. Select a theme below and click &quot;Open in Theme Editor&quot; to enable it.
                </p>
              </Banner>
            </Box>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/shopify.png?v=1768556844"
                    alt="Integrate with theme"
                  />
                  <h4 className="i-gs-grid-heading">Activate Theme</h4>
                  <p className="i-gs-grid-subheading">
                    To go live, enable the App Extension in the Store Theme Editor. Select a theme (Published or Preview), open the Theme Editor, then turn on the QuickCart app block.
                  </p>
                  {themesList.length > 0 && (
                    <Box paddingBlockEnd="300">
                      <Select
                        label="Theme"
                        options={themeOptions.filter((o) => o.value !== "")}
                        value={effectiveThemeId}
                        onChange={setSelectedThemeId}
                      />
                    </Box>
                  )}
                  <BlockStack gap="200">
                    <Button
                      fullWidth
                      onClick={handleOpenSelectedTheme}
                      variant="primary"
                      disabled={!effectiveThemeId || !storeShort}
                    >
                      Open selected theme in Theme Editor
                    </Button>
                    <Button
                      fullWidth
                      onClick={handleOpenLiveTheme}
                      disabled={!mainThemeId || !storeShort}
                    >
                      Enable on live theme
                    </Button>
                  </BlockStack>
                </LegacyCard>
              </Grid.Cell>
            </Grid>
          </Layout.Section> */}

          {/* <Layout.Section>
            {dismiss &&
              <Box marginBlockEnd="400">
                <div className="dashboard-help-shell">
                  <Banner
                    tone="info"
                    title="Need help?"
                    onDismiss={() => { setDismiss(false) }}
                    action={{
                      content: t("dashboard.help-title-button"),
                      url: withParams(`/app/help`),
                      external: true,
                    }}
                    secondaryAction={{
                      content: t("dashboard.help-title-banner"),
                      url: "https://cdn.shopify.com/videos/c/o/v/7bf07a776af648b1a140f0ce6608fd6d.mp4",
                      external: true,
                      target: "_blank",
                    }}
                  >
                    <p>
                      {t("dashboard.help-info")}{" "}
                      <a href="mailto:support@digisidekick.com">support@digisidekick.com</a> or <a href="mailto:vikasprasad@digisidekick.com">vikasprasad@digisidekick.com</a>.
                    </p>
                  </Banner>
                </div>
              </Box>}

          </Layout.Section> */}



        </Layout>
      </BlockStack>


    </Page>
  );
}
