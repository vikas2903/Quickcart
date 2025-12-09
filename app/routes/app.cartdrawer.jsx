import React, { useEffect, useState } from "react";
import {
  Page,
  Layout,
  LegacyCard,
  BlockStack,
  Checkbox,
  TextField,
  Button,
  Tabs,
  ColorPicker,
  RangeSlider,
  Select,
  Banner,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "/app/api/cartdrawer";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  
  // Fetch collections for upsell dropdown
  const collectionsQuery = `
    query {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;
  
  let collections = [];
  try {
    const response = await admin.graphql(collectionsQuery);
    const result = await response.json();
    collections = result?.data?.collections?.edges?.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
    })) || [];
  } catch (error) {
    console.error("Error fetching collections:", error);
  }
  
  return json({ shop: session.shop, collections });
};

export default function CartDrawerSettings() {
  const { shop, collections } = useLoaderData();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Countdown Settings
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownBg, setCountdownBg] = useState("#5B9BD5");
  const [countdownTextColor, setCountdownTextColor] = useState("#ffffff");
  const [countdownChipBg, setCountdownChipBg] = useState("#ffffff");
  const [countdownChipText, setCountdownChipText] = useState("#2c3e50");
  const [countdownBorderRadius, setCountdownBorderRadius] = useState(50);
  const [countdownChipRadius, setCountdownChipRadius] = useState(10);

  // Upsell Settings
  const [upsellCollection, setUpsellCollection] = useState("");

  // Color Settings
  const [primaryColor, setPrimaryColor] = useState("#7c3444");
  const [bodyColor, setBodyColor] = useState("#f0e5e7");
  const [textColor, setTextColor] = useState("#000");
  const [borderRadius, setBorderRadius] = useState(10);

  // Announcement Bar
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(false);
  const [announcementBarText, setAnnouncementBarText] = useState("Welcome to my shop!");

  // Gift Product
  const [showGiftProduct, setShowGiftProduct] = useState(false);
  const [giftWrapProduct, setGiftWrapProduct] = useState("");

  // Checkout
  const [showCheckoutField, setShowCheckoutField] = useState(false);
  const [checkoutIntegrationCode, setCheckoutIntegrationCode] = useState("");

  // Custom CSS
  const [customCssCode, setCustomCssCode] = useState("");

  // Load settings on mount
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
          const data = json.data;
          setShowCountdown(data.show_countdown ?? false);
          setCountdownBg(data.count_down_bg || "#5B9BD5");
          setCountdownTextColor(data.countdown_text_color || "#ffffff");
          setCountdownChipBg(data.countdown_chip_bg || "#ffffff");
          setCountdownChipText(data.countdown_chip_text || "#2c3e50");
          setCountdownBorderRadius(data.countdown_border_radius ?? 50);
          setCountdownChipRadius(data.countdown_chip_radius ?? 10);
          setUpsellCollection(data.upsell_collection || "");
          setPrimaryColor(data.primary_color || "#7c3444");
          setBodyColor(data.body_color || "#f0e5e7");
          setTextColor(data.text_color || "#000");
          setBorderRadius(data.border_radius ?? 10);
          setShowAnnouncementBar(data.show_announcementbar_text ?? false);
          setAnnouncementBarText(data.announcementbar_text || "Welcome to my shop!");
          setShowGiftProduct(data.show_gift_product ?? false);
          setGiftWrapProduct(data.gift_wrap_product || "");
          setShowCheckoutField(data.show_checkout_field ?? false);
          setCheckoutIntegrationCode(data.checkout_integration_code || "");
          setCustomCssCode(data.custom_css_code || "");
        }
      } catch (e) {
        console.error("Failed to load cart drawer settings:", e);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [shop]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shop,
          Accept: "application/json",
        },
        body: JSON.stringify({
          show_countdown: showCountdown,
          count_down_bg: countdownBg,
          countdown_text_color: countdownTextColor,
          countdown_chip_bg: countdownChipBg,
          countdown_chip_text: countdownChipText,
          countdown_border_radius: countdownBorderRadius,
          countdown_chip_radius: countdownChipRadius,
          upsell_collection: upsellCollection,
          primary_color: primaryColor,
          body_color: bodyColor,
          text_color: textColor,
          border_radius: borderRadius,
          show_announcementbar_text: showAnnouncementBar,
          announcementbar_text: announcementBarText,
          show_gift_product: showGiftProduct,
          gift_wrap_product: giftWrapProduct,
          show_checkout_field: showCheckoutField,
          checkout_integration_code: checkoutIntegrationCode,
          custom_css_code: customCssCode,
        }),
      });
      const json = await res.json();
      if (json?.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(json?.error || "Failed to save settings");
      }
    } catch (e) {
      console.error("Failed to save settings:", e);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const collectionOptions = [
    { label: "Select a collection", value: "" },
    ...collections.map((col) => ({
      label: col.title,
      value: col.handle,
    })),
  ];

  const tabs = [
    { id: "countdown", content: "Countdown/Timer" },
    { id: "upsell", content: "Upsell" },
    { id: "colors", content: "Colors & Styling" },
    { id: "announcement", content: "Announcement Bar" },
    { id: "gift", content: "Gift Product" },
    { id: "checkout", content: "Checkout" },
    { id: "custom", content: "Custom CSS" },
  ];

  if (isLoading) {
    return (
      <Page>
        <TitleBar title="Cart Drawer Settings" />
        <Layout>
          <Layout.Section>
            <LegacyCard>
              <BlockStack gap="400">
                <p>Loading settings...</p>
              </BlockStack>
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar title="Cart Drawer Settings" />
      <ToastContainer />
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <BlockStack gap="500">
              <Tabs tabs={tabs} selected={activeTab} onSelect={setActiveTab}>
                {/* Countdown Tab */}
                {activeTab === 0 && (
                  <BlockStack gap="400">
                    <Checkbox
                      label="Show Countdown Timer"
                      checked={showCountdown}
                      onChange={setShowCountdown}
                    />
                    <ColorPicker
                      label="Countdown Background"
                      color={countdownBg}
                      onChange={setCountdownBg}
                    />
                    <ColorPicker
                      label="Countdown Text Color"
                      color={countdownTextColor}
                      onChange={setCountdownTextColor}
                    />
                    <ColorPicker
                      label="Countdown Chip Background"
                      color={countdownChipBg}
                      onChange={setCountdownChipBg}
                    />
                    <ColorPicker
                      label="Countdown Chip Text"
                      color={countdownChipText}
                      onChange={setCountdownChipText}
                    />
                    <RangeSlider
                      label="Countdown Border Radius"
                      value={countdownBorderRadius}
                      onChange={setCountdownBorderRadius}
                      min={0}
                      max={50}
                      suffix="px"
                    />
                    <RangeSlider
                      label="Countdown Chip Radius"
                      value={countdownChipRadius}
                      onChange={setCountdownChipRadius}
                      min={0}
                      max={20}
                      suffix="px"
                    />
                  </BlockStack>
                )}

                {/* Upsell Tab */}
                {activeTab === 1 && (
                  <BlockStack gap="400">
                    <Select
                      label="Upsell Collection"
                      options={collectionOptions}
                      value={upsellCollection}
                      onChange={setUpsellCollection}
                    />
                  </BlockStack>
                )}

                {/* Colors Tab */}
                {activeTab === 2 && (
                  <BlockStack gap="400">
                    <ColorPicker
                      label="Button Background / Primary Color"
                      color={primaryColor}
                      onChange={setPrimaryColor}
                    />
                    <ColorPicker
                      label="Body Background Color"
                      color={bodyColor}
                      onChange={setBodyColor}
                    />
                    <ColorPicker
                      label="Text Color"
                      color={textColor}
                      onChange={setTextColor}
                    />
                    <RangeSlider
                      label="Border Radius"
                      value={borderRadius}
                      onChange={setBorderRadius}
                      min={1}
                      max={100}
                      suffix="px"
                    />
                  </BlockStack>
                )}

                {/* Announcement Bar Tab */}
                {activeTab === 3 && (
                  <BlockStack gap="400">
                    <Checkbox
                      label="Show Announcement Bar"
                      checked={showAnnouncementBar}
                      onChange={setShowAnnouncementBar}
                    />
                    <TextField
                      label="Announcement Text"
                      value={announcementBarText}
                      onChange={setAnnouncementBarText}
                      multiline={3}
                      helpText="Separate multiple announcements with commas"
                    />
                  </BlockStack>
                )}

                {/* Gift Product Tab */}
                {activeTab === 4 && (
                  <BlockStack gap="400">
                    <Checkbox
                      label="Show Gift Product"
                      checked={showGiftProduct}
                      onChange={setShowGiftProduct}
                    />
                    <TextField
                      label="Gift Product Handle"
                      value={giftWrapProduct}
                      onChange={setGiftWrapProduct}
                      helpText="Enter the product handle (e.g., 'gift-wrap')"
                    />
                  </BlockStack>
                )}

                {/* Checkout Tab */}
                {activeTab === 5 && (
                  <BlockStack gap="400">
                    <Checkbox
                      label="Enable Third-party Integration"
                      checked={showCheckoutField}
                      onChange={setShowCheckoutField}
                    />
                    <TextField
                      label="Third-Party Integration Code"
                      value={checkoutIntegrationCode}
                      onChange={setCheckoutIntegrationCode}
                      multiline={5}
                      helpText="Paste your third-party checkout integration code here"
                    />
                  </BlockStack>
                )}

                {/* Custom CSS Tab */}
                {activeTab === 6 && (
                  <BlockStack gap="400">
                    <TextField
                      label="Custom CSS"
                      value={customCssCode}
                      onChange={setCustomCssCode}
                      multiline={10}
                      helpText="Add custom CSS to style the cart drawer"
                    />
                  </BlockStack>
                )}
              </Tabs>

              <InlineStack align="end">
                <Button
                  primary
                  loading={isSaving}
                  onClick={handleSave}
                >
                  Save Settings
                </Button>
              </InlineStack>
            </BlockStack>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

