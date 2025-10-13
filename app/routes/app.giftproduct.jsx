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


// ---------------------------------------------
// 1️⃣ Loader: authenticate + provide shop info
// ---------------------------------------------
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

// ---------------------------------------------
// 2️⃣ Action: handle product search via GraphQL
// ---------------------------------------------
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

// ---------------------------------------------
// 3️⃣ React Component: Gift Product Page
// ---------------------------------------------
export default function GiftProductPage() {
  const { shop } = useLoaderData();
  const fetcher = useFetcher();

  const [enabled, setEnabled] = useState(true);
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [savedata, setsavedata] = useState({
    enabled: '',
    price:'',
    product_title:''
  })

  console.log("savedata", savedata  )

  const apiurl = `/app/api/giftproduct`;

   const saveddata_progressbar  = async () =>{
  
      const retrive_saved_data = await  fetch(`https://quickcart-68ln.onrender.com/app/api/giftproduct`,
    {
      method:"GET",
      headers:{
        "Content-Type": "application/json",
        "X-Shopify-Shop-Domain": shop,
        Accept: "application/json",
      },
    })
      const getapidata = await retrive_saved_data.json();
      const getted_data = getapidata?.data
      console.log("getted_data", getted_data);
      return getted_data;
    
    }

  // 🧠 Debounced search trigger
  useEffect(() => {

    async function  fetchFUnction () {
      let data = await   saveddata_progressbar()
      let p1 = data?.enabled;
      let p2 = data?.price;
      let p3= data?.selectedProduct?.title
      setsavedata({p1,p2,p3})

    }
    fetchFUnction();
    saveddata_progressbar()
    const timeout = setTimeout(() => {
      if (search.trim()) {
        fetcher.submit({ query: search }, { method: "post" });
      }
    }, 600);
    return () => clearTimeout(timeout);

  
  }, [search, submitted]);

  const products = fetcher.data?.products || [];
  const loading = fetcher.state === "submitting";

  // 🧾 When product clicked
  const handleSelect =  (product) => {
    const productData = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      price: product.priceRange?.minVariantPrice?.amount || "0",
    };
    setSelectedProduct(productData);
  };

  // ✅ Submit handler
  const handleSubmit =  async() => {
    // if (!selectedProduct || !price) {
    //   alert("Please select a product and enter price.");
    //   return;
    // }

    const payload = {
      enabled,
      price,
      selectedProduct,
      shop,
    };

    console.log("Form Submitted ✅", payload);
    setSubmitted(true);


      try{
        const res = await fetch(apiurl, {
            method: "POST",
            header:{"Content-Type":"application/json"},
            body:JSON.stringify(payload),
        });
        const out = await res.json();
        if(!res.ok || !out?.ok){
            throw new Error(out?.error || 'Failed to save Gift Product settings');
        }
        console.log("Saved:", out.data);

    }catch(error){
        console.log("Error to send data to backend", error.message);
    }

    // TODO: You can now POST this payload to your API endpoint
    // fetch("/app/api/free-product", { method: "POST", body: JSON.stringify(payload) });
    toast.success(`🎁 Gift Product Changes Saved`);
  };

  return (
    <> 
    
  
    <Page>
      <TitleBar title="Gift Product Configuration" />
      <Layout fullWidth>
        <Layout.Section>
          <Grid>
            <Grid.Cell  columnSpan={{ xs: 7, sm: 7, md: 7, lg: 7, xl: 7 }}>
              <LegacyCard sectioned>
                <BlockStack gap="500">
                  <Checkbox
                    label="Enable Gift Product"
                    checked={enabled}
                    onChange={(newChecked) => setEnabled(newChecked)}
                  />

                  <TextField
                    label="Set Order Minimum Price to Enable Gift Product"
                    value={price}
                    onChange={setPrice}
                    type="number"
                    placeholder="Enter minimum order amount"
                    autoComplete="off"
                  />

                  <TextField
                    label="Search Product to Gift (by title)"
                    value={search}
                    onChange={setSearch}
                    placeholder="Type product name..."
                    autoComplete="off"
                  />

                  {loading && <Spinner accessibilityLabel="Loading products" size="large" />}

                  {!loading && products.length > 0 && (
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
                            {item.handle} — ₹{item.priceRange?.minVariantPrice?.amount / 100}
                          </Text>
                        </ResourceItem>
                      )}
                    />
                  )}

                  {!loading && search && products.length === 0 && (
                    <Text>No products found</Text>
                  )}

                  {selectedProduct && (
                    <LegacyCard title="Selected Product" sectioned>
                      <p><b>Title:</b> {selectedProduct.title}</p>
                      <p><b>Handle:</b> {selectedProduct.handle}</p>
                      <p><b>Price:</b> ₹{selectedProduct.price }</p>
                    </LegacyCard>
                  )} 

                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    // disabled={!price || !selectedProduct}
                  >
                    Save Gift Product Settings
                  </Button>

                  {submitted && (
                    <Banner
                      title="Gift Product Settings Saved!"
                      status="success"
                      onDismiss={() => setSubmitted(false)}
                    >
                      <p>
                        Enabled: <b>{enabled ? "Yes" : "No"}</b> <br />
                        Price Threshold: ₹{price} <br />
                        Product: <b>{selectedProduct?.title}</b>
                      </p>
                    </Banner>
                  )}
                </BlockStack>
              </LegacyCard>
            </Grid.Cell>

            <Grid.Cell columnSpan={{xs:5, md:5, lg:5, xl:5, sm:5}}>
              <LegacyCard fullWidth>
                <LegacyCard.Section>
                     <Banner tone="info">Gift Product Saved Configuration</Banner>


                                {
                            <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
              <h2>Progress Bar Data</h2>
        
              {/* General Info Table */}
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
                    <th align="left">Shop Name</th>
                    <td>{shop}</td>
                  </tr>
                  <tr>
                    <th align="left">Enabled</th>
                    <td>{savedata.p1 ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                  
                  {savedata.p1? <>
                  
                     <tr>
                    <th align="left">Set Price </th>
                    <td>{savedata?.p2}</td>
                  </tr>
                   <tr>
                    <th align="left">Product Title </th>
                     <td>{savedata?.p3}</td>
                  </tr>
                  </> : '' }
                

                </tbody>
              </table>
        
            </div>
                          }
                           
                </LegacyCard.Section>
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
