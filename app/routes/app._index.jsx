// import { json } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
// import './assests/style.css';
// import {
//   Page,
//   Layout,
//   BlockStack,
//   Banner,
//   Grid,
//   LegacyCard,
//   Button,
// } from "@shopify/polaris";
// import { TitleBar } from "@shopify/app-bridge-react";
// import { authenticate } from "../shopify.server";

// import connectDatabase from '../lib/dbconnect.js';
// import {Store} from '../models/storemodal.js'

// export const loader = async ({ request }) => {
//   await authenticate.admin(request);

//   const { session } = await authenticate.admin(request);
//   const shopName = session.shop;
//   const accessToken = session.accessToken;

//   // Fetch theme Ids


//   // Fetch Theme Ids

//   // console.log("🔑 Access token for", shopName);

//   // # Database Connect
//   await connectDatabase ();

//   await Store.updateOne(
//     { shopName },                       // 1) FILTER: which doc to target
//     {                                   // 2) UPDATE: how to change it
//       $set: { accessToken, uninstalledAt: null },
//       $setOnInsert: { installedAt: new Date() },
//       $currentDate: { updatedAt: true },
//     },
//     { upsert: true }                    // 3) OPTIONS: create if it doesn't exist
//   );

//   // console.log("✅ Store saved");

// // Keep host/shop in URLs to avoid OAuth relogin on internal nav
//   const url = new URL(request.url);
//   const host = url.searchParams.get ("host") ?? "";
//   const shop = url.searchParams.get("shop") ?? "";

// const getThemeId = await fetch('https://' + shopName + '/admin/api/2023-10/themes.json?role=main', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Shopify-Access-Token': accessToken,
//     },
//   });
//   const themeData = await getThemeId.json(); 
//   console.log("🎯 Theme data", themeData);
//   const themeIds = themeData.themes.map(theme => theme.id);
//   // console.log("🎯 Theme Ids", themeIds); 

//   return json({ host, shop, themeIds });
// };

// export default function Dashboard() {
//   const { host, shop, themeIds } = useLoaderData();

//   const storeShort = shop?.replace(".myshopify.com", ""); 
//   const Published_theme_id = themeIds;

//   // helper to append host/shop to internal links
//   const withParams = (path) => {
//     const params = new URLSearchParams();
//     if (host) params.set("host", host);
//     if (shop) params.set("shop", shop);
//     return `${path}${path.includes("?") ? "&" : "?"}${params.toString()}`;
//   };

//   return (
//     <Page>
//       <TitleBar title="Dashboard" />
//       <BlockStack gap="500">
//         <Layout>
//           <Layout.Section>
//             <Banner
//               tone="warning"
//               title="You need to integrate the app into your Shopify theme"
//             action={{
//               content: "Activate extension in theme",
//               url: withParams(`https://admin.shopify.com/store/${storeShort}/themes/${Published_theme_id}/editor?context=apps`),
//               external: true,  
//               target: "_blank",          
//           }}
//           secondaryAction={{
//             content: "How to use & Customize",
//             url: "https://youtu.be/ojooDuF6UlE?si=LqSznKp4X0N51z_w",
//             external: true,    
//             target: "_blank",          
//           }}
//             >
//               <p>
//                 Your settings are saved. Activate the app in Shopify’s Theme Editor to make it visible on your store.
//               </p>
//             </Banner>
//           </Layout.Section>

//           <Layout.Section>
//             <h4 className="i-gs-section-title">Get Started</h4>

//             <Grid>
//               <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
//                 <LegacyCard sectioned>
//                   <img
//                     className="i-gs-img"
//                     src="https://cdn.qikify.com/portal/v2/checkout/dashboard-step-1.svg"
//                     alt="Unlock Offers"
//                   />
//                   <h4 className="i-gs-grid-heading">1. Create Progress Bar</h4>
//                   <p className="i-gs-grid-subheading">
//                     Configure milestones based on cart total or product price.
//                   </p>
//                   <Button fullWidth url={withParams("/app/progressbar")} variant="primary">
//                     Setup Progress Bar
//                   </Button>
//                 </LegacyCard>
//               </Grid.Cell>

