/**
 * ============================================================================
 * SETTINGS PAGE COMPONENT
 * ============================================================================
 * This is the main settings page where users can configure app settings
 *
 * Features:
 * - Countdown/Timer settings (colors, border radius, enable/disable)
 * - Cart Drawer styling (background color, text color, border radius)
 * - Announcement Bar (enable/disable, content)
 * - Collection Selection (enable/disable, select collection)
 * - Product Selection (enable/disable, search and select product)
 * - Third-party Integration (enable/disable, HTML content)
 *
 * Data Flow:
 * 1. On page load: Fetches settings from database via GET /app/api/settings
 * 2. User makes changes: Updates local state variables
 * 3. User clicks Save: Sends all settings to database via POST /app/api/settings
 *
 * API Endpoint: /app/api/settings
 * Database: MongoDB (via Mongoose)
 * ============================================================================
 */

import image from "../routes/assests/cart_drawer_image.png";
import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Page,
  Layout,
  Button,
  Banner,
  Select,
  TextField,
  LegacyCard,
  BlockStack,
  ResourceList,
  ResourceItem,
  Text,
  Tabs,
  Thumbnail,
} from "@shopify/polaris";
import antdResetHref from "antd/dist/reset.css?url";
import { ColorPicker, Checkbox, InputNumber, Input, AutoComplete } from "antd";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assests/style.css";
import { TitleBar } from "@shopify/app-bridge-react";

export const links = () => [{ rel: "stylesheet", href: antdResetHref }];

const { TextArea } = Input;

// API endpoint URL for settings
const API_URL = "/app/api/settings";

/**
 * ============================================================================
 * LOADER FUNCTION
 * ============================================================================
 * This function runs on the server before the page renders
 * It fetches data needed for the settings page (collections list)
 *
 * Returns:
 * - shop: Current shop domain
 * - collections: List of all collections for the dropdown selector
 * ============================================================================
 */
export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);

  const getmetafieldsquery = `
    query {
      shop {
        metafields(first: 10, namespace: "custom") {
          edges {
            node {
              key
              value
            }
          }
        }
      }
    }
  `;

  const getmetafieldsresponse = await admin.graphql(getmetafieldsquery);
  const getmetafieldsjson = await getmetafieldsresponse.json();

  const shopMetafields =
    getmetafieldsjson?.data?.shop?.metafields?.edges?.map(
      (edge) => edge.node,
    ) || [];

  // Fetch collections for collection selection dropdown
  // This GraphQL query gets the first 50 collections from the shop
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
    // Transform GraphQL response to simple array format
    collections =
      result?.data?.collections?.edges?.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
      })) || [];
  } catch (error) {
    console.error("Error fetching collections:", error);
  }

  // Return data to component (accessible via useLoaderData hook)
  return json({ shop: session.shop, collections, shopMetafields });
};

/**
 * ============================================================================
 * ACTION FUNCTION - PRODUCT SEARCH
 * ============================================================================
 * This function handles product search requests
 * Called when user types in the product search field (via fetcher)
 *
 * Flow:
 * 1. Get search query from form data
 * 2. Query Shopify GraphQL API for products matching the search term
 * 3. Return list of matching products
 *
 * Note: This is separate from the settings save action
 * ============================================================================
 */

