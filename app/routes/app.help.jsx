// app/routes/app.help-support.jsx
import React, {useEffect, useMemo, useState} from "react";
import {json} from "@remix-run/node";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {authenticate} from "../shopify.server.js";
import {
  Page, Layout, LegacyCard, BlockStack, TextField, Button, Banner, Box, Modal
} from "@shopify/polaris";
import {TitleBar} from "@shopify/app-bridge-react";
import {sendSupportEmail} from "../utils/mailer.server.js";

// ----- server -----
export const loader = async ({request}) => {
  const {session} = await authenticate.admin(request);
  return json({shop: session.shop});
};

export const action = async ({request}) => {
  await authenticate.admin(request);
  const fd = await request.formData();
  const payload = {
    shop: fd.get("shop")?.toString() || "",
    name: fd.get("name")?.toString() || "",
    email: fd.get("email")?.toString() || "",
    storeEmail: fd.get("storeEmail")?.toString() || "",
    description: fd.get("description")?.toString() || "",
  };
  try {
    const out = await sendSupportEmail(payload);
    return json({ok: true, ...out});
  } catch (e) {
    console.error("Email sending error:", e);
    return json({ok: false, error: e.message}, {status: 500});
  }
};

// ----- client -----
export default function HelpSupportMini() {
  const {shop} = useLoaderData();
  const fetcher = useFetcher();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [description, setDescription] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/store", {headers: {Accept: "application/json"}});
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

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("shop", shop);
    fd.append("name", name.trim());
    fd.append("email", email.trim());
    fd.append("storeEmail", storeEmail.trim());
    fd.append("description", description.trim());
    fetcher.submit(fd, {method: "post"});
  };

  useEffect(() => {
    if (fetcher.data?.ok) {
      setModalOpen(true);
      if (fetcher.data.previewUrlAdmin) {
        console.log("Ethereal admin preview:", fetcher.data.previewUrlAdmin);
      }
      if (fetcher.data.previewUrlUser) {
        console.log("Ethereal user preview:", fetcher.data.previewUrlUser);
      }
    }
  }, [fetcher.data]);

  const reachEmail = email || storeEmail || shop;
  const sending = fetcher.state !== "idle";

  return (
    <Page fullWidth>
      <TitleBar title="Help & Support" />
      <Layout>
        <Layout.Section>
          <div style={{width: "70%", margin: "0 auto"}}>
            {fetcher.data?.ok === false && (
              <Box marginBlockEnd="300">
                <Banner tone="critical" title="Failed to send email">
                  <p>{fetcher.data?.error || "Unknown error"}</p>
                </Banner>
              </Box>
            )}

            <LegacyCard sectioned>
              <BlockStack gap="500">
                <TextField label="Your name" value={name} onChange={setName} autoComplete="name" />
                <TextField label="Your email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <TextField label="Store email" value={storeEmail} onChange={setStoreEmail} autoComplete="email" placeholder={shop} readOnly />
                <TextField label="Description" value={description} onChange={setDescription} autoComplete="off" multiline={6} placeholder={descPlaceholder} />
                <Button variant="primary" onClick={handleSubmit} loading={sending}>Submit</Button>
              </BlockStack>
            </LegacyCard>
          </div>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="We’ve received your request"
        primaryAction={{content: "Close", onAction: () => setModalOpen(false)}}
      >
        <Modal.Section>
          <p style={{marginBottom: 8}}>
            Thanks for reaching out! Our support team will get back to you within <strong>2 business days</strong>
            {reachEmail ? ` at ${reachEmail}.` : "."}
          </p>
          <p style={{opacity: 0.8}}>
            If your issue is urgent, email <a href="mailto:support@digisidekick.com">support@digisidekick.com</a> with “URGENT” in the subject.
          </p>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
