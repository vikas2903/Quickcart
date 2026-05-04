import React, { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { TitleBar } from "@shopify/app-bridge-react";
import { Form, Input, InputNumber, Button, Card, Select, Row, Col, Typography, Space } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { authenticate } from "../shopify.server.js";

const { Title, Text } = Typography;

const milestoneIndexes = [0, 1, 2];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function CollectionBasedProgressbarQtyPriceBasedModalsPage() {
  const [form] = Form.useForm();
  const [styleContainer, setStyleContainer] = useState(null);

  useEffect(() => {
    setStyleContainer(document.head || document.body || null);
  }, []);

  const initialValues = {
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

  const handleFinish = (values) => {
    console.log("collection-based-progressbar-qty-price-based payload:", values);
  };

  return (
    <div style={{ padding: 24 }}>
      <TitleBar title="Collection Based Progressbar Modal" />

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
                  Collection Based Progressbar Fields
                </Title>
                <Text type="secondary">
                  All fields are required. Save will only print the form payload in the browser console.
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleFinish}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Collection Tag"
                      name="collectionTag"
                      rules={[{ required: true, message: "Collection tag is required" }]}
                    >
                      <Input placeholder="Enter collection tag" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Mode"
                      name="mode"
                      rules={[{ required: true, message: "Mode is required" }]}
                    >
                      <Select
                        options={[
                          { label: "Price", value: "price" },
                          { label: "Quantity", value: "quantity" },
                        ]}
                        placeholder="Select mode"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Card
                  size="small"
                  title="Price Milestones"
                  style={{ marginBottom: 20, borderRadius: 12 }}
                >
                  <Row gutter={[16, 0]}>
                    {milestoneIndexes.map((index) => (
                      <React.Fragment key={`price-${index}`}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            label={`Price Milestone ${index + 1} Value`}
                            name={["priceMilestones", index, "value"]}
                            rules={[{ required: true, message: "Value is required" }]}
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
                            rules={[{ required: true, message: "Text is required" }]}
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
                  title="Quantity Milestones"
                  style={{ marginBottom: 20, borderRadius: 12 }}
                >
                  <Row gutter={[16, 0]}>
                    {milestoneIndexes.map((index) => (
                      <React.Fragment key={`quantity-${index}`}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            label={`Quantity Milestone ${index + 1} Value`}
                            name={["quantityMilestones", index, "value"]}
                            rules={[{ required: true, message: "Value is required" }]}
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
                            rules={[{ required: true, message: "Text is required" }]}
                          >
                            <Input placeholder="Enter milestone text" />
                          </Form.Item>
                        </Col>
                      </React.Fragment>
                    ))}
                  </Row>
                </Card>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit">
                    Save
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
