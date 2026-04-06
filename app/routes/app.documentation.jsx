/**
 * DOCUMENTATION PAGE — Visual Step-by-Step Setup Guide
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server.js";
import {
  Page,
  Layout,
  BlockStack,
  Text,
  Banner,
  Box,
  InlineStack,
  Button,
  Divider,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const storeShort = session.shop?.replace(".myshopify.com", "");
  return json({ shop: session.shop, storeShort });
};

/* ══════════════════════════════════════
   INLINE STYLES
   ══════════════════════════════════════ */
const S = {
  page: {
    maxWidth: 860,
    margin: "0 auto",
    paddingBottom: 60,
  },

  /* Hero */
  hero: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    borderRadius: 16,
    padding: "40px 36px",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    marginBottom: 8,
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  heroSub: {
    fontSize: 14,
    opacity: 0.75,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  heroBtns: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  heroBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    textDecoration: "none",
    transition: "transform 0.15s",
  },
  heroBtnPrimary: {
    background: "#6366f1",
    color: "#fff",
  },
  heroBtnSecondary: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
  },

  /* Section header */
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a2e",
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 6,
    marginLeft: 6,
  },

  /* Step timeline */
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    marginLeft: 18,
    borderLeft: "2px solid #e5e7eb",
    paddingLeft: 24,
  },
  step: {
    position: "relative",
    paddingBottom: 20,
    paddingTop: 2,
  },
  stepDot: {
    position: "absolute",
    left: -34,
    top: 2,
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    zIndex: 1,
  },
  stepText: {
    fontSize: 13.5,
    lineHeight: 1.6,
    color: "#374151",
  },
  stepHighlight: {
    background: "#f1f5f9",
    borderRadius: 8,
    padding: "6px 10px",
    fontFamily: "monospace",
    fontSize: 12,
    color: "#4338ca",
    display: "inline",
  },

  /* Feature card grid */
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 14,
  },
  featureCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "20px 18px",
    background: "#fff",
    transition: "box-shadow 0.2s, border-color 0.2s",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },
  featureCardHover: {
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    borderColor: "#c7d2fe",
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12.5,
    lineHeight: 1.5,
    color: "#64748b",
    marginBottom: 10,
  },
  featureNav: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6366f1",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  /* Tip / warning box */
  tipBox: {
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 1.55,
  },
  tipIcon: {
    fontSize: 16,
    flexShrink: 0,
    marginTop: 1,
  },

  /* FAQ */
  faqItem: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginBottom: 8,
    overflow: "hidden",
    background: "#fff",
  },
  faqQ: {
    padding: "14px 18px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    userSelect: "none",
    fontSize: 13.5,
    fontWeight: 600,
    color: "#1e293b",
  },
  faqA: {
    padding: "0 18px 16px 18px",
    fontSize: 13,
    lineHeight: 1.6,
    color: "#64748b",
  },
  faqChevron: {
    fontSize: 16,
    transition: "transform 0.2s",
    color: "#94a3b8",
  },
};

/* ══════════════════════════════════════
   SMALL COMPONENTS
   ══════════════════════════════════════ */

function StepTimeline({ steps, color = "#6366f1" }) {
  return (
    <div style={S.timeline}>
      {steps.map((text, i) => (
        <div key={i} style={S.step}>
          <div style={{ ...S.stepDot, background: color }}>{i + 1}</div>
          <div style={S.stepText}>{text}</div>
        </div>
      ))}
    </div>
  );
}

function TipBox({ type = "tip", children }) {
  const isTip = type === "tip";
  return (
    <div
      style={{
        ...S.tipBox,
        background: isTip ? "#eff6ff" : "#fffbeb",
        border: `1px solid ${isTip ? "#bfdbfe" : "#fde68a"}`,
        color: isTip ? "#1e40af" : "#92400e",
      }}
    >
      <span style={S.tipIcon}>{isTip ? "💡" : "⚠️"}</span>
      <span>{children}</span>
    </div>
  );
}