//               <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
//                 <LegacyCard sectioned>
//                   <img
//                     className="i-gs-img"
//                     src="https://cdn.qikify.com/portal/v2/checkout/dashboard-step-1.svg"
//                     alt="Buy X Get Y"
//                   />
//                   <h4 className="i-gs-grid-heading">2. Buy X Get Y</h4>
//                   <p className="i-gs-grid-subheading">
//                     Set Buy/Free quantities and custom messages.
//                   </p>
//                   <Button fullWidth url={withParams("/app/progressbaron1")}>Setup BxGy</Button>
//                 </LegacyCard>
//               </Grid.Cell>
//                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
//                 <LegacyCard sectioned>
//                   <img
//                     className="i-gs-img"
//                     src="https://cdn.qikify.com/portal/v2/checkout/dashboard-step-1.svg"
//                     alt="Buy X Get Y"
//                   />
//                   <h4 className="i-gs-grid-heading">2. Buy X Get Free</h4>
//                   <p className="i-gs-grid-subheading">
//                     Buy X Get Free Product
//                   </p>
//                   <Button fullWidth url={withParams("/app/freeproduct")}>Setup BxGy</Button>
//                 </LegacyCard>
//               </Grid.Cell>

//               <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
//                 <LegacyCard sectioned>
//                   <img
//                     className="i-gs-img"
//                     src="https://cdn.qikify.com/portal/v2/checkout/dashboard-step-3.svg"
//                     alt="Integrate with theme"
//                   />
//                   <h4 className="i-gs-grid-heading">Integrate with theme</h4>
//                   <p className="i-gs-grid-subheading">
//                     Activate the app block in Theme Editor to go live.
//                   </p>
//                   <Button external  target="_blank" fullWidth url={withParams(`https://admin.shopify.com/store/${storeShort}/themes/${Published_theme_id}/editor?context=apps`)} variant="primary">
//                     Activate Theme
//                   </Button>
//                 </LegacyCard>
//               </Grid.Cell>

//             </Grid>
//           </Layout.Section>
//         </Layout>
//       </BlockStack>
//     </Page>
//   );
// }

