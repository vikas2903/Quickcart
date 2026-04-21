import { useEffect, useMemo, useState } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Page,
  Layout,
  LegacyCard,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Checkbox,
  Grid,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

const DEFAULT_STEPS = [
  { qty: 1, label: "10% OFF" },
  { qty: 2, label: "15% OFF" },
  { qty: 3, label: "20% OFF" },
];

const API_URL = "/app/quickcart/quantitytrieddiscount";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function QuantityTriedDiscountPage() {
  const { shop } = useLoaderData();

  const [enabled, setEnabled] = useState(false);
  const [color, setColor] = useState("#000000");
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [savedData, setSavedData] = useState(null);
  const [loadingSavedData, setLoadingSavedData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [previewQty, setPreviewQty] = useState("1");

  useEffect(() => {
    async function loadSavedData() {
      try {
        setLoadingSavedData(true);
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Shop-Domain": shop,
            Accept: "application/json",
          },
        });

        const result = await response.json();
        const data = result?.data;

        if (response.ok && data) {
          const loadedSteps = Array.isArray(data.steps) && data.steps.length
            ? data.steps.map((step) => ({
                qty: Number(step.qty) || 1,
                label: String(step.label || ""),
              }))
            : DEFAULT_STEPS;

          setEnabled(!!data.enabled);
          setColor(data.color || "#000000");
          setSteps(loadedSteps);
          setSavedData({
            enabled: !!data.enabled,
            color: data.color || "#000000",
            steps: loadedSteps,
          });
        } else {
          setSavedData(null);
        }
      } catch (error) {
        console.error("Failed to load quantity tier discount:", error);
      } finally {
        setLoadingSavedData(false);
      }
    }

    if (shop) {
      loadSavedData();
    }
  }, [shop]);

  const updateStep = (index, field, value) => {
    setSteps((current) =>
      current.map((step, currentIndex) =>
        currentIndex === index ? { ...step, [field]: value } : step,
      ),
    );
  };

  const normalizedSteps = useMemo(
    () =>
      steps
        .map((step) => ({
          qty: Math.max(1, Number(step.qty) || 1),
          label: String(step.label || "").trim(),
        }))
        .filter((step) => step.label),
    [steps],
  );

  const previewQtyNumber = Math.max(0, Number(previewQty) || 0);
  const maxQty = normalizedSteps.length
    ? Math.max(...normalizedSteps.map((step) => step.qty))
    : 0;
  const fillPercent = maxQty
    ? Math.min(100, Math.round((previewQtyNumber / maxQty) * 100))
    : 0;
  const nextStep = normalizedSteps.find((step) => previewQtyNumber < step.qty) || null;

  const previewMessage = !enabled
    ? "Quantity tier discount is disabled."
    : nextStep
      ? `Add ${nextStep.qty - previewQtyNumber} item${nextStep.qty - previewQtyNumber === 1 ? "" : "s"} to unlock ${nextStep.label}.`
      : "Maximum discount unlocked!";

  const handleSave = async () => {
    const payload = {
      enabled,
      color,
      steps: normalizedSteps,
    };

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shop,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Failed to save quantity tier discount");
      }

      const latest = result.data || payload;
      setSavedData(latest);
      setStatus({
        tone: "success",
        message: "Quantity tier discount saved successfully.",
      });
    } catch (error) {
      setStatus({
        tone: "critical",
        message: error?.message || "Failed to save quantity tier discount.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page fullWidth>
      <TitleBar title="Quantity Based ProgressBar" />
      <Layout>
        <Layout.Section fullWidth>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
              <Layout.Section fullWidth>
                <LegacyCard sectioned>
                  <BlockStack gap="400">
                    {status ? <Banner tone={status.tone}>{status.message}</Banner> : null}

                    <Checkbox
                      label="Enable quantity tier discount"
                      checked={enabled}
                      onChange={setEnabled}
                    />

                    <InlineStack gap="300" align="start" wrap>
                      <div style={{ width: "120px" }}>
                        <Text as="p" variant="bodyMd">
                          Color Picker
                        </Text>
                        <input
                          type="color"
                          value={color}
                          onChange={(event) => setColor(event.target.value)}
                          style={{
                            width: "100%",
                            height: "40px",
                            border: "1px solid #c9cccf",
                            borderRadius: "8px",
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: "220px" }}>
                        <TextField
                          label="Primary Color"
                          type="text"
                          autoComplete="off"
                          value={color}
                          onChange={setColor}
                          helpText="Example: #000000"
                        />
                      </div>
                    </InlineStack>

                    <Banner tone="info">
                      Configure up to 3 quantity-based discount milestones for the cart drawer progress bar.
                    </Banner>

                    <BlockStack gap="400">
                      {steps.map((step, index) => (
                        <LegacyCard key={index} sectioned>
                          <BlockStack gap="300">
                            <Text as="h3" variant="headingSm">
                              Tier {index + 1}
                            </Text>

                            <InlineStack gap="300" align="start" wrap>
                              <div style={{ flex: 1, minWidth: "100px", maxWidth: "100px" }}>
                                <TextField
                                  label="Qty"
                                  type="number"
                                  autoComplete="off"
                                  value={String(step.qty)}
                                  onChange={(value) => updateStep(index, "qty", value)}
                                />
                              </div>
                              <div style={{ flex: 1, minWidth: "220px" }}>
                                <TextField
                                  label="Label"
                                  autoComplete="off"
                                  value={step.label}
                                  onChange={(value) => updateStep(index, "label", value)}
                                />
                              </div>
                            </InlineStack>
                          </BlockStack>
                        </LegacyCard>
                      ))}
                    </BlockStack>

                    <InlineStack gap="300">
                      <Button variant="primary" onClick={handleSave} loading={isSubmitting}>
                        Save
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </LegacyCard>
              </Layout.Section>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
              <Layout.Section fullWidth>
                <LegacyCard sectioned>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Preview
                    </Text>

                    <TextField
                      label="Preview cart quantity"
                      type="number"
                      autoComplete="off"
                      value={previewQty}
                      onChange={setPreviewQty}
                    />

                    <div
                      style={{
                        border: "1px solid #e1e3e5",
                        borderRadius: "12px",
                        padding: "16px",
                        background: "#fff",
                      }}
                    >
                      <BlockStack gap="300">
                        <Text as="p" variant="bodyMd">
                          {previewMessage}
                        </Text>

                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            background: "#e6e6e6",
                            borderRadius: "999px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${enabled ? fillPercent : 0}%`,
                              height: "100%",
                              background: color,
                              transition: "width 300ms ease",
                            }}
                          />
                        </div>

                        <InlineStack align="space-between" blockAlign="start" wrap>
                          {normalizedSteps.map((step, index) => {
                            const unlocked = previewQtyNumber >= step.qty;
                            const active = !unlocked && nextStep && nextStep.qty === step.qty;

                            return (
                              <div
                                key={index}
                                style={{
                                  flex: 1,
                                  minWidth: "90px",
                                  textAlign: "center",
                                  color: unlocked || active ? color : "#6d7175",
                                }}
                              >
                                <Text as="p" variant="bodyMd" fontWeight="semibold">
                                  {step.label}
                                </Text>
                                <Text as="p" variant="bodySm">
                                  Buy {step.qty}
                                </Text>
                              </div>
                            );
                          })}
                        </InlineStack>
                      </BlockStack>
                    </div>

                    {/* <Text as="h2" variant="headingMd">
                      Saved Data
                    </Text>

                    {loadingSavedData ? (
                      <InlineStack align="center">
                        <Spinner accessibilityLabel="Loading saved quantity tier settings" size="small" />
                      </InlineStack>
                    ) : savedData ? (
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd">
                          Shop: {shop}
                        </Text>
                        <Text as="p" variant="bodyMd">
                          Enabled: {savedData.enabled ? "Yes" : "No"}
                        </Text>
                        <Text as="p" variant="bodyMd">
                          Color: {savedData.color}
                        </Text>
                        {(savedData.steps || []).map((step, index) => (
                          <Text as="p" variant="bodyMd" key={index}>
                            Tier {index + 1}: Buy {step.qty} - {step.label}
                          </Text>
                        ))}
                      </BlockStack>
                    ) : (
                      <Text as="p" variant="bodyMd">
                        No quantity tier discount has been saved yet.
                      </Text>
                    )} */}

                    
                  </BlockStack>
                </LegacyCard>
              </Layout.Section>
            </Grid.Cell>
          </Grid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
