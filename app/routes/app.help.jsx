// app/routes/app.help-support.jsx
import React, { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server.js";
import {
  Page,
  Layout,
  LegacyCard,
  BlockStack,
  TextField,
  Button,
  Banner,
  Box,
  Modal,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { sendSupportEmail } from "../utils/mailer.server.js";

// ----- SERVER -----
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  const fd = await request.formData();
  const payload = {
    shop: fd.get("shop")?.toString() || "",
    name: fd.get("name")?.toString() || "",
    email: fd.get("email")?.toString() || "",
    description: fd.get("description")?.toString() || "",
  };

  try {
    const out = await sendSupportEmail(payload);
    console.log("Support form payload:", payload);
    return json({ ok: true, ...out });
  } catch (e) {
    console.error("Email sending error:", e);
    return json({ ok: false, error: e.message }, { status: 500 });
  }
};

// ----- CLIENT -----
export default function HelpSupportMini() {
  const { shop } = useLoaderData();
  const fetcher = useFetcher();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Placeholder text dynamically adjusts
  const descPlaceholder = useMemo(() => {
    const target = email || shop;
    return `Describe the issue. You can attach screenshots by replying to our confirmation email (${target}).`;
  }, [email, shop]);

  // Submit handler
  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("shop", shop);
    fd.append("name", name.trim());
    fd.append("email", email.trim());
    fd.append("description", description.trim());

    console.log("fd", fd)
    fetcher.submit(fd, { method: "post" });
  };

  // After submission success
  useEffect(() => {
    if (fetcher.data?.ok) {
      setModalOpen(true);
      if (fetcher.data.previewUrlAdmin) {
        console.log("Admin preview (test mode):", fetcher.data.previewUrlAdmin);
      }
      if (fetcher.data.previewUrlUser) {
        console.log("User preview (test mode):", fetcher.data.previewUrlUser);
      }
    }
  }, [fetcher.data]);

  const sending = fetcher.state !== "idle";

  return (
    <Page fullWidth>
      <TitleBar title="Help & Support" />
      <Layout>
        <Layout.Section>


      


          <div style={{ width: "70%", margin: "0 auto" }}>
<div className="help-support-banner" style={{ marginBottom: "20px" }}>
  <Banner tone="info">
    <p>If you have any questions or encounter errors while using this app, email <a href="mailto:support@digisidekick.com">support@digisidekick.com</a> or <a href="mailto:vikasprasad@digisidekick.com">vikasprasad@digisidekick.com</a></p>
  </Banner>
</div>



            {fetcher.data?.ok === false && (
              <Box marginBlockEnd="300">
                <Banner tone="critical" title="Failed to send email">
                  <p>{fetcher.data?.error || "Unknown error"}</p>
                </Banner>
              </Box>
            )}

            <LegacyCard sectioned>
              <BlockStack gap="500">
                <TextField
                  label="Your name"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                />
                <TextField
                  label="Your email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  autoComplete="off"
                  multiline={6}
                  placeholder={descPlaceholder}
                />
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={sending}
                >
                  Submit
                </Button>
              </BlockStack>
            </LegacyCard>
          </div>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="We’ve received your request"
        primaryAction={{
          content: "Close",
          onAction: () => setModalOpen(false),
        }}
      >
        <Modal.Section>
          <p style={{ marginBottom: 8 }}>
            Thanks for reaching out! Our support team will get back to you
            within <strong>2 business days</strong>
            {email ? ` at ${email}.` : "."}
          </p>
          <p style={{ opacity: 0.8 }}>
            If your issue is urgent, email{" "}
            <a href="mailto:support@digisidekick.com">
              support@digisidekick.com
            </a>{" "}
            with “URGENT” in the subject.
          </p>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
