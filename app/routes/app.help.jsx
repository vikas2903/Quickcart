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

const S = {
  pageWrap: {
    maxWidth: 1080,
    margin: "0 auto",
    paddingBottom: 28,
  },
  hero: {
    background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 58%, #38bdf8 100%)",
    color: "#fff",
    borderRadius: 20,
    padding: "24px 26px",
    position: "relative",
    overflow: "hidden",
    marginBottom: 18,
  },
  heroGlow: {
    position: "absolute",
    top: -46,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroEyebrow: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background: "rgba(255,255,255,0.14)",
    padding: "6px 10px",
    borderRadius: 999,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 1.15,
    fontWeight: 700,
    margin: 0,
  },
  heroText: {
    marginTop: 10,
    maxWidth: 680,
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 1.6,
  },
  heroMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 10,
    marginTop: 18,
  },
  heroMetaCard: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: "12px 14px",
    backdropFilter: "blur(6px)",
  },
  heroMetaLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.74)",
    marginBottom: 6,
  },
  heroMetaValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    wordBreak: "break-word",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 0.82fr) minmax(380px, 1.18fr)",
    gap: 18,
    alignItems: "start",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  quickCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    padding: 0,
    overflow: "hidden",
  },
  quickCardInner: {
    padding: 18,
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#1d4ed8",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 6px 0",
  },
  sectionText: {
    color: "#6b7280",
    lineHeight: 1.6,
    fontSize: 13,
    margin: 0,
  },
  contactList: {
    display: "grid",
    gap: 10,
    marginTop: 14,
  },
  contactItem: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "12px 14px",
    background: "#fff",
  },
  contactItemLabel: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9ca3af",
    marginBottom: 6,
  },
  contactLink: {
    color: "#1d4ed8",
    textDecoration: "none",
    fontWeight: 600,
  },
  tipBox: {
    marginTop: 14,
    borderRadius: 14,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "12px 14px",
    color: "#1d4ed8",
    lineHeight: 1.55,
    fontSize: 13,
  },
  formShell: {
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    background: "#fff",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.07)",
    overflow: "hidden",
  },
  formHeader: {
    padding: "18px 20px 14px 20px",
    borderBottom: "1px solid #f1f5f9",
    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
  },
  formBody: {
    padding: 18,
  },
  helperRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  helperChip: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 600,
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 2,
  },
  actionHint: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.55,
    maxWidth: 360,
  },
};

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
      <div style={S.pageWrap}>
        <div style={S.hero}>
          <div style={S.heroGlow} />
          <div style={S.heroEyebrow}>Support Center</div>
          <h1 style={S.heroTitle}>Get  support for Updart: Progressbar & Upsell in one place</h1>
          <p style={S.heroText}>
            Share your issue, setup question, or feature request below and our team will get back to you as quickly as possible.
          </p>
          <div style={S.heroMetaGrid}>
            <div style={S.heroMetaCard}>
              <div style={S.heroMetaLabel}>Store</div>
              <div style={S.heroMetaValue}>{shop}</div>
            </div>
            <div style={S.heroMetaCard}>
              <div style={S.heroMetaLabel}>Response window</div>
              <div style={S.heroMetaValue}>1-2 business days</div>
            </div>
            <div style={S.heroMetaCard}>
              <div style={S.heroMetaLabel}>Best contact</div>
              <div style={S.heroMetaValue}>{email || "Add your email in the form"}</div>
            </div>
          </div>
        </div>

        <Layout>
          <Layout.Section>
            <div style={S.grid}>
              <div style={S.stack}>
                <div className="help-support-banner">
                </div>

                <div style={S.quickCard}>
                  <div style={S.quickCardInner}>
                    <div style={S.sectionEyebrow}>Quick Contact</div>
                    <h2 style={S.sectionTitle}>Quick contact</h2>
                    <p style={S.sectionText}>
                      Use email for direct contact or submit the form for detailed help.
                    </p>

                    <div style={S.contactList}>
                      <div style={S.contactItem}>
                        <div style={S.contactItemLabel}>Primary support email</div>
                        <a style={S.contactLink} href="mailto:support@digisidekick.com">
                          support@digisidekick.com
                        </a>
                      </div>
                      <div style={S.contactItem}>
                        <div style={S.contactItemLabel}>Alternate support email</div>
                        <a style={S.contactLink} href="mailto:vikasprasad@digisidekick.com">
                          vikasprasad@digisidekick.com
                        </a>
                      </div>
                    </div>

                    {/* <div style={S.tipBox}>
                      For faster help, include the feature name, expected result, actual result, and a screenshot if possible.
                    </div>
                     */}
                  </div>
                </div>
              </div>

              <div style={S.formShell}>
                <div style={S.formHeader}>
                  <div style={S.sectionEyebrow}>Support Form</div>
                  <h2 style={{ ...S.sectionTitle, marginBottom: 4 }}>Send your request</h2>
                  <p style={S.sectionText}>
                    Fill in the details below and we will reply to your email.
                  </p>
                  <div style={S.helperRow}>
                    <div style={S.helperChip}>Setup help</div>
                    <div style={S.helperChip}>Bug report</div>
                    <div style={S.helperChip}>Theme issue</div>
                    <div style={S.helperChip}>Feature request</div>
                  </div>
                </div>

                <div style={S.formBody}>
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
                      <div style={S.actionRow}>
                        <div style={S.actionHint}>
                          More details help us solve the issue faster.
                        </div>
                        <Button
                          variant="primary"
                          onClick={handleSubmit}
                          loading={sending}
                        >
                          {t("helpPage.submit-button")}
                        </Button>
                      </div>
                    </BlockStack>
                  </LegacyCard>
                </div>
              </div>
            </div>
          </Layout.Section>
        </Layout>
      </div>

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
