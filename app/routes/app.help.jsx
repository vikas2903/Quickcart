import React, {useEffect, useMemo, useState} from "react";
import { Page, Layout, LegacyCard, BlockStack, TextField, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function HelpSupportMini() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeEmail, setStoreEmail] = useState(""); // auto-fetched
  const [description, setDescription] = useState("");

  // Auto-fetch store email once (adjust endpoint if needed)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/store", { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Try common fields; fall back if your API differs
        const sEmail = data?.contactEmail || data?.email || data?.storeEmail || "";
        if (sEmail) setStoreEmail(sEmail);
      } catch (e) {
        // Silent fail; user can still submit
        console.warn("Store email fetch failed:", e);
      }
    })();
  }, []);

  const descPlaceholder = useMemo(() => {
    const target = storeEmail || "your store email";
    return `Describe the issue. To attach screenshots, email them to ${target} or reply to our confirmation email.`;
  }, [storeEmail]);

  const handleSubmit = () => {
    const payload = {
      name: name.trim(),
      email: email.trim(),
      storeEmail: storeEmail.trim() || null,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };
    console.log("Help/Support payload:", payload);
  };

  return (
    <Page fullWidth>
      <TitleBar title="Help & Support" />
      <Layout>
        <Layout.Section>
          {/* 70% width wrapper */}
          <div style={{ width: "70%", margin: "0 auto" }}>
            <LegacyCard sectioned>
              <BlockStack gap="500">
                <TextField label="Your name" value={name} onChange={setName} autoComplete="name" />
                <TextField label="Your email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <TextField
                  label="Store email"
                  value={storeEmail}
                  onChange={setStoreEmail}
                  autoComplete="email"
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
    </Page>
  );
}