function FeatureCard({ icon, bg, title, desc, nav, onClick, active, activeColor }) {
  const [hovered, setHover] = useState(false);
  return (
    <div
      style={{
        ...S.featureCard,
        ...(hovered ? S.featureCardHover : {}),
        ...(active ? { borderColor: activeColor, borderWidth: 2, boxShadow: `0 0 0 1px ${activeColor}33` } : {}),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <div style={{ ...S.featureIcon, background: bg }}>{icon}</div>
      <div style={S.featureTitle}>{title}</div>
      <div style={S.featureDesc}>{desc}</div>
      <div style={S.featureNav}>{nav} →</div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={S.faqItem}>
      <div style={S.faqQ} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span style={{ ...S.faqChevron, transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </div>
      {open && <div style={S.faqA}>{a}</div>}
    </div>
  );
}

function SectionHeader({ icon, bg, title, badge, badgeColor }) {
  return (
    <div style={S.sectionHeader}>
      <div style={{ ...S.sectionIcon, background: bg }}>{icon}</div>
      <span style={S.sectionTitle}>{title}</span>
      {badge && (
        <span
          style={{
            ...S.sectionBadge,
            background: badgeColor || "#e0e7ff",
            color: badgeColor ? "#fff" : "#4338ca",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   DETAIL PANELS (shown when a card is clicked)
   ══════════════════════════════════════ */
const FEATURES = [
  {
    id: "styling",
    icon: "🎨",
    bg: "#f0e7ff",
    title: "Cart Drawer Styling",
    desc: "Colors, borders, checkout button — match your brand.",
    nav: "Styling page → Cart Drawer tab",
    color: "#7c3aed",
    steps: [
      <>Go to <strong>Styling</strong> from the sidebar menu</>,
      <>Open the <strong>Cart Drawer</strong> tab</>,
      <>Pick your <strong>Background Color</strong> and <strong>Text Color</strong></>,
      <>Adjust <strong>Border Radius</strong> (0 = sharp corners, 20+ = rounded)</>,
      <>Set <strong>Checkout Button</strong> color, text color & radius</>,
      <>Hit <strong>Save Settings</strong></>,
    ],
    tip: "Changes show instantly on your live store after a page refresh.",
  },
  {
    id: "announcement",
    icon: "📢",
    bg: "#fef3c7",
    title: "Announcement Bar",
    desc: "Promo banner at the top of the cart drawer.",
    nav: "Styling page → Announcement Bar tab",
    color: "#d97706",
    steps: [
      <>Open <strong>Styling</strong> → <strong>Announcement Bar</strong> tab</>,
      <>Toggle the <strong>Enable</strong> switch on</>,
      <>Type your message (e.g., "Free shipping above ₹999")</>,
      <>For a <strong>rotating carousel</strong>, separate messages with commas</>,
      <>Pick <strong>Background</strong> and <strong>Text</strong> colors</>,
      <>Click <strong>Save Settings</strong></>,
    ],
    tip: "Use 3+ comma-separated messages for the best carousel effect.",
  },
  {
    id: "countdown",
    icon: "⏱️",
    bg: "#e0f2fe",
    title: "Countdown Timer",
    desc: "Add urgency with a ticking timer in the cart.",
    nav: "Styling page → Countdown tab",
    color: "#0284c7",
    steps: [
      <>Go to <strong>Styling</strong> → <strong>Countdown</strong> tab</>,
      <>Toggle <strong>Show Countdown</strong> on</>,
      <>Set <strong>Background</strong>, <strong>Text</strong>, <strong>Chip</strong> colors</>,
      <>Adjust <strong>Border Radius</strong></>,
      <>Click <strong>Save Settings</strong></>,
    ],
  },
  {
    id: "upsell",
    icon: "🛍️",
    bg: "#dcfce7",
    title: "Upsell Collection",
    desc: "Show recommended products to boost order value.",
    nav: "Styling page → Upsell Collection tab",
    color: "#16a34a",
    steps: [
      <>Open <strong>Styling</strong> → <strong>Upsell Collection</strong> tab</>,
      <>Toggle <strong>Enable</strong> on</>,
      <>Select a <strong>collection</strong> from the dropdown</>,
      <>Click <strong>Save Settings</strong></>,
      <>Products from that collection now appear in the cart drawer</>,
    ],
    tip: "Create a dedicated \"Recommended Products\" collection with your best sellers.",
    warn: "Products already in the cart are automatically hidden from upsell.",
  },
  {
    id: "gift",
    icon: "🎁",
    bg: "#fce7f3",
    title: "Free Gift Product",
    desc: "Auto-add a free gift when cart exceeds a value.",
    nav: "Sidebar → Free Gift Product",
    color: "#db2777",
    steps: [
      <>Navigate to <strong>Free Gift Product</strong> in the sidebar</>,
      <>Toggle <strong>Enable</strong> on</>,
      <>Search and select your <strong>gift product</strong></>,
      <>Set the <strong>minimum cart value</strong> (e.g., ₹999)</>,
      <>Click <strong>Save</strong></>,
    ],
    tip: "The gift shows as \"FREE\" in cart and customers can't remove it.",
    warn: "The product must exist and be published in your store.",
  },
  {
    id: "shipping",
    icon: "🚚",
    bg: "#dbeafe",
    title: "Shipping Progress Bar",
    desc: "Visual bar showing progress toward free shipping.",
    nav: "Styling page → Shipping Bar tab",
    color: "#2563eb",
    steps: [
      <>Open <strong>Styling</strong> → <strong>Shipping Bar</strong> tab</>,
      <>Toggle <strong>Enable</strong> on</>,
      <>Set the <strong>Threshold</strong> amount (e.g., ₹999)</>,
      <>Customize <strong>Fill</strong>, <strong>Background</strong>, and <strong>Text</strong> colors</>,
      <>Click <strong>Save Settings</strong></>,
    ],
    tip: "The bar fills up in real-time as customers add items. At 100% it shows \"🎉 You got Free Shipping!\"",
  },
  {
    id: "progressbar",
    icon: "💰",
    bg: "#fef9c3",
    title: "Price-Based Progress Bar",
    desc: "Tiered rewards — spend more, unlock discounts.",
    nav: "Sidebar → Prices Based ProgressBar",
    color: "#ca8a04",
    steps: [
      <>Navigate to <strong>Prices Based ProgressBar</strong> in the sidebar</>,
      <>Configure <strong>price tiers</strong> and linked rewards</>,
      <>Set colors and style</>,
      <>Enable and <strong>Save</strong></>,
    ],
    tip: "Keep the first tier achievable (e.g., ₹500) to motivate initial upsells.",
  },
  {
    id: "bxgy",
    icon: "🔄",
    bg: "#e0e7ff",
    title: "Buy X Get Y Progress Bar",
    desc: "BOGO / bundle deals with a visual tracker.",
    nav: "Sidebar → BxGy-ProgressBar",
    color: "#4f46e5",
    steps: [
      <>Navigate to <strong>BxGy-ProgressBar</strong> in the sidebar</>,
      <>Configure promotion rules (e.g., Buy 3 Get 1 Free)</>,
      <>Set the visual style and messaging</>,
      <>Enable and <strong>Save</strong></>,
    ],
  },
  {
    id: "thirdparty",
    icon: "🔌",
    bg: "#f1f5f9",
    title: "Third-Party Checkout",
    desc: "Replace checkout button with a custom one.",
    nav: "Styling page → Third Party tab",
    color: "#475569",
    steps: [
      <>Open <strong>Styling</strong> → <strong>Third Party Integration</strong> tab</>,
      <>Toggle <strong>Enable</strong> on</>,
      <>Paste your custom <strong>HTML/Liquid code</strong></>,
      <>Click <strong>Save Settings</strong></>,
    ],
    warn: "Advanced feature — test on a preview theme first before going live.",
  },
];

const FAQ_DATA = [
  {
    q: "Cart drawer is not showing on my store",
    a: "Enable the QuickCart app block in your Theme Editor: Customize → App embeds → toggle QuickCart ON → Save.",
  },
  {
    q: "Styling changes don't appear after saving",
    a: "Do a hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac). Settings load dynamically on each page visit.",
  },
  {
    q: "Free gift is not being added automatically",
    a: "Check: (1) feature is enabled, (2) product is selected & published, (3) cart total exceeds threshold in major units (₹999, not ₹9.99).",
  },
  {
    q: "Upsell products are not showing in the cart",
    a: "Verify: (1) upsell is enabled, (2) a collection is selected, (3) the collection has products. Items already in cart are auto-hidden.",
  },
  {
    q: "I see a CORS error in the console",
    a: "The API server (Render free tier) may have gone to sleep. Wait 30–60 seconds for it to wake up and refresh the page.",
  },
  {
    q: "Can I use QuickCart on multiple themes?",
    a: "Yes! Enable the app block on any theme. Settings are shared across all themes for the same store.",
  },
];

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */
export default function Documentation() {
  const { shop, storeShort } = useLoaderData();
  const [activeFeature, setActiveFeature] = useState(null);
  const detailRef = useRef(null);

  const selected = FEATURES.find((f) => f.id === activeFeature);

  // Scroll to detail panel when a feature card is clicked
  useEffect(() => {
    if (activeFeature && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [activeFeature]);

  return (
    <Page fullWidth>
      <TitleBar title="Documentation" />
      <div style={S.page}>

        {/* ─── HERO ─── */}
        <div style={S.hero}>
          <div style={S.heroGlow} />
          <div style={S.heroTitle}>Setup Guide</div>
          <div style={S.heroSub}>
            Get your cart drawer live in under 2 minutes. Follow the steps below.
          </div>
          <div style={S.heroBtns}>
            <a
              href={
                storeShort
                  ? `https://admin.shopify.com/store/${storeShort}/themes/current/editor?context=apps`
                  : "#"
              }
              target="_blank"
              rel="noreferrer"
              style={{ ...S.heroBtn, ...S.heroBtnPrimary }}
            >
              ⚡ Open Theme Editor
            </a>
            <a
              href="https://cdn.shopify.com/videos/c/o/v/7bf07a776af648b1a140f0ce6608fd6d.mp4"
              target="_blank"
              rel="noreferrer"
              style={{ ...S.heroBtn, ...S.heroBtnSecondary }}
            >
              ▶ Watch Video Tutorial
            </a>
          </div>
        </div>

        {/* ─── STEP 1: ENABLE ─── */}
        <SectionHeader
          icon="🚀"
          bg="#eef2ff"
          title="First: Enable QuickCart on Your Theme"
          badge="Required"
          badgeColor="#ef4444"
        />
        <div
          style={{
            background: "#fafbff",
            border: "1px solid #e0e7ff",
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          <StepTimeline
            color="#6366f1"
            steps={[
              <>Shopify Admin → <strong>Online Store</strong> → <strong>Themes</strong></>,
              <>Click <strong>"Customize"</strong> on your active theme</>,
              <>In the editor sidebar find <strong>"App embeds"</strong> or <strong>"App blocks"</strong></>,
              <>Toggle <strong>QuickCart</strong> ON</>,
              <>Click <strong>Save</strong> (top-right corner)</>,
              <>Visit your store → click the cart icon → the drawer should appear ✅</>,
            ]}
          />
          <TipBox>
            You can also enable on preview themes before publishing. Use the Dashboard theme selector.
          </TipBox>
        </div>

        {/* ─── FEATURES GRID ─── */}
        <SectionHeader icon="⚙️" bg="#f0fdf4" title="Features — Click Any Card for Setup Steps" />
        <div style={S.featureGrid}>
          {FEATURES.map((f) => (
            <FeatureCard
              key={f.id}
              icon={f.icon}
              bg={f.bg}
              title={f.title}
              desc={f.desc}
              nav={f.nav}
              active={activeFeature === f.id}
              activeColor={f.color}
              onClick={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
            />
          ))}
        </div>

        {/* ─── DETAIL PANEL (shown when card clicked) ─── */}
        {selected && (
          <div
            ref={detailRef}
            style={{
              marginTop: 18,
              border: `2px solid ${selected.color}22`,
              borderRadius: 16,
              background: "#fff",
              padding: "24px 26px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              animation: "fadeIn 0.2s ease",
              scrollMarginTop: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  ...S.featureIcon,
                  background: selected.bg,
                  marginBottom: 0,
                  fontSize: 24,
                }}
              >
                {selected.icon}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>
                  {selected.title}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{selected.nav}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button
                  onClick={() => setActiveFeature(null)}
                  style={{
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#6b7280",
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <StepTimeline steps={selected.steps} color={selected.color} />

            {selected.tip && <TipBox type="tip">{selected.tip}</TipBox>}
            {selected.warn && <TipBox type="warn">{selected.warn}</TipBox>}
          </div>
        )}

        {/* ─── FAQ ─── */}
        <SectionHeader icon="❓" bg="#fef3c7" title="Common Questions" />
        <div>
          {FAQ_DATA.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>

        {/* ─── SUPPORT FOOTER ─── */}
        <div
          style={{
            marginTop: 32,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "22px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
              Need help?
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              <a href="mailto:support@digisidekick.com" style={{ color: "#6366f1" }}>
                support@digisidekick.com
              </a>
              {" · "}
              <a href="mailto:vikasprasad@digisidekick.com" style={{ color: "#6366f1" }}>
                vikasprasad@digisidekick.com
              </a>
            </div>
          </div>
          <a
            href={`/app/help`}
            style={{
              ...S.heroBtn,
              ...S.heroBtnPrimary,
              fontSize: 12,
              padding: "8px 18px",
            }}
          >
            Open Support Page
          </a>
        </div>
      </div>

      {/* Inline keyframe for fade animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Page>
  );
}
