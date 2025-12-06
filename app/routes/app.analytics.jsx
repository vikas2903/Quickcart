import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Page, Layout, Grid, LegacyCard, BlockStack, Text, Box, Button, Banner } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";
import "./assests/style.css";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopName = session.shop;
  const accessToken = session.accessToken;

  // Get shop currency
  const API_VERSION = "2025-07";
  const shopRes = await fetch(`https://${shopName}/admin/api/${API_VERSION}/shop.json`, {
    method: "GET",
    headers: { 
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });
  
  const shopData = await shopRes.json();
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

  const currencySymbol = currencySymbolMap[currency] || currency;

  return json({ shop: shopName, currency, currencySymbol });
};

export default function Analytics() {
  const { shop, currency, currencySymbol } = useLoaderData();
  const fetcher = useFetcher();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/app/api/analytics?days=${days}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatCurrency = (num) => {
    if (typeof num !== 'number') return `${currencySymbol}0.00`;
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (num) => {
    if (typeof num !== 'number') return '0.00%';
    return num.toFixed(2) + '%';
  };

  if (loading) {
    return (
      <Page>
        <TitleBar title="Analytics" />
        <BlockStack gap="500">
          <Text as="p">Loading analytics data...</Text>
        </BlockStack>
      </Page>
    );
  }

  if (!analytics || !analytics.totals) {
    return (
      <Page>
        <TitleBar title="Analytics" />
        <BlockStack gap="500">
          <Banner tone="info">
            <p>No analytics data available yet. Analytics will appear here once customers start using your cart drawer.</p>
          </Banner>
        </BlockStack>
      </Page>
    );
  }

  const { totals, metrics, productStats, dailyStats } = analytics;

  return (
    <Page>
      <TitleBar title="Cart Drawer Analytics" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Box paddingBlockEnd="400">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text as="h2" variant="headingLg">Performance Overview</Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button onClick={() => setDays(7)} pressed={days === 7}>7 Days</Button>
                  <Button onClick={() => setDays(30)} pressed={days === 30}>30 Days</Button>
                  <Button onClick={() => setDays(90)} pressed={days === 90}>90 Days</Button>
                </div>
              </div>
            </Box>
          </Layout.Section>

          <Layout.Section>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                <LegacyCard sectioned>
                  <div className="order-analytics-wrapper">
                    <h5>{formatNumber(totals.cartOpens)}</h5>
                    <p>Cart Opens</p>
                  </div>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                <LegacyCard sectioned>
                  <div className="order-analytics-wrapper">
                    <h5>{formatNumber(totals.checkouts)}</h5>
                    <p>Checkouts</p>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {formatPercent(metrics.cartToCheckoutRate)} cart to checkout
                    </Text>
                  </div>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                <LegacyCard sectioned>
                  <div className="order-analytics-wrapper">
                    <h5>{formatNumber(totals.conversions)}</h5>
                    <p>Conversions</p>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {formatPercent(metrics.checkoutConversionRate)} conversion rate
                    </Text>
                  </div>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                <LegacyCard sectioned>
                  <div className="order-analytics-wrapper">
                    <h5>{formatCurrency(metrics.avgCartValue)}</h5>
                    <p>Avg Cart Value</p>
                  </div>
                </LegacyCard>
              </Grid.Cell>
            </Grid>
          </Layout.Section>

          <Layout.Section>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 6 }}>
                <LegacyCard sectioned title="Revenue Metrics">
                  <BlockStack gap="400">
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Total Revenue:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        {formatCurrency(totals.revenue)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Upsell Revenue:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold" tone="success">
                        {formatCurrency(totals.upsellRevenue)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Upsell Revenue %:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        {totals.revenue > 0 
                          ? formatPercent((totals.upsellRevenue / totals.revenue) * 100)
                          : '0%'}
                      </Text>
                    </div>
                  </BlockStack>
                </LegacyCard>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 6 }}>
                <LegacyCard sectioned title="Upsell Performance">
                  <BlockStack gap="400">
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Views:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        {formatNumber(totals.upsellViews)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Clicks:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        {formatNumber(totals.upsellClicks)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Adds to Cart:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold" tone="success">
                        {formatNumber(totals.upsellAdds)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Click Rate:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        {formatPercent(metrics.upsellClickRate)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Conversion Rate:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold" tone="success">
                        {formatPercent(metrics.upsellConversionRate)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text as="span">Overall Rate:</Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        {formatPercent(metrics.overallUpsellRate)}
                      </Text>
                    </div>
                  </BlockStack>
                </LegacyCard>
              </Grid.Cell>
            </Grid>
          </Layout.Section>

          <Layout.Section>
            <LegacyCard sectioned title="Top Performing Upsell Products">
              {productStats && productStats.length > 0 ? (
                <BlockStack gap="300">
                  {productStats.slice(0, 10).map((product, index) => {
                    const conversionRate = product.clicks > 0 
                      ? (product.adds / product.clicks * 100) 
                      : 0;
                    return (
                      <div 
                        key={product.productId || index}
                        style={{ 
                          padding: '12px', 
                          borderBottom: index < productStats.length - 1 ? '1px solid #e1e3e5' : 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            Product ID: {product.productId}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Views: {formatNumber(product.views)} | 
                            Clicks: {formatNumber(product.clicks)} | 
                            Adds: {formatNumber(product.adds)} | 
                            Revenue: {formatCurrency(product.revenue)}
                          </Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Text as="p" variant="headingSm" tone="success" fontWeight="bold">
                            {formatPercent(conversionRate)}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">conversion</Text>
                        </div>
                      </div>
                    );
                  })}
                </BlockStack>
              ) : (
                <Text as="p" tone="subdued">No upsell product data yet</Text>
              )}
            </LegacyCard>
          </Layout.Section>

          <Layout.Section>
            <LegacyCard sectioned title="Daily Trends">
              {dailyStats && dailyStats.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e1e3e5' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Cart Opens</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Checkouts</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Conversions</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Upsell Adds</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyStats.map((day, index) => (
                        <tr key={day.date || index} style={{ borderBottom: '1px solid #e1e3e5' }}>
                          <td style={{ padding: '12px' }}>{day.date}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{formatNumber(day.cartOpens || 0)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{formatNumber(day.checkouts || 0)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{formatNumber(day.conversions || 0)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{formatNumber(day.upsellAdds || 0)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(day.revenue || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Text as="p" tone="subdued">No daily data available</Text>
              )}
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

