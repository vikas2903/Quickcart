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
import { useTranslation } from "react-i18next";

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

export default function HelpSupportMini() {
  const { shop } = useLoaderData();
  const fetcher = useFetcher();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const descPlaceholder = useMemo(() => {
    const target = email || shop;
    return t("helpPage.description-placeholder", { target });
  }, [email, shop, t]);

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("shop", shop);
    fd.append("name", name.trim());
    fd.append("email", email.trim());
    fd.append("description", description.trim());

    fetcher.submit(fd, { method: "post" });
  };

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
      <TitleBar title={t("helpPage.page-title")} />
      <Layout>
        <Layout.Section>
          <div style={{ width: "70%", margin: "0 auto" }}>
            <div className="help-support-banner" style={{ marginBottom: "20px" }}>
              <Banner tone="info">
                <p>
                  {t("helpPage.banner-text-prefix")}{" "}
                  <a href="mailto:support@digisidekick.com">support@digisidekick.com</a> or{" "}
                  <a href="mailto:vikasprasad@digisidekick.com">vikasprasad@digisidekick.com</a>
                </p>
              </Banner>
            </div>

            {fetcher.data?.ok === false && (
              <Box marginBlockEnd="300">
                <Banner tone="critical" title={t("helpPage.send-failed-title")}>
                  <p>{fetcher.data?.error || t("helpPage.unknown-error")}</p>
                </Banner>
              </Box>
            )}

            <LegacyCard sectioned>
              <BlockStack gap="500">
                <TextField
                  label={t("helpPage.name-label")}
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                />
                <TextField
                  label={t("helpPage.email-label")}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
                <TextField
                  label={t("helpPage.description-label")}
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
                  {t("helpPage.submit-button")}
                </Button>
              </BlockStack>
            </LegacyCard>
          </div>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t("helpPage.modal-title")}
        primaryAction={{
          content: t("helpPage.modal-close"),
          onAction: () => setModalOpen(false),
        }}
      >
        <Modal.Section>
          <p style={{ marginBottom: 8 }}>
            {t("helpPage.modal-message-prefix")}{" "}
            <strong>{t("helpPage.modal-business-days")}</strong>
            {email
              ? t("helpPage.modal-email-suffix", { email })
              : t("helpPage.modal-no-email-suffix")}
          </p>
          <p style={{ opacity: 0.8 }}>
            {t("helpPage.urgent-message-prefix")}{" "}
            <a href="mailto:support@digisidekick.com">
              support@digisidekick.com
            </a>{" "}
            {t("helpPage.urgent-message-suffix")}
          </p>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
