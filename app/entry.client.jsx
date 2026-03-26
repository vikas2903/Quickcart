import "./i18n/i18n.client.js";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { startTransition, StrictMode } from "react";
import i18n from "./i18n/i18n.client.js";
import { RemixBrowser } from "@remix-run/react";

// Shopify passes the admin locale in the URL parameters inside the iframe
const urlParams = new URL(window.location.href).searchParams;
const locale = urlParams.get("locale"); 
if (locale) {
    const normalizedLocale = locale.replace("_", "-");
    const availableLanguages = Object.keys(i18n.options?.resources || {});
    const targetLanguage = availableLanguages.includes(normalizedLocale)
        ? normalizedLocale
        : normalizedLocale.split("-")[0];

    console.log("locale", locale);
    console.log("targetLanguage", targetLanguage);

    if (targetLanguage !== i18n.language) {
        i18n.changeLanguage(targetLanguage);
    }
}

function ClientApp() {
    return (
        <StrictMode>
            <I18nextProvider i18n={i18n}>
                <RemixBrowser />
            </I18nextProvider>
        </StrictMode>
    );
}

startTransition(() => {
    hydrateRoot(document, <ClientApp />);
}); 
