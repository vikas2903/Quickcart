(async function () {

    const shippingBarFill = document.querySelector(".shipping-progress__fill");
    const shippingBarText = document.querySelector(".shipping-progress__text");
    const shippingBarIcon = document.querySelector(".shipping-progress__fill-icon");

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


    const appUrl = "https://quickcart-vf8k.onrender.com";
    const settingPageEndpoint = `${appUrl}/app/api/settings`;

    try {
        const response = await fetch(settingPageEndpoint, {
            method: "GET",
            headers: {
                "X-Shopify-Shop-Domain": window.Shopify?.shop || "",
                Accept: "application/json",
            },
        });

        if (response.ok) {
            const settingsData = await response.json();
            const shippingBar = settingsData?.data?.shippingBar;

            if (shippingBar) {
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

    const TEXT = {
        free: "🎉 You got Free Shipping!",
        remaining_price: "Spend {{amount}} more to get Free Shipping",
        remaining_qty: "Add {{qty}} more items to get Free Shipping"
    };

    function formatText(template, data) {
        return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] ?? "");
    }

    function toMoney(cents, currency = "INR", locale = undefined) {
        const amount = Math.max(0, (Number(cents) || 0) / 100);

        return new Intl.NumberFormat(locale || navigator.language, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
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

            let progress = 0;
            let message = "";


            if (CONFIG.mode === "price") {
                const targetPriceCents = Math.max(1, CONFIG.targetPrice * 100);

                progress = (cartTotalPriceCents / targetPriceCents) * 100;

                if (cartTotalPriceCents >= targetPriceCents) {
                    progress = 100;
                    message = TEXT.free;
                } else {
                    const remaining = targetPriceCents - cartTotalPriceCents;

                    message = formatText(TEXT.remaining_price, {
                        amount: toMoney(remaining, currency)
                    });
                }
            }


            if (CONFIG.mode === "quantity") {
                const targetQty = Math.max(1, CONFIG.targetQty);

                progress = (cartTotalQty / targetQty) * 100;

                if (cartTotalQty >= targetQty) {
                    progress = 100;
                    message = TEXT.free;
                } else {
                    const remaining = targetQty - cartTotalQty;

                    message = formatText(TEXT.remaining_qty, {
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
            } catch (e) { }

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

