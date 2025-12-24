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

import React, { useState, useEffect, useMemo } from "react";
import { Page, Layout, Button, Banner, Select, TextField, LegacyCard, BlockStack, ResourceList, ResourceItem, Text, Thumbnail } from "@shopify/polaris";
import antdResetHref from "antd/dist/reset.css?url";
import { ColorPicker, Checkbox, InputNumber, Input, AutoComplete } from "antd";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assests/style.css"; 

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
    collections = result?.data?.collections?.edges?.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
    })) || [];
  } catch (error) {
    console.error("Error fetching collections:", error);
  }

  // Return data to component (accessible via useLoaderData hook)
  return json({ shop: session.shop, collections });
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
  const { admin } = await authenticate.admin(request);
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
  // The * wildcards allow partial matching
  const searchQuery = `title:*${queryText}*`;

  try {
    const response = await admin.graphql(gqlQuery, { variables: { query: searchQuery } });
    const result = await response.json();
    // Transform GraphQL response to simple array format
    const products = result?.data?.products?.edges?.map((edge) => edge.node) || [];
    return json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ products: [] });
  }
};

function Settings() {
  const { shop, collections } = useLoaderData();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fetcher = useFetcher();

  // Collection state
  const [collectionEnable, setCollectionEnable] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState({
    title: "",
    handle: ""
  });
 
  // Product state
  const [productEnable, setProductEnable] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState({
    handle: ""
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
      console.log("Selected Collection:", JSON.stringify(collectionData, null, 2));
    } else {
      setSelectedCollection({ title: "", handle: "" });
      console.log("Collection deselected");
    }
  };

  // Handle product search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (productSearch.trim()) {
        fetcher.submit({ query: productSearch }, { method: "post" });
      }
    }, 600);
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
    useState("#5B9BD5");
  const [countdownTextColor, setCountdownTextColor] = useState("#ffffff");
  const [countdownChipBackgroundColor, setCountdownChipBackgroundColor] =
    useState("#ffffff");
  const [countdownChipTextColor, setCountdownChipTextColor] = useState("#2c3e50");
  const [countdownBorderRadius, setCountdownBorderRadius] = useState(50);
  const [countdownEnable, setCountdownEnable] = useState(false);


  // cart drawer settings
  const [bodyBackgroundColor, setBodyBackgroundColor] = useState("#f0e5e7");
  const [textColor, setTextColor] = useState("#000");
  const [borderRadius, setBorderRadius] = useState(10);


  // Announcement bar settings
  const [announcementBarEnable, setannouncementBarEnable] = useState(false);
  const [anouncmentbartTextarea, setanouncmentbartTextarea] = useState('Free shipping order above 999, Get 10% Off order above 1999')

  // Third-party integration settings
  const [thirdPartyIntegrationEnable, setThirdPartyIntegrationEnable] = useState(false);
  const [thirdPartyHtmlContent, setThirdPartyHtmlContent] = useState('');

 
  const handleAnnouncementBar = (e) => {
    setannouncementBarEnable(e.target.checked)
  }
  const handleAnnouncementBarTextarea = (e) =>{
    setanouncmentbartTextarea(e.target.value)
  }

  const handleThirdPartyIntegration = (e) => {
    setThirdPartyIntegrationEnable(e.target.checked)
  }
  const handleThirdPartyHtmlContent = (e) => {
    setThirdPartyHtmlContent(e.target.value)
  }

  const handleCollectionEnable = (e) => {
    setCollectionEnable(e.target.checked)
  }

  const handleProductEnable = (e) => {
    setProductEnable(e.target.checked)
  }


  // Handle cart drawer color change
  const handlebodyBackgroundColor = (color) => {
    setBodyBackgroundColor(color.hex);
  };
  const handleTextColor = (color) => {
    setTextColor(color.hex);
  };
  const handleBorderRadius = (value) => {
    setBorderRadius(value || 0);
  };



  // Handle countdown color change
  const handlecountdownBackgroundColor = (color) => {
    setCountdownBackgroundColor(color.hex);
  };
  const handlecountdownTextColor = (color) => {
    setCountdownTextColor(color.hex);
  };
  const handlecountdownChipBackgroundColor = (color) => {
    setCountdownChipBackgroundColor(color.hex);
  };
  const handlecountdownChipTextColor = (color) => {
    setCountdownChipTextColor(color.hex);
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
          setCountdownEnable(countdown.show_countdown ?? data.show_countdown ?? false);
          setCountdownBackgroundColor(countdown.count_down_bg || data.count_down_bg || "#5B9BD5");
          setCountdownTextColor(countdown.countdown_text_color || data.countdown_text_color || "#ffffff");
          setCountdownChipBackgroundColor(countdown.countdown_chip_bg || data.countdown_chip_bg || "#ffffff");
          setCountdownChipTextColor(countdown.countdown_chip_text || data.countdown_chip_text || "#2c3e50");
          setCountdownBorderRadius(countdown.countdown_border_radius || data.countdown_border_radius || 50);
          
          // Cart Drawer settings
          const cartDrawer = data.cartDrawer || {};
          setBodyBackgroundColor(cartDrawer.body_color || data.body_color || "#f0e5e7");
          setTextColor(cartDrawer.text_color || data.text_color || "#000");
          setBorderRadius(cartDrawer.border_radius || data.border_radius || 10);
          
          // Announcement Bar settings
          const announcementBar = data.announcementBar || {};
          setannouncementBarEnable(announcementBar.enabled ?? false);
          setanouncmentbartTextarea(announcementBar.content || "Free shipping order above 999, Get 10% Off order above 1999");
          
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
          setThirdPartyIntegrationEnable(thirdPartyIntegration.enabled ?? false);
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
      bodyBackgroundColor,
      textColor,
      borderRadius,
      selectedCollection,
      selectedProduct,
      collectionEnable,
      productEnable,
      announcementBarEnable,
      anouncmentbartTextarea,
      thirdPartyIntegrationEnable,
      thirdPartyHtmlContent

    }),
    [
      countdownBackgroundColor,
      countdownTextColor,
      countdownChipBackgroundColor,
      countdownChipTextColor,
      countdownBorderRadius,
      countdownEnable,
      bodyBackgroundColor,
      textColor,
      borderRadius,
      selectedCollection,
      selectedProduct,
      collectionEnable,
      productEnable,
      announcementBarEnable,
      anouncmentbartTextarea,
      thirdPartyIntegrationEnable,
      thirdPartyHtmlContent
    ]
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
      body_color: bodyBackgroundColor,
      text_color: textColor,
      border_radius: borderRadius,
      
      // Announcement Bar settings - send as nested object
      announcementBar: {
        enabled: announcementBarEnable,
        content: anouncmentbartTextarea,
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
          "X-Shopify-Shop-Domain": shop,      // Required: identifies which shop's settings to save
          Accept: "application/json",         // Required: tells server we want JSON response
        },
        body: JSON.stringify(allData), // Convert JavaScript object to JSON string
      });
      
      // Step 3: Parse response and handle result
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
      toast.error("Failed to save settings");
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

  return (
    <Page fullWidth>
      <ToastContainer position="top-right" autoClose={3000} />
      <Layout>


        <Layout.Section>

          <div style={{ marginBottom: "20px", marginRight: "0", textAlign: "right", width: "100%" }}>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
            >
              Save Settings
            </Button>
          </div>
          <h4 style={{ marginBottom: "15px", marginRight: "0", textAlign: "left", width: "100%", fontSize: "1.2rem", fontWeight: "bold", textTransform: "capitalize" }}>Countdown Settings</h4>
          <div className="grid-container">

            <div className="grid-item">
              <div className="column-title">Enable CountDown/Timmer</div>
              <div className="color-picker-container">
                <Checkbox checked={countdownEnable} onChange={handleCountdown}>
                  {" "}
                  Enable CountDown
                </Checkbox>
              </div>
            </div>

            <div className="grid-item">
              <div className="column-title">Border Radius (px)</div>
              <div className="color-picker-container">
                <InputNumber
                  value={countdownBorderRadius}
                  onChange={handlecountdownBorderRadius}
                  min={0}
                  max={50}
                />
              </div>
            </div>
            <div className="grid-item">
              <div className="column-title">Update Backround Color</div>
              <div className="color-picker-container">
                <ColorPicker
                  value={countdownBackgroundColor}
                  onChange={handlecountdownBackgroundColor}
                  size="large"
                  showText
                />
              </div>
            </div>
            <div className="grid-item">
              <div className="column-title">Update Text Color</div>
              <div className="color-picker-container">
                <ColorPicker
                  value={countdownTextColor}
                  onChange={handlecountdownTextColor}
                  size="large"
                  showText
                />
              </div>
            </div>
            <div className="grid-item">
              <div className="column-title">Update Chip Background Color</div>
              <div className="color-picker-container">
                <ColorPicker
                  value={countdownChipBackgroundColor}
                  onChange={handlecountdownChipBackgroundColor}
                  size="large"
                  showText
                />
              </div>
            </div>
            <div className="grid-item">
              <div className="column-title">Update Chip Text Color</div>
              <div className="color-picker-container">
                <ColorPicker
                  value={countdownChipTextColor}
                  onChange={handlecountdownChipTextColor}
                  size="large"
                  showText
                />
              </div>
            </div>
          </div>

        </Layout.Section>

        <Layout.Section>
          <h4 style={{ marginBottom: "15px", marginRight: "0", textAlign: "left", width: "100%", fontSize: "1.2rem", fontWeight: "bold", marginTop: "40px", textTransform: "capitalize" }}>Cart Drawer Settings</h4>

          <div className="grid-container">
            <div className="grid-item">
              <div className="column-title">Update Body Background Color</div>
              <div className="color-picker-container">
                <ColorPicker
                  value={bodyBackgroundColor}
                  onChange={handlebodyBackgroundColor}
                  size="large"
                  showText
                />
              </div>
            </div>
            <div className="grid-item">
              <div className="column-title">Update Text Color</div>
              <div className="color-picker-container">
                <ColorPicker
                  value={textColor}
                  onChange={handleTextColor}
                  size="large"
                  showText
                />
              </div>
            </div>
            <div className="grid-item">
              <div className="column-title">Update Border Radius</div>
              <div className="color-picker-container">
                <InputNumber
                  value={borderRadius}
                  onChange={handleBorderRadius}
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </div>

        </Layout.Section>

        <Layout.Section>
          <h4 style={{ marginBottom: "15px", marginRight: "0", textAlign: "left", width: "100%", fontSize: "1.2rem", fontWeight: "bold", marginTop: "40px", textTransform: "capitalize" }}>Announcement Bar Settings</h4>

          <div className="grid-container">
            <div className="grid-item">
              <div className="column-title">Enable Announcement Bar</div>
              <div className="color-picker-container">
                <Checkbox checked={announcementBarEnable} onChange={handleAnnouncementBar}>
                  {" "}
                  Enable Announcement Bar
                </Checkbox>
              </div>
            </div>
            <div className="grid-item" style={{gridColumnStart:2, gridColumnEnd:3, width:'100%'}}>
              <div className="column-title">Announcement Bar Content</div>
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
          </div>
        </Layout.Section>

        <Layout.Section>
          <h4 style={{ marginBottom: "15px", marginRight: "0", textAlign: "left", width: "100%", fontSize: "1.2rem", fontWeight: "bold", marginTop: "40px", textTransform: "capitalize" }}>Collection Selection</h4>

          <div className="grid-container">
            <div className="grid-item">
              <div className="column-title">Enable Collection</div>
              <div className="color-picker-container">
                <Checkbox checked={collectionEnable} onChange={handleCollectionEnable}>
                  {" "}
                  Enable Collection
                </Checkbox>
              </div>
            </div>
            <div className="grid-item" style={{gridColumnStart:1, gridColumnEnd:4, width:'100%'}}>
              <div className="column-title">Select Collection</div>
              <div className="custom-collection">
                <Select
                  label=""
                  options={collectionOptions}
                  value={collections.find((col) => col.handle === selectedCollection.handle)?.id || ""}
                  onChange={handleCollectionChange}
                  disabled={!collectionEnable}
                />
                {selectedCollection.handle && (
                  <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                    <Text as="p" variant="bodyMd">
                      <strong>Selected Collection:</strong> {selectedCollection.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      <strong>Handle:</strong> {selectedCollection.handle}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <h4 style={{ marginBottom: "15px", marginRight: "0", textAlign: "left", width: "100%", fontSize: "1.2rem", fontWeight: "bold", marginTop: "40px", textTransform: "capitalize" }}>Product Selection</h4>

          <div className="grid-container">
            <div className="grid-item">
              <div className="column-title">Enable Product</div>
              <div className="color-picker-container">
                <Checkbox checked={productEnable} onChange={handleProductEnable}>
                  {" "}
                  Enable Product
                </Checkbox>
              </div>
            </div>
            <div className="grid-item" style={{gridColumnStart:1, gridColumnEnd:3, width:'100%'}}>
              <div className="column-title">Search & Select Product</div>
              <div className="custom-product-search">
                <TextField
                  label=""
                  value={productSearch}
                  onChange={setProductSearch}
                  placeholder="Search for products..."
                  autoComplete="off"
                  disabled={!productEnable}
                />
                {productLoading && (
                  <div style={{ marginTop: "10px" }}>
                    <Text as="p" variant="bodySm" tone="subdued">Searching...</Text>
                  </div>
                )}
                {products.length > 0 && !productLoading && productEnable && (
                  <div style={{ marginTop: "10px", maxHeight: "300px", overflowY: "auto", border: "1px solid #e1e3e5", borderRadius: "4px" }}>
                    <ResourceList
                      resourceName={{ singular: "product", plural: "products" }}
                      items={products}
                      renderItem={(item) => {
                        const { id, title, handle, featuredImage, priceRange } = item;
                        const price = priceRange?.minVariantPrice?.amount || "0";
                        const currency = priceRange?.minVariantPrice?.currencyCode || "";
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
                            onClick={() => handleProductSelect(item)}
                            accessibilityLabel={`Select ${title}`}
                          >
                            <Text as="h3" variant="bodyMd" fontWeight="bold">
                              {title}
                            </Text>
                            <div>
                              <Text as="p" variant="bodySm" tone="subdued">
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
                  <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                    <Text as="p" variant="bodyMd">
                      <strong>Selected Product:</strong> {selectedProduct.title || "N/A"}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      <strong>Handle:</strong> {selectedProduct.handle}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <h4 style={{ marginBottom: "15px", marginRight: "0", textAlign: "left", width: "100%", fontSize: "1.2rem", fontWeight: "bold", marginTop: "40px", textTransform: "capitalize" }}>Third-Party Integration</h4>

          <div className="grid-container">
            <div className="grid-item">
              <div className="column-title">Enable Third-Party Integration</div>
              <div className="color-picker-container">
                <Checkbox checked={thirdPartyIntegrationEnable} onChange={handleThirdPartyIntegration}>
                  {" "}
                  Enable Third-Party Integration
                </Checkbox>
              </div>
            </div>
            <div className="grid-item" style={{gridColumnStart:1, gridColumnEnd:3, width:'100%'}}>
              <div className="column-title">HTML Content</div>
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
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default Settings;
