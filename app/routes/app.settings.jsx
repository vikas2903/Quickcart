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

// Action for product search
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const queryText = formData.get("query");

  if (!queryText) return json({ products: [] });

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
  const searchQuery = `title:*${queryText}*`;

  try {
    const response = await admin.graphql(gqlQuery, { variables: { query: searchQuery } });
    const result = await response.json();
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

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(API_URL, {
          headers: {
            "X-Shopify-Shop-Domain": shop,
          },
        });
        const json = await res.json();
        if (json?.ok && json?.data) {
          const data = json.data;
          setCountdownEnable(data.show_countdown ?? false);
          setCountdownBackgroundColor(data.count_down_bg || "#5B9BD5");
          setCountdownTextColor(data.countdown_text_color || "#ffffff");
          setCountdownChipBackgroundColor(data.countdown_chip_bg || "#ffffff");
          setCountdownChipTextColor(data.countdown_chip_text || "#2c3e50");
          setCountdownBorderRadius(data.countdown_border_radius || 50);
          setBodyBackgroundColor(data.body_color || "#f0e5e7");
          setTextColor(data.text_color || "#000");
          setBorderRadius(data.border_radius || 10);
        }
      } catch (error) {
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

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    
    // Prepare all data for logging
    const allData = {
      shop: shop,
      countdown: {
        show_countdown: countdownEnable,
        count_down_bg: countdownBackgroundColor,
        countdown_text_color: countdownTextColor,
        countdown_chip_bg: countdownChipBackgroundColor,
        countdown_chip_text: countdownChipTextColor,
        countdown_border_radius: countdownBorderRadius,
      },
      cartDrawer: {
        body_color: bodyBackgroundColor,
        text_color: textColor,
        border_radius: borderRadius,
      },
      announcementBar: {
        enabled: announcementBarEnable,
        content: anouncmentbartTextarea,
      },
      collection: {
        enabled: collectionEnable,
        selectedCollection: selectedCollection,
      },
      product: {
        enabled: productEnable,
        selectedProduct: selectedProduct,
      },
      thirdPartyIntegration: {
        enabled: thirdPartyIntegrationEnable,
        htmlContent: thirdPartyHtmlContent,
      },
    };
    
    // Log all data as JSON
    console.log("All Settings Data:", JSON.stringify(allData, null, 2));
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shop,
          Accept: "application/json",
        },
        body: JSON.stringify({
          show_countdown: countdownEnable,
          count_down_bg: countdownBackgroundColor,
          countdown_text_color: countdownTextColor,
          countdown_chip_bg: countdownChipBackgroundColor,
          countdown_chip_text: countdownChipTextColor,
          countdown_border_radius: countdownBorderRadius,
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
            <div className="grid-item" style={{gridColumnStart:2, gridColumnEnd:4, width:'100%'}}>
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
            <div className="grid-item" style={{gridColumnStart:1, gridColumnEnd:4, width:'100%'}}>
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
            <div className="grid-item" style={{gridColumnStart:1, gridColumnEnd:4, width:'100%'}}>
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
