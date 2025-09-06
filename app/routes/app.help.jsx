import React, { useEffect, useMemo, useState } from "react";
import { authenticate } from "../shopify.server.js";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Page, Layout, LegacyCard, BlockStack, TextField, Button, Banner, Box, Modal
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function HelpSupportMini() {
  const { shop } = useLoaderData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [description, setDescription] = useState("");

  // NEW: modal state
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/store", { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const sEmail = data?.contactEmail || data?.email || data?.storeEmail || "";
        if (sEmail) setStoreEmail(sEmail);
      } catch (e) {
        console.warn("Store email fetch failed:", e);
      }
    })();
  }, []);

  const descPlaceholder = useMemo(() => {
    const target = storeEmail || "your store email";
    return `Describe the issue. To attach screenshots, email them to ${target} or reply to our confirmation email.`;
  }, [storeEmail]);

  const handleSubmit = async () => {
    const payload = {
      name: name.trim(),
      email: email.trim(),
      storeEmail: storeEmail.trim() || null,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };
    console.log("Help/Support payload:", payload);


  const res = await fetch("/app/api/send-support", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

     if (res.ok) {
    setModalOpen(true);
    // clear if you like
  } else {
    // show error toast/modal
  }

    // (optional) clear the form
    // setName(""); setEmail(""); setDescription("");
  };

  const reachEmail = email || storeEmail || shop;

  return (
    <Page fullWidth>
      <TitleBar title="Help & Support" />
      <Layout>
        <Layout.Section>
          <div style={{ width: "70%", margin: "0 auto" }}>
            <div style={{ marginBottom: 16 }}>
              <Box marginBlockEnd="400">
                <Banner
                  tone="info"
                  title="Need help?"
                  action={{ content: "Support", url: `/app/help`, external: true }}
                  secondaryAction={{
                    content: "How to use & Customize",
                    url: "https://youtu.be/ojooDuF6UlE?si=LqSznKp4X0N51z_w",
                    external: true,
                    target: "_blank",
                  }}
                >
                  <p>
                    If you have any questions or encounter errors while using this app, email{" "}
                    <a href="mailto:support@digisidekick.com">support@digisidekick.com</a>
                  </p>
                </Banner>
              </Box>
            </div>

            <LegacyCard sectioned>
              <BlockStack gap="500">
                <TextField label="Your name" value={name} onChange={setName} autoComplete="name" />
                <TextField label="Your email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <TextField
                  label="Store email"
                  value={storeEmail}
                  onChange={setStoreEmail}
                  autoComplete="email"
                  placeholder={shop}
                  readOnly
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  autoComplete="off"
                  multiline={6}
                  placeholder={descPlaceholder}
                />
                <Button variant="primary" onClick={handleSubmit}>Submit</Button>
              </BlockStack>
            </LegacyCard>
          </div>
        </Layout.Section>
      </Layout>

      {/* Confirmation Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="We’ve received your request"
        primaryAction={{ content: "Close", onAction: () => setModalOpen(false) }}
      >
        <Modal.Section>
          <p style={{ marginBottom: 8 }}>
            Thanks for reaching out! Our support team will get back to you within{" "}
            <strong>2 business days</strong>
            {reachEmail ? ` at ${reachEmail}.` : "."}
          </p>
          <p style={{ opacity: 0.8 }}>
            If your issue is urgent, please email{" "}
            <a href="mailto:support@digisidekick.com">support@digisidekick.com</a> with “URGENT” in the subject.
          </p>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