// app/routes/app._index.jsx
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import "./assests/style.css";
import { Page, Layout, BlockStack, Banner, Grid, LegacyCard, Button, Box, Link, Select, InlineStack, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";
import connectDatabase from "../lib/dbconnect.js";
import { Store } from "../models/storemodal.js";
import 'antd/dist/reset.css'

// export const loader = async ({ request }) => {
//   const { session } = await authenticate.admin(request);
//   const shopName = session.shop;
//   const accessToken = session.accessToken;

//   // DB upsert
//   await connectDatabase();
//   await Store.updateOne(
//     { shopName },
//     {
//       $set: { accessToken, uninstalledAt: null },
//       $setOnInsert: { installedAt: new Date() },
//       $currentDate: { updatedAt: true },
//     },
//     { upsert: true }
//   );


//   const storeDoc = await Store.findOne({ shopName: shopName }).lean();
//   const installedAt = storeDoc?.installedAt || storeDoc?.createdAt;
//   let sinceFromDB  = new Date(installedAt).toISOString();

//   const sinceISO = new Date(sinceFromDB).toISOString().replace(/\.\d{3}Z$/, "Z");

//   console.log("vikasssss",sinceISO);

//    const query = `#graphql
//     query OrdersAfterCount($q: String!) {
//       ordersCount(query: $q) { count }
//     }
//   `;
   
//    const variables = {
//     q: `created_at:>=${sinceISO} status:any`,
//   };

//     const API_VERSION = "2025-07"; // adjust if you prefer a different stable version
//   const endpoint = `https://${session.shop}/admin/api/${API_VERSION}/graphql.json`;

//   const res = await fetch(endpoint, {
//     method: "POST",
//     headers: {
//       "X-Shopify-Access-Token": session.accessToken,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ query, variables }),
//   });

//     const payload = await res.json();
//   if (payload.errors) {
//     return new Response(
//       JSON.stringify({ error: payload.errors, sinceISO }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }

//   const count = payload?.data?.ordersCount?.count ?? 0;

//   if(count){
//       return new Response(
//         JSON.stringify({ count, sinceISO }),
//         { headers: { "Content-Type": "application/json" } }
//   );
//   }


//   console.log("cdgfxbgvecdscfvg", count);
//   // Keep host/shop in URLs to avoid OAuth relogin on internal nav
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

//   // Try role=main first
//   try {
//     const res = await fetch(`${api}/themes.json?role=main`, { method: "GET", headers });
//     const data = await res.json();
//     const arr = Array.isArray(data?.themes) ? data.themes : [];
//     if (arr.length) {
//       themes = arr;
//       mainThemeId = arr[0]?.id ?? null;
//     }
//   } catch (e) {
//     console.warn("Themes (role=main) fetch failed:", e);
//   }

//   // Fallback: fetch all themes and pick main/live/first
//   if (!mainThemeId) {
//     try {
//       const resAll = await fetch(`${api}/themes.json`, { method: "GET", headers });
//       const dataAll = await resAll.json();
//       const arrAll = Array.isArray(dataAll?.themes) ? dataAll.themes : [];
//       themes = arrAll;
//       const main = arrAll.find((t) => t.role === "main") || arrAll.find((t) => t.role === "live") || arrAll[0];
//       mainThemeId = main?.id ?? null;
//     } catch (e) {
//       console.warn("Themes (all) fetch failed:", e);
//     }
//   }

//   // Always return consistent shapes
//   const themeIds = themes.map((t) => t.id).filter(Boolean);

//   return json({ host, shop, mainThemeId, themeIds });
// };

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopName = session.shop;
  const accessToken = session.accessToken;

  // Validate we have a shop name from the session. If this is missing
  // something upstream failed during auth; surface a helpful error.
  if (!shopName) {
    console.error("Missing shopName in session during dashboard loader", { session });
    throw new Response(JSON.stringify({ error: "Missing shop in session" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // DB upsert
  try {
    await connectDatabase();
    
    // Some older deployments created a unique index on `shop` instead of
    // `shopName`. To be defensive we set both fields when inserting/updating
    // so we don't accidentally create documents with a null `shop` value
    // which would trigger E11000 duplicate key errors.
    await Store.updateOne(
      { shopName: shopName },
      {
        $set: { shopName: shopName, shop: shopName, accessToken, uninstalledAt: null },
        $setOnInsert: { installedAt: new Date() },
        $currentDate: { updatedAt: true },
      },
      { upsert: true }
    );
  } catch (e) {
    console.error("Database operation failed", { shopName, error: e && e.message, stack: e && e.stack });
    // Re-throw a helpful 500 response so the host logs contain the stacktrace
    throw new Response(JSON.stringify({ error: "Failed to connect to database or upsert store", details: e && e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const storeDoc = await Store.findOne({ shopName }).lean();
  const installedAt = storeDoc?.installedAt || storeDoc?.createdAt;
  const sinceISO = new Date(installedAt).toISOString().replace(/\.\d{3}Z$/, "Z");

  // GraphQL query with aliases
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

  const API_VERSION = "2025-07";
  const endpoint = `https://${shopName}/admin/api/${API_VERSION}/graphql.json`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await res.json();
  if (payload.errors) {
    return new Response(
      JSON.stringify({ error: payload.errors, sinceISO }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Extract data
  const totalOrders = payload?.data?.totalOrders?.count ?? 0;
  const totalAmount = payload?.data?.totalOrdersList?.edges?.reduce(
    (acc, { node }) => acc + parseFloat(node.totalPrice || 0),
    0
  ) ?? 0;

  const todayCount = payload?.data?.todayOrders?.count ?? 0;
  const todayAmount = payload?.data?.todayOrdersList?.edges?.reduce(
    (acc, { node }) => acc + parseFloat(node.totalPrice || 0),
    0
  ) ?? 0;

  // Theme logic (unchanged)
  const url = new URL(request.url);
  const host = url.searchParams.get("host") ?? "";
  const shop = url.searchParams.get("shop") ?? "";

  // ---- Fetch main theme safely ----
  const api = `https://${shopName}/admin/api/2023-10`;
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": accessToken,
  };

  let themes = [];
  let mainThemeId = null;

  // Fetch ALL themes (published + preview) for the theme selector
  try {
    const resAll = await fetch(`${api}/themes.json`, { method: "GET", headers });
    if (!resAll.ok) {
      throw new Error(`HTTP ${resAll.status}: ${resAll.statusText}`);
    }
    const dataAll = await resAll.json();
    const arrAll = Array.isArray(dataAll?.themes) ? dataAll.themes : [];
    themes = arrAll;
    const main = arrAll.find((t) => t.role === "main") ||
                 arrAll.find((t) => t.role === "live") ||
                 arrAll[0];
    mainThemeId = main?.id ?? null;
  } catch (e) {
    console.warn("❌ Themes fetch failed:", e.message);
  }

  // Normalize themes for UI: { id, name, role, roleLabel }
  const roleLabels = { main: "Published", live: "Published", unpublished: "Preview" };
  const themesForSelect = themes.map((t) => ({
    id: t.id,
    name: t.name || `Theme ${t.id}`,
    role: t.role || "unpublished",
    roleLabel: roleLabels[t.role] || "Preview",
  }));

  const themeIds = themes.map((t) => t.id).filter(Boolean);

  // Graphql query for get curecny code 

  const shopRes = await fetch(`https://${shopName}/admin/api/${API_VERSION}/shop.json`, {
    method: "GET",
    headers: { 
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });
  
  const shopData = await shopRes.json();
  console.log("shopData",shopData);
  const currency = shopData?.shop?.currency || "USD";


  const currencySymbolMap = {
    "INR": "₹",
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "AUD": "A$",
    "CAD": "C$",
    "JPY": "¥",
    "SGD": "S$",
  };

  const currencySymbol  = currencySymbolMap[currency] || currency


  // Combine order data with theme data
  return json({
    host,
    shop,
    mainThemeId,
    themeIds,
    themes: themesForSelect,
    totalOrders,
    totalAmount,
    todayCount,
    todayAmount,
    sinceISO,
    currency,
    currencySymbol
  });

}; 


export default function Dashboard() {
  const data = useLoaderData();
  const navigation = useNavigation();
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
  } = data;

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

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <BlockStack gap="500">
        <Layout>
          {isPageLoading && (
            <Layout.Section>
              <Banner tone="info" title="Loading dashboard">
                Please wait for the page to finish loading. Theme buttons will work once the dashboard has loaded.
              </Banner>
            </Layout.Section>
          )}
          {!isPageLoading && themeButtonsDisabled && dismiss1 && (
            <Layout.Section>
              <Banner tone="attention" title="Theme buttons need a refresh">
                If the theme buttons above don&apos;t work, refresh the page to load theme data (e.g. switch away and back to Dashboard, or reload the app).
              </Banner>
            </Layout.Section>
          )}
          <Layout.Section>
          {dismiss1 && (
            <Banner
              tone="warning"
              title="Enable the app from your store"
              onDismiss={() => setDismiss1(false)}
              secondaryAction={{
                content: "Third Party Checkout Integration",
                url: withParams("/app/settings"),
              }}
            >
              <BlockStack gap="300">
                <Text as="p" fontWeight="medium">
                  The app will not appear for customers until you enable it in your store. Go to Theme Editor → Customize → App blocks → QuickCart and turn the block on.
                </Text>
                {themesList.length > 0 && (
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <div style={{ minWidth: 280 }}>
                      <Select
                        label="Choose theme (Published or Preview)"
                        labelInline
                        options={themeOptions}
                        value={effectiveThemeId}
                        onChange={setSelectedThemeId}
                      />
                    </div>
                    <Button variant="primary" onClick={handleOpenSelectedTheme} disabled={!effectiveThemeId || !storeShort}>
                      Open selected theme in Theme Editor
                    </Button>
                    <Button onClick={handleOpenLiveTheme} disabled={!mainThemeId || !storeShort}>
                      Enable on live theme
                    </Button>
                  </InlineStack>
                )}
              </BlockStack>
            </Banner>
          )}
          </Layout.Section>
     
          <Layout.Section>
          <h4 className="i-gs-section-title" style={{textTransform:"uppercase"}}>Orders Analytics Dashboard</h4>
            <Grid>
              <Grid.Cell columnSpan={{xs:12, sm:12, md:3, lg:3, xl:3}}>
                <LegacyCard sectioned> 
                  <div className="order-analytics-wrapper">
                    <h5>{(Number(totalOrders) || 0).toLocaleString()}</h5>
                    <p>Total Orders</p>
                  </div>
                </LegacyCard>
              </Grid.Cell>
                <Grid.Cell columnSpan={{xs:12, sm:12, md:3, lg:3, xl:3}}>
                <LegacyCard sectioned>
                  <div className="order-analytics-wrapper">
                    <h5><span className="curecnySymbol">{currencySymbol || currency || ""}</span>{(Number(totalAmount) || 0).toLocaleString()}</h5>
                    <p>Total Amount</p>
                  </div>
                </LegacyCard>
              </Grid.Cell>
                <Grid.Cell columnSpan={{xs:12, sm:12, md:3, lg:3, xl:3}}>
                  <LegacyCard sectioned>
                  <div className="order-analytics-wrapper">
                    <h5>{(Number(todayCount) || 0).toLocaleString()}</h5>
                    <p>Today Orders</p>
                  </div>
                  </LegacyCard>
              </Grid.Cell>
              <Grid.Cell columnSpan={{xs:12, sm:12, md:3, lg:3, xl:3}}>
                <LegacyCard sectioned> 
                <div className="order-analytics-wrapper">
                    <h5><span className="curecnySymbol">{currencySymbol || currency || ""}</span>{(Number(todayAmount) || 0).toLocaleString()}</h5>
                    <p>Today Amount</p>
                  </div>
                </LegacyCard>
              </Grid.Cell>
            </Grid>
          </Layout.Section>

          <Layout.Section>
            <h4 className="i-gs-section-title" style={{textTransform:"uppercase"}}>Create Discount Progress Bar  </h4>

            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/price_based_disount.png?v=1768556274"
                    alt="Unlock Offers" 
                  />
                  <h4 className="i-gs-grid-heading"> Price based Discount Progress Bar  </h4>
                  <p className="i-gs-grid-subheading">Create a discount progress bar based on the price range of the cart total. (IMPORTANT : Create Disount as per the Price Ranges in Shopify Discounts) </p>
                  <Button fullWidth url={withParams("/app/progressbar")} variant="primary">
                    Setup Progress Bar
                  </Button>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/buy-one-get-one.png?v=1768556274"
                    alt="Buy X Get Y"
                  />  
                  <h4 className="i-gs-grid-heading">Buy X Get Y Discount Progress Bar</h4>
                  <p className="i-gs-grid-subheading">Create a discount progress bar based on the buy and get quantities. (IMPORTANT : Create Disount as per the Buy and Get Quantities in Shopify Discounts) </p>
                  <Button fullWidth url={withParams("/app/progressbaron1")}>Setup BxGy</Button>
                </LegacyCard>
              </Grid.Cell>

            

            </Grid>
          </Layout.Section>

          <Layout.Section>
            <h4 className="i-gs-section-title" style={{textTransform:"uppercase"}}>Cart Drawer Features</h4>

            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/upsell_product.png?v=1768556274"
                    alt="Unlock Offers" 
                  />
                  <h4 className="i-gs-grid-heading">Setup Upsell Collection</h4>
                  <p className="i-gs-grid-subheading">Select the collection for upsell products in the cart drawer. (IMPORTANT : Collection should be in the shopify) </p>
                  <Button fullWidth url={withParams("/app/settings")} variant="primary">
                   Setup Upsell Collection
                  </Button>
                </LegacyCard>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/one-product.png?v=1768556274"
                    alt="Buy X Get Y"
                  />   
                  <h4 className="i-gs-grid-heading">A Most Selling Product at cart Drawer</h4>
                  <p className="i-gs-grid-subheading">Add one product at the cart drawer. (IMPORTANT : Product should be in the shopify) </p>
                  <Button fullWidth url={withParams("/app/settings")}>Setup One Product</Button>
                </LegacyCard>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/third_party.png?v=1768556274"
                    alt="Buy X Get Y"
                  />  
                  <h4 className="i-gs-grid-heading">Third Party Checkout Integration</h4>
                  <p className="i-gs-grid-subheading">Append Third Party Checkout Integration Code in the cart drawer. (IMPORTANT : Code should be in the shopify) </p>
                  <Button fullWidth url={withParams("/app/settings")}>Third Party Checkout Integration</Button>
                </LegacyCard>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/announcement-carousel.png?v=1768556274"
                    alt="Buy X Get Y"
                  />  
                  <h4 className="i-gs-grid-heading">Create Announcement Bar carousel</h4>
                  <p className="i-gs-grid-subheading"> Create Announcement Bar carousel in the cart drawer.  Add multiple announcements slide by seprated (,) to the carousel. </p>
                  <Button fullWidth url={withParams("/app/settings")}>Setup Announcement Bar carousel</Button>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/stopwatch.png?v=1768556274"
                    alt="Buy X Get Y"
                  />  
                  <h4 className="i-gs-grid-heading">Setup Countdown Timer</h4>
                  <p className="i-gs-grid-subheading"> Setup Countdown Timer in the cart drawer. (CountDown Timer refresh automatically After a day) </p>
                  <Button fullWidth url={withParams("/app/settings")}>Setup Countdown Timer</Button>
                </LegacyCard>
              </Grid.Cell>
            

            </Grid>
          </Layout.Section>

          

          
          <Layout.Section>
             <h4 className="i-gs-section-title">Setup Free Gift Product</h4>
            <Grid>
            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.shopify.com/s/files/1/0796/7847/2226/files/gift_product.png?v=1768556274"
                    alt="Gift Product"
                  />
                  <h4 className="i-gs-grid-heading">Setup Free Gift Product</h4>
                  <p className="i-gs-grid-subheading">Gift Product Automatically Added to cart  when the cart total exceeds the set price (IMPORTANT : Gift Product Price same as updated in shopify)</p>
                  <Button variant="primary" fullWidth url={withParams("/app/giftproduct")}> Set Gift Product</Button>
                </LegacyCard> 

              </Grid.Cell> 
            </Grid>
          </Layout.Section>

          <Layout.Section>
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
          </Layout.Section>

          <Layout.Section>
            {dismiss && 
            <div style={{ marginBottom: 16 }}>
              <Box marginBlockEnd="400">
                <Banner
                  tone="info"
                  title="Need help?"
                  onDismiss={() => {setDismiss(false)}} 
                  action={{ 
                    content: "Support",
                    url: withParams(`/app/help`),
                    external: true, // opens in new tab
                  }}
                  secondaryAction={{
                    content: "How to use & Customize",
                    url: "https://cdn.shopify.com/videos/c/o/v/7bf07a776af648b1a140f0ce6608fd6d.mp4",
                   external: true,
                target: "_blank",
                  }}
                >
                  <p> 
                    If you have any questions or encounter errors while using this app, email{" "}
                    <a href="mailto:support@digisidekick.com">support@digisidekick.com</a> or <a href="mailto:vikasprasad@digisidekick.com">vikasprasad@digisidekick.com</a>.
                  </p>
                </Banner>
              </Box>
            </div>}
             

        
          </Layout.Section>
 
        </Layout>
      </BlockStack>

   
    </Page>
  );
}
