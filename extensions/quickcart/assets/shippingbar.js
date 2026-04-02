(async function () {

    const shippingBarFill = document.querySelector(".shipping-progress__fill");
    const shippingBarText = document.querySelector(".shipping-progress__text");
    const shippingBarIcon = document.querySelector(".shipping-progress__fill-icon");

    const shippingBarFillColor = "#548fc5";
    const shippingBarIconColor = "#548fc5";


    if (shippingBarFill) {
        shippingBarFill.style.backgroundColor = shippingBarFillColor;
    }

    if (shippingBarIcon) {
        shippingBarIcon.style.backgroundColor = shippingBarIconColor;
        shippingBarIcon.style.color = "#fff";
    }

    const CONFIG = {
        mode: "price", // "price" OR "quantity"
        targetPrice: 999, // main currency (e.g. ₹1000)
        targetQty: 3
    };

    const TEXT = {
        free: "🎉 You got Free Shipping!",
        remaining_price: "Spend {{amount}} more to get Free Shipping",
        remaining_qty: "Add {{qty}} more items to get Free Shipping"
    };

    function formatText(template, data) {
        return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()]);
    }

    // ✅ Correct currency formatter (cents → formatted money)
    function toMoney(cents, currency = "INR", locale = undefined) {
        const amount = Math.max(0, (Number(cents) || 0) / 100);

        return new Intl.NumberFormat(locale || navigator.language, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(amount);
    }

    async function onCartUpdate() {
        try {
            const res = await fetch("/cart.js", {
                headers: { Accept: "application/json" }
            });

            const cart = await res.json();
            console.log("cartjjjj", cart)
            const cartTotalPriceCents = cart?.total_price || 0;
            const cartTotalQty = cart?.item_count || 0;
            const currency = cart?.currency || "INR";

            const targetPriceCents = CONFIG.targetPrice * 100;

            let progress = 0;
            let message = "";

            // ✅ PRICE MODE
            if (CONFIG.mode === "price") {

                progress = (cartTotalPriceCents / targetPriceCents) * 100;

                if (cartTotalPriceCents >= targetPriceCents) {
                    message = TEXT.free;
                    progress = 100;
                } else {
                    const remainingCents = targetPriceCents - cartTotalPriceCents;

                    message = formatText(TEXT.remaining_price, {
                        amount: toMoney(remainingCents, currency)
                    });
                }
            }

            // ✅ QUANTITY MODE
            if (CONFIG.mode === "quantity") {

                progress = (cartTotalQty / CONFIG.targetQty) * 100;

                if (cartTotalQty >= CONFIG.targetQty) {
                    message = TEXT.free;
                    progress = 100;
                } else {
                    const remaining = CONFIG.targetQty - cartTotalQty;

                    message = formatText(TEXT.remaining_qty, {
                        qty: remaining
                    });
                }
            }

            // ✅ Apply UI safely
            if (shippingBarFill) {
                shippingBarFill.style.width = `${Math.min(progress, 100)}%`;
            }

            if (shippingBarText) {
                shippingBarText.innerHTML = message;
            }

        } catch (err) {
            console.error("Error fetching cart", err);
        }
    }

    // Initial load
    onCartUpdate();

    // Listen for cart updates
    document.addEventListener("cart:updated", onCartUpdate);

    // Prevent duplicate patching
    if (!window.__pbWrapped) {
        window.__pbWrapped = true;

        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";

            if (
                url.includes("/cart/add") ||
                url.includes("/cart/change") ||
                url.includes("/cart/update")
            ) {
                document.dispatchEvent(new Event("cart:updated"));
            }

            return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                const url = typeof args[1] === "string" ? args[1] : "";

                if (
                    url.includes("/cart/add") ||
                    url.includes("/cart/change") ||
                    url.includes("/cart/update")
                ) {
                    document.dispatchEvent(new Event("cart:updated"));
                }
            });

            return originalOpen.apply(this, args);
        };
    }

})();