export const action = async ({ request }) => {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  let admin;
  try {
    const authResult = await authenticate.admin(request);
    admin = authResult.admin;
  } catch (err) {
    // Handle authentication errors gracefully
    console.error("Authentication error in product search:", err);
    return json({ products: [], error: "Authentication failed" });
  }

  const formData = await request.formData();
  const queryText = formData.get("query");

  // Return empty array if no search query
  if (!queryText) return json({ products: [] });

  // GraphQL query to search products by title
  const gqlQuery = `
    query getProductsByTitle($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  // Format query for Shopify search (title contains search text)
  // Try different search strategies
  let searchQuery = queryText;
  if (queryText.length > 2) {
    searchQuery = `title:*${queryText}* OR handle:*${queryText}*`;
  }

  try {
    const response = await admin.graphql(gqlQuery, {
      variables: { query: searchQuery },
    });
    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return json({ products: [] });
    }

    // Transform GraphQL response to simple array format
    const products =
      result?.data?.products?.edges?.map((edge) => edge.node) || [];
    return json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ products: [] });
  }
};

function Settings() {
  const { shop, collections, shopMetafields } = useLoaderData();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fetcher = useFetcher();

  // Collection state
  const [collectionEnable, setCollectionEnable] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState({
    title: "",
    handle: "",
  });

  const [shopMetafieldsusesatate, setShopMetafields] = useState({
    upsell_collection_handle: "",
    gift_product_handle: "",
  });

  useEffect(() => {
    console.log("shopMetafields", shopMetafieldsusesatate);
  }, [shopMetafieldsusesatate]);
  // Product state
  const [productEnable, setProductEnable] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState({
    handle: "",
  });

  // Collection dropdown options
  const collectionOptions = [
    { label: "Select a collection", value: "" },
    ...collections.map((col) => ({
      label: col.title,
      value: col.id,
      handle: col.handle,
    })),
  ];

  // Handle collection selection
  const handleCollectionChange = (value) => {
    const selected = collections.find((col) => col.id === value);
    if (selected) {
      const collectionData = {
        title: selected.title,
        handle: selected.handle,
      };
      setSelectedCollection(collectionData);
      console.log(
        "Selected Collection:",
        JSON.stringify(collectionData, null, 2),
      );
    } else {
      setSelectedCollection({ title: "", handle: "" });
      console.log("Collection deselected");
    }
  };

  // Handle product search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (productSearch.trim() && productSearch.length > 1) {
        fetcher.submit({ query: productSearch }, { method: "post" });
      }
    }, 300); // Reduced debounce time
    return () => clearTimeout(timeout);
  }, [productSearch]);

  const products = fetcher.data?.products || [];
  const productLoading = fetcher.state === "submitting";

  // Handle product selection
  const handleProductSelect = (product) => {
    const productData = {
      handle: product.handle,
      title: product.title,
      id: product.id,
    };
    setSelectedProduct(productData);
    setProductSearch(product.title);
    console.log("Selected Product:", JSON.stringify(productData, null, 2));
  };

  // countdown settings
  const [countdownBackgroundColor, setCountdownBackgroundColor] =
    useState("#5B9BD4");
  const [countdownTextColor, setCountdownTextColor] = useState("#ffffff");
  const [countdownChipBackgroundColor, setCountdownChipBackgroundColor] =
    useState("#ffffff");
  const [countdownChipTextColor, setCountdownChipTextColor] =
    useState("#2c3e50");
  const [countdownBorderRadius, setCountdownBorderRadius] = useState(50);
  const [countdownEnable, setCountdownEnable] = useState(false);

  // cart drawer settings
  // const [cartDrawerBackgroundColor, setcartDrawerBackgroundColor] = useState("#f0e5e7");
  const [cartDrawerBackgroundColor, setCartDrawerBackgroundColor] =
    useState("#f0e5e7");
  const [textColor, setTextColor] = useState("#000");
  const [borderRadius, setBorderRadius] = useState(10);

  // Announcement bar settings
  const [announcementBarEnable, setannouncementBarEnable] = useState(false);
  const [anouncmentbartTextarea, setanouncmentbartTextarea] = useState(
    "Free shipping order above 999, Get 10% Off order above 1999",
  );
  const [tabsbutton, settabsbutton] = useState(1);

  // Third-party integration settings
  const [thirdPartyIntegrationEnable, setThirdPartyIntegrationEnable] =
    useState(false);
  const [thirdPartyHtmlContent, setThirdPartyHtmlContent] = useState("");

  const [buttonColor, setButtonColor] = useState("#000000");
  const [buttonTextColor, setButtonTextColor] = useState("#000");
  const [buttonBorderRadius, setButtonBorderRadius] = useState(10); 

  const [announcementBarTextColor, setAnnouncementBarTextColor] =
    useState("#000");
  const [announcementBarBackgroundColor, setAnnouncementBarBackgroundColor] =
    useState("#f0e5e7");

  const handleAnnouncementBarTextColor = (color) => {
    setAnnouncementBarTextColor(color.toHexString());
  };
  const handleAnnouncementBarBackgroundColor = (color) => {
    setAnnouncementBarBackgroundColor(color.toHexString());
  };

  const handleButtonColor = (color) => {
    setButtonColor(color.toHexString());
  };
  const handleButtonTextColor = (color) => {
    setButtonTextColor(color.toHexString());
  };
  const handleButtonBorderRadius = (value) => {
    setButtonBorderRadius(value || 0);
  };

  const handleAnnouncementBar = (e) => {
    setannouncementBarEnable(e.target.checked);
  };
  const handleAnnouncementBarTextarea = (e) => {
    setanouncmentbartTextarea(e.target.value);
  };

  const handleThirdPartyIntegration = (e) => {
    setThirdPartyIntegrationEnable(e.target.checked);
  };
  const handleThirdPartyHtmlContent = (e) => {
    setThirdPartyHtmlContent(e.target.value);
  };

  const handleCollectionEnable = (e) => {
    setCollectionEnable(e.target.checked);
  };

  const handleProductEnable = (e) => {
    setProductEnable(e.target.checked);
  };

  const handlecartDrawerBackgroundColoronchnage = (color) => {
    setCartDrawerBackgroundColor(color.toHexString());
  };
  const handleTextColor = (color) => {
    setTextColor(color.toHexString());
  };
  const handleBorderRadius = (value) => {
    setBorderRadius(value || 0);
  };

  // Handle countdown color change
  const handlecountdownBackgroundColor = (color) => {
    setCountdownBackgroundColor(color.toHexString());
  };
  const handlecountdownTextColor = (color) => {
    setCountdownTextColor(color.toHexString());
  };
  const handlecountdownChipBackgroundColor = (color) => {
    setCountdownChipBackgroundColor(color.toHexString());
  };
  const handlecountdownChipTextColor = (color) => {
    setCountdownChipTextColor(color.toHexString());
  };
  const handlecountdownBorderRadius = (value) => {
    setCountdownBorderRadius(value || 0);
  };

  const handleCountdown = (e) => {
    setCountdownEnable(e.target.checked);
  };

  /**
   * ============================================================================
   * LOAD SETTINGS FROM DATABASE
   * ============================================================================
   * This function fetches all settings from the API when the component mounts
   *
   * Flow:
   * 1. Make GET request to /app/api/settings
   * 2. Parse response JSON
   * 3. Update all state variables with loaded data
   * 4. Handle errors gracefully
   *
   * This runs once when component mounts (useEffect with [shop] dependency)
   * ============================================================================
   */
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // Step 1: Make GET request to API endpoint
        const res = await fetch(API_URL, {
          headers: {
            "X-Shopify-Shop-Domain": shop, // Required: identifies which shop's settings to fetch
          },
        });

        // Step 2: Parse response JSON
        const json = await res.json();

        if (json?.ok && json?.data) {
          const data = json.data;

          // Step 3: Update all state variables with loaded data
          // Countdown settings - check both flat and nested structure
          const countdown = data.countdown || {};
          setCountdownEnable(
            countdown.show_countdown ?? data.show_countdown ?? false,
          );
          setCountdownBackgroundColor(
            countdown.count_down_bg || data.count_down_bg || "#5B9BD5",
          );
          setCountdownTextColor(
            countdown.countdown_text_color ||
              data.countdown_text_color ||
              "#ffffff",
          );
          setCountdownChipBackgroundColor(
            countdown.countdown_chip_bg || data.countdown_chip_bg || "#ffffff",
          );
          setCountdownChipTextColor(
            countdown.countdown_chip_text ||
              data.countdown_chip_text ||
              "#2c3e50",
          );
          setCountdownBorderRadius(
            countdown.countdown_border_radius ||
              data.countdown_border_radius ||
              50,
          );

          // Cart Drawer settings
          const cartDrawer = data.cartDrawer || {};
          setCartDrawerBackgroundColor(
            cartDrawer.body_color || data.body_color || "#f0e5e7",
          );
          setTextColor(cartDrawer.text_color || data.text_color || "#000");
          setBorderRadius(cartDrawer.border_radius || data.border_radius || 10);

          // Button settings (within cartDrawer)
          setButtonColor(
            cartDrawer.button_color || data.button_color || "#f0e5e7",
          );
          setButtonTextColor(
            cartDrawer.button_text_color || data.button_text_color || "#000",
          );
          setButtonBorderRadius(
            cartDrawer.button_border_radius || data.button_border_radius || 10,
          );

          // Announcement Bar settings
          const announcementBar = data.announcementBar || {};
          setannouncementBarEnable(announcementBar.enabled ?? false);
          setanouncmentbartTextarea(
            announcementBar.content ||
              "Free shipping order above 999, Get 10% Off order above 1999",
          );
          // Announcement Bar colors
          setAnnouncementBarBackgroundColor(
            announcementBar.background_color ||
              data.announcementBar?.background_color ||
              "#f0e5e7",
          );
          setAnnouncementBarTextColor(
            announcementBar.text_color ||
              data.announcementBar?.text_color ||
              "#000",
          );

          // Collection settings
          const collection = data.collection || {};
          setCollectionEnable(collection.enabled ?? false);
          if (collection.selectedCollection) {
            setSelectedCollection(collection.selectedCollection);
          }

          // Product settings
          const product = data.product || {};
          setProductEnable(product.enabled ?? false);
          if (product.selectedProduct) {
            setSelectedProduct(product.selectedProduct);
            setProductSearch(product.selectedProduct.title || "");
          }

          // Third-party Integration settings
          const thirdPartyIntegration = data.thirdPartyIntegration || {};
          setThirdPartyIntegrationEnable(
            thirdPartyIntegration.enabled ?? false,
          );
          setThirdPartyHtmlContent(thirdPartyIntegration.htmlContent || "");
        }
      } catch (error) {
        // Step 4: Handle errors gracefully
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [shop]);

  // Memoize settings data
  const settings_data = useMemo(
    () => ({
      countdownBackgroundColor,
      countdownTextColor,
      countdownChipBackgroundColor,
      countdownChipTextColor,
      countdownBorderRadius,
      countdownEnable,
      cartDrawerBackgroundColor,
      textColor,
      borderRadius,
      selectedCollection,
      selectedProduct,
      collectionEnable,
      productEnable,
      announcementBarEnable,
      anouncmentbartTextarea,
      thirdPartyIntegrationEnable,
      thirdPartyHtmlContent,
      buttonColor,
      buttonTextColor,
      buttonBorderRadius,
      announcementBarTextColor,
      announcementBarBackgroundColor,
    }),
    [
      countdownBackgroundColor,
      countdownTextColor,
      countdownChipBackgroundColor,
      countdownChipTextColor,
      countdownBorderRadius,
      countdownEnable,
      cartDrawerBackgroundColor,
      textColor,
      borderRadius,
      selectedCollection,
      selectedProduct,
      collectionEnable,
      productEnable,
      announcementBarEnable,
      anouncmentbartTextarea,
      thirdPartyIntegrationEnable,
      thirdPartyHtmlContent,
      buttonColor,
      buttonTextColor,
      buttonBorderRadius,
      announcementBarTextColor,
      announcementBarBackgroundColor,
    ],
  );

  /**
   * ============================================================================
   * SAVE SETTINGS TO DATABASE
   * ============================================================================
   * This function saves all settings to the database via API
   *
   * Flow:
   * 1. Prepare all settings data from state variables
   * 2. Make POST request to /app/api/settings with JSON body
   * 3. Handle response and show success/error message
   * 4. Reset saving state
   *
   * This is called when user clicks "Save Settings" button
   * ============================================================================
   */
  const handleSave = async () => {
    setIsSaving(true);

    // Step 1: Prepare all data from state variables
    // Organize data in the structure expected by the API

    const allData = {
      // Countdown settings - send as flat structure for backward compatibility
      show_countdown: countdownEnable,
      count_down_bg: countdownBackgroundColor,
      countdown_text_color: countdownTextColor,
      countdown_chip_bg: countdownChipBackgroundColor,
      countdown_chip_text: countdownChipTextColor,
      countdown_border_radius: countdownBorderRadius,

      // Cart Drawer settings - send as flat structure
      body_color: cartDrawerBackgroundColor,
      text_color: textColor,
      border_radius: borderRadius,
      button_color: buttonColor,
      button_text_color: buttonTextColor,
      button_border_radius: buttonBorderRadius,

      // Announcement Bar settings - send as nested object
      announcementBar: {
        enabled: announcementBarEnable,
        content: anouncmentbartTextarea,
        background_color: announcementBarBackgroundColor,
        text_color: announcementBarTextColor,
      },

      // Collection settings - send as nested object
      collection: {
        enabled: collectionEnable,
        selectedCollection: selectedCollection,
      },

      // Product settings - send as nested object
      product: {
        enabled: productEnable,
        selectedProduct: selectedProduct,
      },

      // Third-party Integration settings - send as nested object
      thirdPartyIntegration: {
        enabled: thirdPartyIntegrationEnable,
        htmlContent: thirdPartyHtmlContent,
      },
    };

    // Log all data for debugging (remove in production if needed)
    console.log("Saving Settings Data:", JSON.stringify(allData, null, 2));

    try {
      // Step 2: Make POST request to API endpoint
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Required: tells server we're sending JSON
          "X-Shopify-Shop-Domain": shop, // Required: identifies which shop's settings to save
          Accept: "application/json", // Required: tells server we want JSON response
        },
        body: JSON.stringify(allData), // Convert JavaScript object to JSON string
      });

      // Step 3: Check if response is OK and is JSON
      if (!res.ok) {
        // If response is not OK, try to get error message
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorJson = await res.json();
          throw new Error(
            errorJson?.error || `HTTP ${res.status}: ${res.statusText}`,
          );
        } else {
          // Response is HTML (error page), get text for debugging
          const text = await res.text();
          console.error("Non-JSON error response:", text.substring(0, 200));
          throw new Error(
            `HTTP ${res.status}: ${res.statusText}. Server returned HTML instead of JSON.`,
          );
        }
      }

      // Check if response is actually JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response received:", text.substring(0, 200));
        throw new Error(
          "Server returned non-JSON response. Please check the API endpoint.",
        );
      }

      // Step 4: Parse response and handle result
      const json = await res.json();
      if (json?.ok) {
        toast.success("Settings saved successfully!");
        console.log("Settings saved to database:", json.data);
      } else {
        toast.error(json?.error || "Failed to save settings");
        console.error("Save error:", json?.error);
      }
    } catch (e) {
      // Handle network errors or other exceptions
      console.error("Failed to save settings:", e);
      const errorMessage =
        e instanceof Error ? e.message : "Failed to save settings";
      toast.error(errorMessage);
    } finally {
      // Step 4: Reset saving state (always runs, even if error occurs)
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Page fullWidth>
        <Layout>
          <Layout.Section>
            <Banner tone="info">Loading settings...</Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const InfoBanner = ({ text }) => {
    return (
      <Banner tone="info" style={{ marginTop: "10px !important" }}>
        {" "}
        {text}
      </Banner>
    );
  };

  return (
    <Page fullWidth>
      <TitleBar title="Cart Drawer Settings" />
      <ToastContainer position="top-right" autoClose={3000} />
      <Layout>

        <Grid>
        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }} gap="small">
          
        <Layout.Section>
          <Grid>
            <Grid.Cell
              columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
              gap="small"
            >
              <Button
                primary
                onClick={() => settabsbutton(1)}
                variant={tabsbutton === 1 ? "primary" : "secondary"}
                style={{ marginRight: "5px" }}
              >
                {" "}
                Cart Settings{" "}
              </Button>
              <Button
                primary
                onClick={() => settabsbutton(0)}
                variant={tabsbutton === 0 ? "primary" : "secondary"}
                style={{ marginRight: "5px" }}
              >
                {" "}
                CountDown Block{" "}
              </Button>
              <Button
                primary
                onClick={() => settabsbutton(2)}
                variant={tabsbutton === 2 ? "primary" : "secondary"}
                style={{ marginRight: "5px" }}
              >
                {" "}
                Select Upsell Collection {" "}
              </Button>
              <Button
                primary
                onClick={() => settabsbutton(3)}
                variant={tabsbutton === 3 ? "primary" : "secondary"}
                style={{ marginRight: "5px" }}
              >
                {" "}
                Select One Recommended Product{" "}
              </Button>
              <Button
                primary
                variant={tabsbutton === 4 ? "primary" : "secondary"}
                onClick={() => settabsbutton(4)}
              >
                {" "}
                Third Party  Chekout Integration{" "}
              </Button>
              <Button
                primary
                style={{ marginRight: "5px", marginTop: "5px" }}
                variant={tabsbutton === 5 ? "primary" : "secondary"}
                onClick={() => settabsbutton(5)}
              >
                {" "}
                Announcementbar Crousel
              </Button>
            </Grid.Cell>
          </Grid>
        </Layout.Section>

        {tabsbutton === 0 && (
          <Layout.Section>
            <Grid>
              <Grid.Cell
                columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                gap="small"
              >
                <BlockStack gap="200">
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Enable CountDown</div>
                      {
                        <InfoBanner text="Enable Countdown Block in Cart Drawer" />
                      }
                      <div className="color-picker-container">
                        <Checkbox
                          checked={countdownEnable}
                          onChange={handleCountdown}
                        >
                          {" "}
                          Enable
                        </Checkbox>
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Border Radius</div>
                      {<InfoBanner text="Border Radius for CountDown Block" />}
                      <div className="color-picker-container">
                        <InputNumber
                          value={countdownBorderRadius}
                          onChange={handlecountdownBorderRadius}
                          min={0}
                          max={50}
                        />
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Background Color</div>
                      {
                        <InfoBanner text="Background Color for CountDown Block" />
                      }
                      <div className="color-picker-container">
                        <ColorPicker
                          value={countdownBackgroundColor}
                          onChange={(color) =>
                            setCountdownBackgroundColor(color.toHexString())
                          }
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Text Color</div>
                      <div className="color-picker-container">
                        <ColorPicker
                          value={countdownTextColor}
                          onChange={handlecountdownTextColor}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">
                        CountDown Block Background Color
                      </div>
                      {
                        <InfoBanner text="Background Color for CountDown Timer Blocks" />
                      }
                      <div className="color-picker-container">
                        <ColorPicker
                          value={countdownChipBackgroundColor}
                          onChange={handlecountdownChipBackgroundColor}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">
                        CountDown Block Text Color
                      </div>
                      {
                        <InfoBanner text="Text Color for CountDown Timer Blocks" />
                      }
                      <div className="color-picker-container">
                        <ColorPicker
                          value={countdownChipTextColor}
                          onChange={handlecountdownChipTextColor}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        )}
        {tabsbutton === 1 && (
          <Layout.Section>
            <Grid>
              <Grid.Cell
                columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                gap="small"
              >
                <BlockStack gap="200">
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Background Color</div>
                      {
                        <InfoBanner text="Background Color for Cart Drawer Body" />
                      }
                      <div className="color-picker-container">
                        <ColorPicker
                          value={cartDrawerBackgroundColor}
                          onChange={handlecartDrawerBackgroundColoronchnage}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title"> Text Color</div>
                      {<InfoBanner text="Text Color for Cart Drawer Body" />}
                      <div className="color-picker-container">
                        <ColorPicker
                          value={textColor}
                          onChange={handleTextColor}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Border Radius</div>
                      {
                        <InfoBanner text="Border Radius for Cart Drawer Body Button and Checkout Button" />
                      }
                      <div className="color-picker-container">
                        <InputNumber
                          value={borderRadius}
                          onChange={handleBorderRadius}
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Button Text Color</div>
                      {
                        <InfoBanner text="Text Color for Cart Drawer Buttons and Checkout Button" />
                      }
                      <div className="color-picker-container">
                        <ColorPicker
                          value={buttonTextColor}
                          onChange={handleButtonTextColor}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">
                        Button Background Color
                      </div>
                      {
                        <InfoBanner text="Background Color for Cart Drawer Buttons and Checkout Button" />
                      }
                      <div className="color-picker-container">
                        <ColorPicker
                          value={buttonColor}
                          onChange={handleButtonColor}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Border Radius</div>
                      {
                        <InfoBanner text="Border Radius for Cart Drawer Buttons and Checkout Button" />
                      }
                      <div className="color-picker-container">
                        <InputNumber
                          value={buttonBorderRadius}
                          onChange={handleButtonBorderRadius}
                          min={0}
                          max={50}
                        />
                      </div>
                    </div>
                  </LegacyCard>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        )}

        {tabsbutton === 5 && (
          <Layout.Section>
            <Grid>
              <Grid.Cell
                columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                gap="small"
              >
                <BlockStack gap="200">
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">
                        Enable Announcement Bar
                      </div>
                      {
                        <InfoBanner text="Enable Announcement Bar Block in Cart Drawer" />
                      }
                      <div className="color-picker-container">
                        <Checkbox
                          checked={announcementBarEnable}
                          onChange={handleAnnouncementBar}
                        >
                          {" "}
                          Enable Announcement Bar
                        </Checkbox>
                      </div>
                    </div>
                  </LegacyCard>
                  <LegacyCard sectioned>
                    <div
                      className="grid-item"
                      style={{
                        gridColumnStart: 2,
                        gridColumnEnd: 4,
                        width: "100%",
                      }}
                    >
                      <div className="column-title">
                        Announcement Bar Content
                      </div>
                      {
                        <InfoBanner text="Update Announcement Bar ContentBy Comma(,)Separated Values (Example: Free shipping order above 999, Get 10% Off order above 1999)" />
                      }

                      <div className="custom-antd-textarea">
                        <TextArea
                          placeholder="Enter your message"
                          rows={4}
                          value={anouncmentbartTextarea}
                          onChange={handleAnnouncementBarTextarea}
                          className=""
                        />
                      </div>
                    </div>
                  </LegacyCard>
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">text color</div>
                      {<InfoBanner text="Text Color for Announcement Bar" />}
                      <div className="color-picker-container">
                        <ColorPicker
                          value={announcementBarTextColor}
                          onChange={handleAnnouncementBarTextColor}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Background color</div>
                      {
                        <InfoBanner text="Background Color for Announcement Bar" />
                      }
                      <div className="color-picker-container">
                        <ColorPicker
                          value={announcementBarBackgroundColor}
                          onChange={handleAnnouncementBarBackgroundColor}
                          size="large"
                          showText
                        />
                      </div>
                    </div>
                  </LegacyCard>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        )}
        {tabsbutton === 2 && (
          <Layout.Section>
            <Grid>
              <Grid.Cell
                columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                gap="small"
              >
                <BlockStack gap="200">
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Enable Collection</div>
                      {
                        <InfoBanner text="Enable  Block Upsell Products in Cart Drawer" />
                      }
                      <div className="color-picker-container">
                        <Checkbox
                          checked={collectionEnable}
                          onChange={handleCollectionEnable}
                        >
                          {" "}
                          Enable Collection
                        </Checkbox>
                      </div>
                    </div>
                  </LegacyCard>
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Select Collection</div>
                      {
                        <InfoBanner text="Select Collection for Upsell Products in Cart Drawer" />
                      }
                      <div className="custom-collection">
                        <Select
                          label=""
                          options={collectionOptions}
                          value={
                            collections.find(
                              (col) => col.handle === selectedCollection.handle,
                            )?.id || ""
                          }
                          onChange={handleCollectionChange}
                          disabled={!collectionEnable}
                        />
                        {selectedCollection.handle && (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "10px",
                              backgroundColor: "#f5f5f5",
                              borderRadius: "4px",
                            }}
                          >
                            <Text as="p" variant="bodyMd">
                              <strong>Selected Collection:</strong>{" "}
                              {selectedCollection.title}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              <strong>Handle:</strong>{" "}
                              {selectedCollection.handle}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </LegacyCard>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        )}

        {tabsbutton === 3 && (
          <Layout.Section>
            <Grid>
              <Grid.Cell
                columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                gap="small"
              >
                <BlockStack gap="200">
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">Enable Product</div>
                      {
                        <InfoBanner text="Enable Block Free Gift Product in Cart Drawer (Important: Product should be in the cart to show the free gift product)" />
                      }

                      <div className="color-picker-container">
                        <Checkbox
                          checked={productEnable}
                          onChange={handleProductEnable}
                        >
                          {" "}
                          Enable Product
                        </Checkbox>
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">
                        Search & Select Product
                      </div>
                      {
                        <InfoBanner text="Search and Select Product for Free Gift Product in Cart Drawer (IMPORTANT : The free gift will appear in the cart drawer only after the selected product is added to the cart. The gift price is automatically taken from the product price set in Shopify.)" />
                      }

                      <div className="custom-product-search">
                        <TextField
                          label=""
                          value={productSearch}
                          onChange={setProductSearch}
                          placeholder="Search for products..."
                          autoComplete="off"
                        />
                        {productLoading && (
                          <div style={{ marginTop: "10px" }}>
                            <Text as="p" variant="bodySm" tone="subdued">
                              Searching...
                            </Text>
                          </div>
                        )}
                        {products.length > 0 && !productLoading && (
                          <div
                            style={{
                              marginTop: "10px",
                              maxHeight: "300px",
                              overflowY: "auto",
                              border: "1px solid #e1e3e5",
                              borderRadius: "4px",
                            }}
                          >
                            {!productEnable && (
                              <div
                                style={{
                                  padding: "10px",
                                  backgroundColor: "#fff3cd",
                                  borderBottom: "1px solid #e1e3e5",
                                }}
                              >
                                <Text as="p" variant="bodySm" tone="warning">
                                  Enable product selection above to select
                                  products
                                </Text>
                              </div>
                            )}
                            <ResourceList
                              resourceName={{
                                singular: "product",
                                plural: "products",
                              }}
                              items={products}
                              renderItem={(item) => {
                                const {
                                  id,
                                  title,
                                  handle,
                                  featuredImage,
                                  priceRange,
                                } = item;
                                const price =
                                  priceRange?.minVariantPrice?.amount || "0";
                                const currency =
                                  priceRange?.minVariantPrice?.currencyCode ||
                                  "";
                                return (
                                  <ResourceItem
                                    id={id}
                                    media={
                                      <Thumbnail
                                        source={featuredImage?.url || ""}
                                        alt={title}
                                        size="small"
                                      />
                                    }
                                    onClick={() =>
                                      productEnable && handleProductSelect(item)
                                    }
                                    accessibilityLabel={`Select ${title}`}
                                  >
                                    <Text
                                      as="h3"
                                      variant="bodyMd"
                                      fontWeight="bold"
                                    >
                                      {title}
                                    </Text>
                                    <div>
                                      <Text
                                        as="p"
                                        variant="bodySm"
                                        tone="subdued"
                                      >
                                        Handle: {handle}
                                      </Text>
                                      <Text as="p" variant="bodySm">
                                        Price: {price} {currency}
                                      </Text>
                                    </div>
                                  </ResourceItem>
                                );
                              }}
                            />
                          </div>
                        )}
                        {selectedProduct.handle && (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "10px",
                              backgroundColor: "#f5f5f5",
                              borderRadius: "4px",
                            }}
                          >
                            <Text as="p" variant="bodyMd">
                              <strong>Selected Product:</strong>{" "}
                              {selectedProduct.title || "N/A"}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              <strong>Handle:</strong> {selectedProduct.handle}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </LegacyCard>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        )}

        {tabsbutton === 4 && (
          <Layout.Section>
            <Grid>
              <Grid.Cell
                columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                gap="small"
              >
                <BlockStack gap="200">
                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">
                        Enable Third-Party Integration
                      </div>
                      {
                        <InfoBanner text="Enable Third-Party Integration in Cart Drawer" />
                      }
                      <div className="color-picker-container">
                        <Checkbox
                          checked={thirdPartyIntegrationEnable}
                          onChange={handleThirdPartyIntegration}
                        >
                          {" "}
                          Enable Third-Party Integration
                        </Checkbox>
                      </div>
                    </div>
                  </LegacyCard>

                  <LegacyCard sectioned>
                    <div className="grid-item">
                      <div className="column-title">
                        Third-Party Integration Code Snippet
                      </div>
                      {
                        <InfoBanner text="Paste your third-party checkout integration code here" />
                      }
                      <div className="custom-antd-textarea">
                        <TextArea
                          placeholder="Enter your HTML code here..."
                          rows={8}
                          value={thirdPartyHtmlContent}
                          onChange={handleThirdPartyHtmlContent}
                          className=""
                        />
                      </div>
                    </div>
                  </LegacyCard>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        )}

        <Layout.Section fullWidth>
          <Grid>
            <Grid.Cell
              columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
              gap="small"
            >
              <Button
                style={{
                  backgroundColor: "#0755d2ff",
                  color: "#ffffff",
                  fontWeight: "bold",
                  display: "block",
              
                  width: "100%",
                }}
                primary
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
                tone="submit"
                type="submit"
                width="full"
                variant="primary"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </Grid.Cell>
          </Grid>
        </Layout.Section>

        </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }} gap="small">

         
            <BlockStack gap="200" style={{ marginTop: "20px" }}>
              <LegacyCard sectioned>
              
             <img src={image} alt="Countdown" style={{ width: "100%", height: "auto", display: "block" }} />
         
              </LegacyCard>
            </BlockStack>
          
          </Grid.Cell>
        </Grid>

      </Layout>
    </Page>
  );
}

export default Settings;
