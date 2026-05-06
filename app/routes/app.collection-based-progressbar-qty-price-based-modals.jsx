import React, { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { TitleBar } from "@shopify/app-bridge-react";
import { Form, Input, InputNumber, Button, Card, Select, Row, Col, Typography, Space, Checkbox, Alert } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { authenticate } from "../shopify.server.js";
import { useLoaderData } from "@remix-run/react";

const { Title, Text } = Typography;

const milestoneIndexes = [0, 1, 2];
const API_URL = "/app/api/collection-based-progressbar-qty-price-based";


export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function CollectionBasedProgressbarQtyPriceBasedModalsPage() {
  const { shop } = useLoaderData();
  const [form] = Form.useForm();
  const [styleContainer, setStyleContainer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setStyleContainer(document.head || document.body || null);
  }, []);

  const initialValues = {
    progressbarEnabled: false,
    collectionTag: "test-collection-vs",
    mode: "quantity",
    priceMilestones: [
      { value: 2000, text: "Free Gift product Order Above @ Rs.2000" },
      { value: 5000, text: "Exclusive Discount Order Above @ Rs.5000" },
      { value: 10000, text: "VIP Support Order Above @ Rs.10000" },
    ],
    quantityMilestones: [
      { value: 2, text: "Free Gift product Order Above @ 2-items" },
      { value: 5, text: "Exclusive Discount Order Above @ 5-items" },
      { value: 10, text: "Get 20% off @10-items" },
    ],
  };

  const watchedMode = Form.useWatch("mode", form) || initialValues.mode;
  const watchedPriceMilestones = Form.useWatch("priceMilestones", form) || initialValues.priceMilestones;
  const watchedQuantityMilestones = Form.useWatch("quantityMilestones", form) || initialValues.quantityMilestones;

  const priceTierCount = useMemo(
    () =>
      milestoneIndexes.filter((index) => {
        const milestone = watchedPriceMilestones?.[index];
        return String(milestone?.text || "").trim() !== "" && milestone?.value !== undefined && milestone?.value !== null && String(milestone.value).trim() !== "";
      }).length,
    [watchedPriceMilestones],
  );

  const quantityTierCount = useMemo(
    () =>
      milestoneIndexes.filter((index) => {
        const milestone = watchedQuantityMilestones?.[index];
        return String(milestone?.text || "").trim() !== "" && milestone?.value !== undefined && milestone?.value !== null && String(milestone.value).trim() !== "";
      }).length,
    [watchedQuantityMilestones],
  );

  const hasTierGap = (milestones) =>
    milestoneIndexes.some((index) => {
      if (index === 0) return false;
      const current = milestones?.[index];
      const previous = milestones?.[index - 1];
      const isCurrentFilled =
        String(current?.text || "").trim() !== "" &&
        current?.value !== undefined &&
        current?.value !== null &&
        String(current.value).trim() !== "";
      const isPreviousFilled =
        String(previous?.text || "").trim() !== "" &&
        previous?.value !== undefined &&
        previous?.value !== null &&
        String(previous.value).trim() !== "";

      return isCurrentFilled && !isPreviousFilled;
    });

  const hasPriceTierGap = hasTierGap(watchedPriceMilestones);
  const hasQuantityTierGap = hasTierGap(watchedQuantityMilestones);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "X-Shopify-Shop-Domain": shop,
            Accept: "application/json",
          },
        });

        const result = await response.json();
        const data = result?.data;

        if (!response.ok || !data) {
          return;
        }

        form.setFieldsValue({
          progressbarEnabled: !!data.progressbarEnabled,
          collectionTag: data.collectionTag || initialValues.collectionTag,
          mode: data.mode || initialValues.mode,
          priceMilestones: milestoneIndexes.map((index) => ({
            value: data.milestones?.price?.[index]?.value ?? initialValues.priceMilestones[index].value,
            text: data.milestones?.price?.[index]?.text ?? "",
          })),
          quantityMilestones: milestoneIndexes.map((index) => ({
            value: data.milestones?.quantity?.[index]?.value ?? initialValues.quantityMilestones[index].value,
            text: data.milestones?.quantity?.[index]?.text ?? "",
          })),
        });
      } catch (error) {
        console.warn("Failed to load collection-based progress bar config:", error);
      }
    }

    loadSavedData();
  }, [form, shop]);

  function normalizeMilestones(rawMilestones) {
    if (!Array.isArray(rawMilestones)) return [];

    return rawMilestones
      .map((milestone) => ({
        value: Number(milestone?.value),
        text: String(milestone?.text || "").trim(),
      }))
      .filter((milestone) => Number.isFinite(milestone.value) && milestone.value >= 0 && milestone.text);
  }

  const handleFinish = async (values) => {
    const payload = {
      progressbarEnabled: !!values.progressbarEnabled,
      collectionTag: String(values.collectionTag || "").trim(),
      mode: values.mode === "quantity" ? "quantity" : "price",
      priceMilestones: normalizeMilestones(values.priceMilestones),
      quantityMilestones: normalizeMilestones(values.quantityMilestones),
    };

    // console.log("Submitting payload:", payload);

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
        throw new Error(result?.error || "Failed to save collection-based progress bar");
      }

      setStatus({ type: "success", message: "Collection-based progress bar saved successfully." });
    } catch (error) {
      setStatus({ type: "error", message: error?.message || "Failed to save collection-based progress bar." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <TitleBar title="Collection Based Progress Bar" />

      {!styleContainer ? (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
          Loading form...
        </div>
      ) : (
        <StyleProvider container={styleContainer}>
          <Card
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              borderRadius: 16,
            }}
          >
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  Collection Based Progress Bar
                </Title>
                <Text type="secondary">
                  Use this setting to show a progress bar only for products that match your collection tag. The progress bar works with one, two, or three milestones in both price mode and quantity mode.
                </Text>
              </div>

              {status ? (
                <Alert
                  type={status.type}
                  message={status.message}
                  showIcon
                />
              ) : null}

              <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleFinish}
              >
                <Form.Item
                  label="Enable Collection Based Progress Bar"
                  name="progressbarEnabled"
                  valuePropName="checked"
                >
                  <Checkbox>Show this progress bar in the cart drawer</Checkbox>
                </Form.Item>

                <Alert
                  style={{ marginBottom: 20 }}
                  type="info"
                  showIcon
                  message="How this progress bar works"
                  description="First choose which products should be counted by adding a collection tag. Then choose how customers should unlock rewards: by total price or by total quantity. The progress bar will only count products with that tag, and it will still work even if you fill only one milestone."
                />

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Product Tag"
                      name="collectionTag"
                      rules={[{ required: true, message: "Collection tag is required" }]}
                      extra="Only products with this tag will be counted in the progress bar."
                    >
                      <Input placeholder="Example: summer-offer or test-collection-vs" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Mode"
                      name="mode"
                      rules={[{ required: true, message: "Mode is required" }]}
                      extra="Choose Price if rewards depend on cart value. Choose Quantity if rewards depend on how many tagged items are added."
                    >
                      <Select
                        options={[
                          { label: "Price Based", value: "price" },
                          { label: "Quantity Based", value: "quantity" },
                        ]}
                        placeholder="Select how rewards should work"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Alert
                  style={{ marginBottom: 20 }}
                  type="info"
                  showIcon
                  message="How tier setup works"
                  description="If you fill only Milestone 1, the progress bar will still work as a single-milestone setup. If you want more rewards, then fill Milestone 2 and Milestone 3 in order. Milestone 2 and 3 are optional, but Milestone 1 should always be completed first."
                />

                <Card
                  size="small"
                  title="Price Based Rewards"
                  style={{ marginBottom: 20, borderRadius: 12 }}
                >
                  <Space direction="vertical" size={12} style={{ width: "100%", marginBottom: 16 }}>
                    <Alert
                      type={priceTierCount <= 1 ? "success" : "info"}
                      showIcon
                      message={
                        priceTierCount <= 1
                          ? "Single price milestone setup detected. Yes, only Milestone 1 is enough for the price progress bar to work."
                          : `${priceTierCount}-tier price setup detected. Keep milestone values increasing from Milestone 1 onward.`
                      }
                    />
                    {hasPriceTierGap ? (
                      <Alert
                        type="warning"
                        showIcon
                        message="Complete price milestones in order"
                        description="Fill Price Milestone 1 first, then Milestone 2, then Milestone 3. Do not skip an earlier reward tier."
                      />
                    ) : null}
                  </Space>
                  <Row gutter={[16, 0]}>
                    {milestoneIndexes.map((index) => (
                      <React.Fragment key={`price-${index}`}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            label={`Price Milestone ${index + 1} Value`}
                            name={["priceMilestones", index, "value"]}
                            extra={index === 0 ? "Example: 499 or 999" : "Optional if you want more reward tiers"}
                          >
                            <InputNumber
                              min={0}
                              style={{ width: "100%" }}
                              placeholder="Enter price value"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={16}>
                          <Form.Item
                            label={`Price Milestone ${index + 1} Text`}
                            name={["priceMilestones", index, "text"]}
                            extra={
                              index === 0
                                ? "Example: Free Shipping, Free Gift, or 10% Off. Only this first milestone is enough if you want a single price milestone bar."
                                : `Optional. Fill this only if you want Price Milestone ${index + 1}.`
                            }
                          >
                            <Input placeholder="Enter milestone text" />
                          </Form.Item>
                        </Col>
                      </React.Fragment>
                    ))}
                  </Row>
                </Card>

                <Card
                  size="small"
                  title="Quantity Based Rewards"
                  style={{ marginBottom: 20, borderRadius: 12 }}
                >
                  <Space direction="vertical" size={12} style={{ width: "100%", marginBottom: 16 }}>
                    <Alert
                      type={quantityTierCount <= 1 ? "success" : "info"}
                      showIcon
                      message={
                        quantityTierCount <= 1
                          ? "Single quantity milestone setup detected. Yes, only Milestone 1 is enough for the quantity progress bar to work."
                          : `${quantityTierCount}-tier quantity setup detected. Keep milestone values increasing from Milestone 1 onward.`
                      }
                    />
                    {hasQuantityTierGap ? (
                      <Alert
                        type="warning"
                        showIcon
                        message="Complete quantity milestones in order"
                        description="Fill Quantity Milestone 1 first, then Milestone 2, then Milestone 3. Do not skip an earlier reward tier."
                      />
                    ) : null}
                  </Space>
                  <Row gutter={[16, 0]}>
                    {milestoneIndexes.map((index) => (
                      <React.Fragment key={`quantity-${index}`}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            label={`Quantity Milestone ${index + 1} Value`}
                            name={["quantityMilestones", index, "value"]}
                            extra={index === 0 ? "Example: 2, 3, or 5 items" : "Optional if you want more reward tiers"}
                          >
                            <InputNumber
                              min={0}
                              style={{ width: "100%" }}
                              placeholder="Enter quantity value"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={16}>
                          <Form.Item
                            label={`Quantity Milestone ${index + 1} Text`}
                            name={["quantityMilestones", index, "text"]}
                            extra={
                              index === 0
                                ? "Example: Free Gift, Buy More Save More, or 15% Off. Only this first milestone is enough if you want a single quantity milestone bar."
                                : `Optional. Fill this only if you want Quantity Milestone ${index + 1}.`
                            }
                          >
                            <Input placeholder="Enter milestone text" />
                          </Form.Item>
                        </Col>
                      </React.Fragment>
                    ))}
                  </Row>
                </Card>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" loading={isSubmitting}>
                    Save Settings
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </StyleProvider>
      )}
    </div>
  );
}
