import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, LegacyCard, Grid, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  return json({
    shop: session.shop,
    host: url.searchParams.get("host") ?? "",
  });
};

const S = {
  page: {
    maxWidth: 1120,
    margin: "0 auto",
    paddingBottom: 32,
  },
  hero: {
    background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%)",
    borderRadius: 24,
    padding: "28px 30px",
    color: "#fff",
    marginBottom: 20,
  },
  eyebrow: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.14)",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: 700,
    marginBottom: 8,
    lineHeight: 1.15,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.88)",
    maxWidth: 720,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.6,
    marginBottom: 18,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    minHeight: 280,
    padding: "6px 2px",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
  },
  title: {
    fontSize: 19,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.25,
  },
  desc: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#475569",
  },
  bullets: {
    display: "grid",
    gap: 8,
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.55,
    marginBottom: 4,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
    width: "fit-content",
  },
};

const PROGRESS_BAR_TYPES = [
  {
    title: "Price Based Progress Bar",
    icon: "Rs",
    iconBg: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
    description: "Choose this when you want the reward to unlock after the cart reaches a certain amount.",
    bestFor: "Use this for free shipping, order value discounts, and spend more campaigns.",
    bullets: [
      "How it works: the bar moves forward as the cart total increases.",
      "Example: unlock rewards at 499, 999, and 1499.",
      "Best choice if your offer depends on money spent, not number of items.",
    ],
    url: "/app/progressbar",
    buttonText: "Set up price based",
  },
  {
    title: "Quantity Based Progress Bar",
    icon: "QTY",
    iconBg: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    description: "Choose this when you want the reward to unlock after customers add more items to the cart.",
    bestFor: "Use this for bundle offers, buy more save more, and mix-and-match deals.",
    bullets: [
      "How it works: the bar moves forward based on item quantity, not cart value.",
      "Example: unlock rewards at 2 items, 3 items, and 5 items.",
      "Best choice if your offer depends on quantity sold instead of order amount.",
    ],
    url: "/app/quantitytrieddiscount",
    buttonText: "Set up quantity based",
  },
  {
    title: "Collection Based Progress Bar",
    icon: "TAG",
    iconBg: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    description: "Choose this when only selected products should be counted in the progress bar.",
    bestFor: "Use this for category offers, selected products, and collection-specific campaigns.",
    bullets: [
      "How it works: only products with your selected tag are included in the progress.",
      "You can use price mode or quantity mode inside the same setup.",
      "Best choice if the offer should work only for one collection or product group.",
    ],
    url: "/app/collection-based-progressbar-qty-price-based-modals",
    buttonText: "Set up collection based",
  },
  {
    title: "Buy X Get Y Progress Bar",
    icon: "BxGy",
    iconBg: "linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)",
    description: "Choose this when customers must buy a required quantity to unlock a free or discounted item.",
    bestFor: "Use this for BOGO offers, buy 2 get 1 deals, and simple reward unlock campaigns.",
    bullets: [
      "How it works: the bar tracks how many items the customer needs to buy before the reward unlocks.",
      "It shows a clear progress message until the offer is unlocked.",
      "Best choice for classic Buy X Get Y promotions.",
    ],
    url: "/app/progressbaron1",
    buttonText: "Set up Buy X Get Y",
  },
];

export default function ProgressBarGuidePage() {
  const { host, shop } = useLoaderData();

  const withParams = (path) => {
    const params = new URLSearchParams();
    if (host) params.set("host", host);
    if (shop) params.set("shop", shop);
    return `${path}${path.includes("?") ? "&" : "?"}${params.toString()}`;
  };

  return (
    <Page fullWidth>
      <TitleBar title="Progress Bar Guide" />
      <div style={S.page}>
        <div style={S.hero}>
          <div style={S.eyebrow}>Progress Bar Guide</div>
          <div style={S.heroTitle}>Understand which progress bar matches your offer</div>
          <div style={S.heroText}>
            This page explains all 4 progress bar types in simple language. Read how each one works,
            what it is best used for, and then open the matching setup page for your campaign.
          </div>
        </div>

        <Layout>
          <Layout.Section>
            <div style={S.sectionTitle}>All progress bar types</div>
            <div style={S.sectionText}>
              If you are not sure which option to use, start by reading the "How it works" points on each card.
              That will help you understand the setup logic before you open the feature page.
            </div>

            <Grid>
              {PROGRESS_BAR_TYPES.map((item) => (
                <Grid.Cell key={item.title} columnSpan={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
                  <LegacyCard sectioned>
                    <div style={S.card}>
                      <div style={{ ...S.icon, background: item.iconBg }}>{item.icon}</div>
                      <div style={S.badge}>{item.bestFor}</div>
                      <div style={S.title}>{item.title}</div>
                      <div style={S.desc}>{item.description}</div>
                      <div style={S.bullets}>
                        {item.bullets.map((point) => (
                          <div key={point}>• {point}</div>
                        ))}
                      </div>
                      <Button variant="primary" url={withParams(item.url)}>
                        {item.buttonText}
                      </Button>
                    </div>
                  </LegacyCard>
                </Grid.Cell>
              ))}
            </Grid>
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}
