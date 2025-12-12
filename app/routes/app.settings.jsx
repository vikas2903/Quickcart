import React, { useState, useEffect, useMemo } from "react";
import { Page, Layout, Button, Banner } from "@shopify/polaris";
import antdResetHref from "antd/dist/reset.css?url";
import { ColorPicker, Checkbox, InputNumber } from "antd";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assests/style.css";

export const links = () => [{ rel: "stylesheet", href: antdResetHref }];

const API_URL = "/app/api/cartdrawer";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

function Settings() {
  const { shop } = useLoaderData();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [countdownBackgroundColor, setCountdownBackgroundColor] =
    useState("#5B9BD5");
  const [countdownTextColor, setCountdownTextColor] = useState("#ffffff");
  const [countdownChipBackgroundColor, setCountdownChipBackgroundColor] =
    useState("#ffffff");
  const [countdownChipTextColor, setCountdownChipTextColor] = useState("#2c3e50");
  const [countdownBorderRadius, setCountdownBorderRadius] = useState(50);
  const [countdownEnable, setCountdownEnable] = useState(false);

  // Handle color change
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
    }),
    [
      countdownBackgroundColor,
      countdownTextColor,
      countdownChipBackgroundColor,
      countdownChipTextColor,
      countdownBorderRadius,
      countdownEnable,
    ]
  );

  // Save settings
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
          <div style={{ marginBottom: "20px" }}>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
            >
              Save Settings
            </Button>
          </div>
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
      </Layout>
    </Page>
  );
}

export default Settings;
