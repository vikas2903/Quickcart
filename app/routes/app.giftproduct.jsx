import React, { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Grid,
  LegacyCard,
  BlockStack,
  Checkbox,
  TextField,
  Spinner,
  ResourceList,
  ResourceItem,
  Text,
  Thumbnail,
  Button,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

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

  const response = await admin.graphql(gqlQuery, { variables: { query: queryText } });
  const result = await response.json();
  const products = result?.data?.products?.edges?.map((edge) => edge.node) || [];
  return json({ products });
};

export default function GiftProductPage() {
  const { shop } = useLoaderData();
  const fetcher = useFetcher();
  const { t } = useTranslation();

  const [enabled, setEnabled] = useState(false);
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingSavedData, setLoadingSavedData] = useState(true);

  const [savedata, setsavedata] = useState({
    enabled: false,
    price: "",
    product_title: ""
  });

  const apiurl = "/app/api/giftproduct";

  useEffect(() => {
    async function loadSavedData() {
      try {
        setLoadingSavedData(true);
        const response = await fetch("/app/api/giftproduct", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Shop-Domain": shop,
            Accept: "application/json",
          },
        });

        const result = await response.json();
        const savedData = result?.data;

        if (savedData) {
          setEnabled(savedData.enabled || false);
          setPrice(savedData.price ? String(savedData.price) : "");

          if (savedData.selectedProduct) {
            setSelectedProduct({
              id: savedData.selectedProduct.id,
              title: savedData.selectedProduct.title,
              handle: savedData.selectedProduct.handle,
              price: savedData.selectedProduct.price,
              image: savedData.selectedProduct.featuredImageUrl || "",
            });
          }

          setsavedata({
            enabled: savedData.enabled || false,
            price: savedData.price || "",
            product_title: savedData.selectedProduct?.title || ""
          });
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      } finally {
        setLoadingSavedData(false);
      }
    }

    loadSavedData();
  }, [shop]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search.trim()) {
        fetcher.submit({ query: search }, { method: "post" });
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [search]);

  const products = fetcher.data?.products || [];
  const loading = fetcher.state === "submitting";

  const handleSelect = (product) => {
    const productData = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      price: product.priceRange?.minVariantPrice?.amount || "0",
      image: product.featuredImage?.url || "",
    };
    setSelectedProduct(productData);
  };

  const handleSubmit = async () => {
    const payload = {
      enabled,
      price,
      selectedProduct,
      shop,
    };

    try {
      const res = await fetch(apiurl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (!res.ok || !out?.ok) {
        throw new Error(out?.error || "Failed to save Gift Product settings");
      }

      const reloadResponse = await fetch("/app/api/giftproduct", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shop,
          Accept: "application/json",
        },
      });
      const reloadResult = await reloadResponse.json();
      const reloadedData = reloadResult?.data;

      if (reloadedData) {
        setsavedata({
          enabled: reloadedData.enabled || false,
          price: reloadedData.price || "",
          product_title: reloadedData.selectedProduct?.title || ""
        });
      }

      toast.success(t("giftproductPage.save-success"));
    } catch (error) {
      toast.error(`${t("giftproductPage.save-error-prefix")} ${error.message}`);
    }
  };

  return (
    <>
      <Page>
        <TitleBar title={t("giftproductPage.page-title")} />
        <Layout fullWidth>
          <Layout.Section>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 7, sm: 7, md: 7, lg: 7, xl: 7 }}>
                <LegacyCard sectioned>
                  <BlockStack gap="500">
                    <Checkbox
                      label={t("giftproductPage.enable-label")}
                      checked={enabled}
                      onChange={(newChecked) => setEnabled(newChecked)}
                    />

                    <TextField
                      label={t("giftproductPage.minimum-price-label")}
                      value={price}
                      onChange={setPrice}
                      type="number"
                      placeholder={t("giftproductPage.minimum-price-placeholder")}
                      autoComplete="off"
                    />
                    <Banner tone="info">
                      <p>
                        <strong>{t("giftproductPage.important-title")}</strong>{t("giftproductPage.price-info")}
                      </p>
                    </Banner>

                    <TextField
                      label={t("giftproductPage.search-label")}
                      value={search}
                      onChange={setSearch}
                      placeholder={t("giftproductPage.search-placeholder")}
                      autoComplete="off"
                    />

                    {loading && <Spinner accessibilityLabel={t("giftproductPage.loading-products")} size="large" />}

                    {!loading && products.length > 0 && (
                      <div style={{ maxHeight: 250, overflowY: "auto" }}>
                        <ResourceList
                          resourceName={{ singular: "product", plural: "products" }}
                          items={products}
                          renderItem={(item) => (
                            <ResourceItem
                              id={item.id}
                              onClick={() => handleSelect(item)}
                              media={
                                <Thumbnail
                                  source={item.featuredImage?.url || ""}
                                  alt={item.title}
                                />
                              }
                            >
                              <Text variant="bodyMd" fontWeight="semibold">
                                {item.title}
                              </Text>
                              <Text variant="bodySm" color="subdued">
                                {item.handle} - Rs.{item.priceRange?.minVariantPrice?.amount / 100}
                              </Text>
                            </ResourceItem>
                          )}
                        />
                      </div>
                    )}

                    {!loading && search && products.length === 0 && (
                      <Text>{t("giftproductPage.no-products-found")}</Text>
                    )}
                    {selectedProduct && (
                      <LegacyCard title={t("giftproductPage.selected-product-card-title")} sectioned>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <img
                            src={selectedProduct.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw_HeSzHfBorKS4muw4IIeVvvRgnhyO8Gn8w&s"}
                            alt={selectedProduct.title}
                            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px", objectPosition: "top" }}
                          />
                          <div>
                            <p><b>{t("giftproductPage.product-title-label")}</b> {selectedProduct.title}</p>
                            <p><b>{t("giftproductPage.product-price-label")}</b> {selectedProduct.price}</p>
                          </div>
                        </div>
                      </LegacyCard>
                    )}

                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                    >
                      {t("giftproductPage.save-button")}
                    </Button>
                  </BlockStack>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 5, md: 5, lg: 5, xl: 5, sm: 5 }}>
                <LegacyCard fullWidth>
                  <LegacyCard.Section>
                    <Banner tone="info">{t("giftproductPage.saved-config-banner")}</Banner>

                    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
                      <h2>{t("giftproductPage.data-title")}</h2>

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
                            <th align="left">{t("giftproductPage.shop-name")}</th>
                            <td>{shop}</td>
                          </tr>
                          <tr>
                            <th align="left">{t("giftproductPage.enabled")}</th>
                            <td>{savedata.enabled ? t("giftproductPage.yes") : t("giftproductPage.no")}</td>
                          </tr>

                          {savedata.enabled ? (
                            <>
                              <tr>
                                <th align="left">{t("giftproductPage.set-price-row")}</th>
                                <td>{savedata?.price}</td>
                              </tr>
                              <tr>
                                <th align="left">{t("giftproductPage.product-title-row")}</th>
                                <td>{savedata?.product_title}</td>
                              </tr>
                            </>
                          ) : (
                            ""
                          )}
                        </tbody>
                      </table>
                    </div>
                  </LegacyCard.Section>

                  <Banner tone="info">
                    <p>
                      <strong>{t("giftproductPage.important-title")}</strong> {t("giftproductPage.zero-price-info")}
                    </p>
                  </Banner>
                  <Banner tone="info">
                    <p>
                      <strong>{t("giftproductPage.important-title")}</strong> {t("giftproductPage.select-product-info")}
                    </p>
                  </Banner>
                </LegacyCard>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        </Layout>
      </Page>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}
