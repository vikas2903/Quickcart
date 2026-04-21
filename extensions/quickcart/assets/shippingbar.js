(async function () {
    const quickCartI18n = window.QuickCartI18n || {};
    const drawerEl = document.getElementById("CartDrawerPremium");
    const appUrl = drawerEl?.getAttribute("data-app-url") || "https://quickcart-vf8k.onrender.com";
    const shopDomain = window.Shopify?.shop || drawerEl?.getAttribute("data-shop") || "";

    const shippingBarWrapper = document.querySelector(".shipping-progress");
    const shippingBarFill = document.querySelector(".shipping-progress__fill");
    const shippingBarText = document.querySelector(".shipping-progress__text");
    const shippingBarIcon = document.querySelector(".shipping-progress__fill-icon");

    const quantityProgressWrapper = document.querySelector("[data-qty-tier-progress]");
    const quantityProgressFill = quantityProgressWrapper?.querySelector("[data-progress-fill]");
    const quantityProgressMessage = quantityProgressWrapper?.querySelector("[data-progress-message]");
    const quantityProgressSteps = Array.from(
        quantityProgressWrapper?.querySelectorAll(".progress-steps .step") || []
    );

    const quantityTierConfig = {
        enabled: false,
        color: "#000000",
        steps: []
    };

    function sanitizeQuantitySteps(rawSteps) {
        if (!Array.isArray(rawSteps)) return [];

        return rawSteps
            .map((step) => ({
                qty: Number.parseInt(step?.qty, 10),
                label: String(step?.label || "").trim()
            }))
            .filter((step) => Number.isInteger(step.qty) && step.qty > 0 && step.label)
            .sort((a, b) => a.qty - b.qty);
    }

    function renderQuantityTierProgress(totalQty) {
        if (!quantityProgressWrapper || !quantityProgressFill || !quantityProgressMessage) {
            return;
        }

        const steps = quantityTierConfig.steps;
        const isEnabled = quantityTierConfig.enabled && steps.length > 0;

        quantityProgressWrapper.style.display = isEnabled ? "block" : "none";

        if (!isEnabled) {
            return;
        }

        quantityProgressWrapper.style.setProperty(
            "--primary-color-progressbar",
            quantityTierConfig.color || "#000000"
        );

        const maxQty = steps.length ? Math.max(...steps.map((step) => step.qty)) : 0;
        const nextStep = steps.find((step) => totalQty < step.qty) || null;
        const progress = maxQty ? Math.min(100, Math.round((totalQty / maxQty) * 100)) : 0;

        quantityProgressSteps.forEach((el, index) => {
            const step = steps[index];

            if (!step) {
                el.style.display = "none";
                el.classList.remove("active", "unlocked");
                return;
            }

            el.style.display = "flex";

            const labelEl = el.querySelector(".step-label");
            if (labelEl) {
                labelEl.innerHTML = `${step.label}<br><small>Buy ${step.qty}</small>`;
            }

            const unlocked = totalQty >= step.qty;
            const active = !unlocked && nextStep && nextStep.qty === step.qty;

            el.classList.toggle("unlocked", unlocked);
            el.classList.toggle("active", !!active);
        });

        quantityProgressFill.style.width = `${progress}%`;

        if (nextStep) {
            const remaining = nextStep.qty - totalQty;
            quantityProgressMessage.innerHTML = `Add <strong>${remaining} item${remaining === 1 ? "" : "s"}</strong> to unlock <strong>${nextStep.label}</strong>!`;
        } else {
            quantityProgressMessage.innerHTML = "<strong>Maximum discount unlocked!</strong>";
        }
    }

    async function loadQuantityTierConfig() {
        if (!shopDomain || !quantityProgressWrapper) {
            return;
        }

        try {
            const response = await fetch(`${appUrl}/app/quickcart/quantitytrieddiscount`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Shop-Domain": shopDomain,
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            const data = result?.data;

            console.log("/app/quickcart/quantitytrieddiscount", data);

            quantityTierConfig.enabled = !!data?.enabled;
            quantityTierConfig.color = data?.color || "#000000";
            quantityTierConfig.steps = sanitizeQuantitySteps(data?.steps);
        } catch (error) {
            console.warn("Quantity tier config fetch failed:", error);
            quantityTierConfig.enabled = false;
            quantityTierConfig.color = "#000000";
            quantityTierConfig.steps = [];
        }
    }

    const COLORS = {
        fill: "#548fc5",
        iconBg: "#548fc5",
        iconColor: "#fff"
    };

    const CONFIG = {
        mode: "price",
        targetPrice: 999,
        targetQty: 3
    };

    function applyColors() {
        if (shippingBarFill) {
            shippingBarFill.style.backgroundColor = COLORS.fill;
        }
        if (shippingBarIcon) {
            shippingBarIcon.style.backgroundColor = COLORS.iconBg;
            shippingBarIcon.style.color = COLORS.iconColor;
        }
    }

    applyColors();

    const settingPageEndpoint = `${appUrl}/app/api/settings`;

    try {
        const response = await fetch(settingPageEndpoint, {
            method: "GET",
            headers: {
                "X-Shopify-Shop-Domain": shopDomain,
                Accept: "application/json"
            }
        });

        if (response.ok) {
            const settingsData = await response.json();
            const shippingBar = settingsData?.data?.shippingBar;

            if (shippingBar) {
                if (shippingBar.enabled == true && shippingBarWrapper) {
                    shippingBarWrapper.style.display = "block";
                }

                if (shippingBar.threshold) CONFIG.targetPrice = Number(shippingBar.threshold);

                if (shippingBar.fillColor) {
                    COLORS.fill = shippingBar.fillColor;
                    COLORS.iconBg = shippingBar.fillColor;
                }
                if (shippingBar.bgColor) {
                    const barBg = document.querySelector(".shipping-progress__bar");
                    if (barBg) barBg.style.backgroundColor = shippingBar.bgColor;
                }
                if (shippingBar.textColor) {
                    if (shippingBarText) shippingBarText.style.color = shippingBar.textColor;
                }

                applyColors();
            }
        } else {
            console.warn("Settings API error:", response.status);
        }
    } catch (err) {
        console.warn("Settings fetch failed, using fallback config");
    }

    const localizedText = {
        free: quickCartI18n.shippingBarFree || "You got Free Shipping!",
        remaining_price: quickCartI18n.shippingBarRemainingPrice || "Spend {{amount}} more to get Free Shipping",
        remaining_qty: quickCartI18n.shippingBarRemainingQty || "Add {{qty}} more items to get Free Shipping"
    };

    function formatText(template, data) {
        return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] ?? "");
    }

    function getActiveCurrency(cartCurrency) {
        return (
            window.Shopify?.currency?.active ||
            cartCurrency ||
            drawerEl?.getAttribute("data-currency") ||
            "INR"
        );
    }

    function toMoney(cents, currency) {
        const safeCents = Math.max(0, Number(cents) || 0);
        const activeCurrency = getActiveCurrency(currency);

        try {
            return (safeCents / 100).toLocaleString(undefined, {
                style: "currency",
                currency: activeCurrency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        } catch (e) {
            return (safeCents / 100).toFixed(2);
        }
    }

    function clamp(num, min, max) {
        return Math.max(min, Math.min(num, max));
    }

    async function onCartUpdate() {
        try {
            const res = await fetch("/cart.js", {
                headers: { Accept: "application/json" }
            });

            if (!res.ok) return;

            const cart = await res.json();

            const cartTotalPriceCents = cart?.total_price || 0;
            const cartTotalQty = cart?.item_count || 0;
            const currency = cart?.currency || "INR";

            renderQuantityTierProgress(cartTotalQty);

            let progress = 0;
            let message = "";

            if (CONFIG.mode === "price") {
                const targetPriceCents = Math.max(1, CONFIG.targetPrice * 100);

                progress = (cartTotalPriceCents / targetPriceCents) * 100;

                if (cartTotalPriceCents >= targetPriceCents) {
                    progress = 100;
                    message = localizedText.free;
                } else {
                    const remaining = targetPriceCents - cartTotalPriceCents;

                    message = formatText(localizedText.remaining_price, {
                        amount: toMoney(remaining, currency)
                    });
                }
            }

            if (CONFIG.mode === "quantity") {
                const targetQty = Math.max(1, CONFIG.targetQty);

                progress = (cartTotalQty / targetQty) * 100;

                if (cartTotalQty >= targetQty) {
                    progress = 100;
                    message = localizedText.free;
                } else {
                    const remaining = targetQty - cartTotalQty;

                    message = formatText(localizedText.remaining_qty, {
                        qty: remaining
                    });
                }
            }

            progress = clamp(progress, 0, 100);

            if (shippingBarFill) {
                shippingBarFill.style.width = `${progress}%`;
            }

            if (shippingBarText) {
                shippingBarText.textContent = message;
            }
        } catch (err) {
            console.error("Cart update failed:", err);
        }
    }

    let updateTimeout;

    function triggerCartUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(onCartUpdate, 150);
    }

    await loadQuantityTierConfig();
    onCartUpdate();

    document.addEventListener("cart:updated", triggerCartUpdate);

    if (!window.__shippingBarPatched) {
        window.__shippingBarPatched = true;

        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            try {
                const url = typeof args[0] === "string"
                    ? args[0]
                    : args[0]?.url || "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    triggerCartUpdate();
                }
            } catch (e) {}

            return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                const url = typeof args[1] === "string" ? args[1] : "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    triggerCartUpdate();
                }
            });

            return originalOpen.apply(this, args);
        };
    }
})();
