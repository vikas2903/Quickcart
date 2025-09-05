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
import { useLoaderData } from "@remix-run/react";
import "./assests/style.css";
import { Page, Layout, BlockStack, Banner, Grid, LegacyCard, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

import connectDatabase from "../lib/dbconnect.js";
import { Store } from "../models/storemodal.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopName = session.shop;
  const accessToken = session.accessToken;

  // DB upsert
  await connectDatabase();
  await Store.updateOne(
    { shopName },
    {
      $set: { accessToken, uninstalledAt: null },
      $setOnInsert: { installedAt: new Date() },
      $currentDate: { updatedAt: true },
    },
    { upsert: true }
  );

  // Keep host/shop in URLs to avoid OAuth relogin on internal nav
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

  // Try role=main first
  try {
    const res = await fetch(`${api}/themes.json?role=main`, { method: "GET", headers });
    const data = await res.json();
    const arr = Array.isArray(data?.themes) ? data.themes : [];
    if (arr.length) {
      themes = arr;
      mainThemeId = arr[0]?.id ?? null;
    }
  } catch (e) {
    console.warn("Themes (role=main) fetch failed:", e);
  }

  // Fallback: fetch all themes and pick main/live/first
  if (!mainThemeId) {
    try {
      const resAll = await fetch(`${api}/themes.json`, { method: "GET", headers });
      const dataAll = await resAll.json();
      const arrAll = Array.isArray(dataAll?.themes) ? dataAll.themes : [];
      themes = arrAll;
      const main = arrAll.find((t) => t.role === "main") || arrAll.find((t) => t.role === "live") || arrAll[0];
      mainThemeId = main?.id ?? null;
    } catch (e) {
      console.warn("Themes (all) fetch failed:", e);
    }
  }

  // Always return consistent shapes
  const themeIds = themes.map((t) => t.id).filter(Boolean);

  return json({ host, shop, mainThemeId, themeIds });
};

export default function Dashboard() {
  const { host, shop, mainThemeId } = useLoaderData();

  const storeShort = (shop || "").replace(".myshopify.com", "");

  // helper to append host/shop to internal links
  const withParams = (path) => {
    const params = new URLSearchParams();
    if (host) params.set("host", host);
    if (shop) params.set("shop", shop);
    return `${path}${path.includes("?") ? "&" : "?"}${params.toString()}`;
  };

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Banner
              tone="warning"
              title="You need to integrate the app into your Shopify theme"
              action={{
                content: "Activate extension in theme",
                url: withParams(
                  `https://admin.shopify.com/store/${storeShort}/themes/${mainThemeId ?? ""}/editor?context=apps`
                ),
                external: true,
                target: "_blank",
              }}
              secondaryAction={{
                content: "How to use & Customize",
                url: "https://youtu.be/ojooDuF6UlE?si=LqSznKp4X0N51z_w",
                external: true,
                target: "_blank",
              }}
            >
              <p>Your settings are saved. Activate the app in Shopify’s Theme Editor to make it visible on your store.</p>
            </Banner>
          </Layout.Section>

          <Layout.Section>
            <h4 className="i-gs-section-title">Get Started</h4>

            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.qikify.com/portal/v2/checkout/dashboard-step-1.svg"
                    alt="Unlock Offers"
                  />
                  <h4 className="i-gs-grid-heading">1. Create Progress Bar</h4>
                  <p className="i-gs-grid-subheading">Configure milestones based on cart total or product price.</p>
                  <Button fullWidth url={withParams("/app/progressbar")} variant="primary">
                    Setup Progress Bar
                  </Button>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.qikify.com/portal/v2/checkout/dashboard-step-1.svg"
                    alt="Buy X Get Y"
                  />
                  <h4 className="i-gs-grid-heading">2. Buy X Get Y</h4>
                  <p className="i-gs-grid-subheading">Set Buy/Free quantities and custom messages.</p>
                  <Button fullWidth url={withParams("/app/progressbaron1")}>Setup BxGy</Button>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.qikify.com/portal/v2/checkout/dashboard-step-1.svg"
                    alt="Buy X Get Free"
                  />
                  <h4 className="i-gs-grid-heading">2. Buy X Get Free</h4>
                  <p className="i-gs-grid-subheading">Buy X Get Free Product</p>
                  <Button fullWidth url={withParams("/app/freeproduct")}>Setup BxGy</Button>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                <LegacyCard sectioned>
                  <img
                    className="i-gs-img"
                    src="https://cdn.qikify.com/portal/v2/checkout/dashboard-step-3.svg"
                    alt="Integrate with theme"
                  />
                  <h4 className="i-gs-grid-heading">Integrate with theme</h4>
                  <p className="i-gs-grid-subheading">Activate the app block in Theme Editor to go live.</p>
                  <Button
                    external
                    target="_blank"
                    fullWidth
                    url={withParams(
                      `https://admin.shopify.com/store/${storeShort}/themes/${mainThemeId ?? ""}/editor?context=apps`
                    )}
                    variant="primary"
                  >
                    Activate Theme
                  </Button>
                </LegacyCard>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
