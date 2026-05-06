(async function () {
    const progressState = window.__collectionBasedProgressBarState || {
        productCache: {},
        domReadyBound: false,
        updateTimeout: null,
        configLoaded: false,
        configLoadedAt: 0,
        configLoadingPromise: null
    };

    window.__collectionBasedProgressBarState = progressState;

    const drawerEl = document.getElementById("CartDrawerPremium");
    const appUrl = drawerEl?.getAttribute("data-app-url") || "";
    const shopDomain = document.querySelector("#shop-primary-url")?.value || window.Shopify?.shop || "";
    const progressWrapper = document.querySelector(".cw-progress-shell");
    const DEFAULT_TARGET_TAG = "test-collection-vs";

    let progressConfig = {
        enabled: false,
        collectionTag: DEFAULT_TARGET_TAG,
        mode: "quantity",
        currentPrice: 0,
        currentQuantity: 0,
        milestones: {
            price: [
                { 
                    value: 2000,
                    text: "Free Gift product Order Above @ ₹2000"
                },
                {
                    value: 5000,
                    text: "Exclusive Discount Order Above @ ₹5000"
                },
                {
                    value: 10000,
                    text: "VIP Support Order Above @ ₹10000"
                }
            ],
            quantity: [
                {
                    value: 2,
                    text: "Free Gift product Order Above @ 2-items"
                },
                {
                    value: 5,
                    text: "Exclusive Discount Order Above @ 5-items"
                },
                {
                    value: 10,
                    text: "Get 20% off @10-items"
                }
            ]
        }
    };

    function sanitizeMilestones(rawMilestones) {
        if (!Array.isArray(rawMilestones)) {
            return [];
        }

        return rawMilestones
            .map(function (milestone) {
                return {
                    value: Number(milestone?.value || 0),
                    text: String(milestone?.text || "").trim()
                };
            })
            .filter(function (milestone) {
                return Number.isFinite(milestone.value) && milestone.value >= 0 && milestone.text;
            })
            .sort(function (a, b) {
                return a.value - b.value;
            });
    }

    function getConfigEndpoint() {
        return (appUrl || "") + "/app/quickcart/collection-based-progressbar-qty-price-based";
    }

    async function loadProgressConfig(forceRefresh) {
        const shouldUseCachedConfig =
            !forceRefresh &&
            progressState.configLoaded &&
            Date.now() - progressState.configLoadedAt < 5000;

        if (shouldUseCachedConfig) {
            return;
        }

        if (progressState.configLoadingPromise) {
            return progressState.configLoadingPromise;
        }

        if (!shopDomain) {
            if (progressWrapper) {
                progressWrapper.style.display = "none";
            }
            progressState.configLoaded = true;
            progressState.configLoadedAt = Date.now();
            return;
        }

        progressState.configLoadingPromise = (async function () {
            try {
                const response = await fetch(getConfigEndpoint(), {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Shopify-Shop-Domain": shopDomain,
                        Accept: "application/json"
                    }
                });

                const result = await response.json();
                const data = result?.data;

                // console.log("Collection progress config fetched:", data);

                if (response.ok && data) {
                    const priceMilestones = sanitizeMilestones(data?.milestones?.price);
                    const quantityMilestones = sanitizeMilestones(data?.milestones?.quantity);

                    progressConfig = {
                        ...progressConfig,
                        enabled: !!data.progressbarEnabled,
                        collectionTag: String(data.collectionTag || DEFAULT_TARGET_TAG).trim() || DEFAULT_TARGET_TAG,
                        mode: data.mode === "quantity" ? "quantity" : "price",
                        milestones: {
                            price: priceMilestones.length ? priceMilestones : progressConfig.milestones.price,
                            quantity: quantityMilestones.length ? quantityMilestones : progressConfig.milestones.quantity
                        }
                    };
                }
            } catch (error) {
                console.error("Collection progress config fetch failed:", error);
            } finally {
                progressState.configLoaded = true;
                progressState.configLoadedAt = Date.now();
                progressState.configLoadingPromise = null;
            }
        })();

        return progressState.configLoadingPromise;
    }

    const MILESTONE_ICONS = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path></svg>'
    ];

    async function getCart() {
        const response = await fetch("/cart.js", {
            headers: { Accept: "application/json" }
        });

        return await response.json();
    }

    async function getProduct(handle) {
        if (!handle) {
            return null;
        }

        if (progressState.productCache[handle]) {
            return progressState.productCache[handle];
        }

        try {
            const response = await fetch("/products/" + handle + ".js", {
                headers: { Accept: "application/json" }
            });

            const product = await response.json();
            progressState.productCache[handle] = product;
            return product;
        } catch (error) {
            console.error("Product fetch error:", handle, error);
            return null;
        }
    }

    async function getTaggedCartData(cart) {
        let totalQty = 0;
        let totalPriceCents = 0;

        await Promise.all(
            (cart?.items || []).map(async function (item) {
                const product = await getProduct(item.handle);

                const targetTag = progressConfig.collectionTag || DEFAULT_TARGET_TAG;

                if (!product || !Array.isArray(product.tags) || !product.tags.includes(targetTag)) {
                    return;
                }

                totalQty += Number(item.quantity || 0);
                totalPriceCents += Number(item.final_line_price || 0);
            })
        );

        return {
            qty: totalQty,
            price: totalPriceCents / 100
        };
    }

    function getActiveCurrency() {
        return window.Shopify?.currency?.active || "INR";
    }

    function formatPrice(price) {
        const amount = Number(price || 0);
        const currency = getActiveCurrency();

        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } catch (error) {
            return currency + " " + amount.toLocaleString("en-IN");
        }
    }

    function formatQuantity(quantity) {
        const safeQuantity = Number(quantity || 0);
        return safeQuantity + " item" + (safeQuantity === 1 ? "" : "s");
    }

    function getProgressSettings(config) {
        const mode = config && config.mode === "quantity" ? "quantity" : "price";
        const allMilestones = (config && config.milestones) || {};
        const milestones = Array.isArray(allMilestones[mode]) ? allMilestones[mode] : [];
        const currentPrice = Number(config?.currentPrice || 0);
        const currentQuantity = Number(config?.currentQuantity || 0);

        return {
            mode: mode,
            currentPrice: currentPrice,
            currentQuantity: currentQuantity,
            currentValue: mode === "quantity" ? currentQuantity : currentPrice,
            milestones: milestones
        };
    }

    function formatMilestoneValue(value, mode) {
        return mode === "quantity" ? formatQuantity(value) : formatPrice(value);
    }

    function buildProgressMessage(remainingValue, milestoneText, mode) {
        if (mode === "quantity") {
            return "Add <strong>" + formatQuantity(remainingValue) + " more</strong> to unlock <strong>" + milestoneText + "</strong>.";
        }

        return "Spend <strong>" + formatPrice(remainingValue) + " more</strong> to unlock <strong>" + milestoneText + "</strong>.";
    }

    function renderMilestones(config) {
        const stepsContainer = document.getElementById("cwProgressPoints");
        const progressSettings = getProgressSettings(config);
        const milestones = progressSettings.milestones;

        if (!stepsContainer) {
            return;
        }

        if (progressWrapper) {
            progressWrapper.style.display = progressConfig.enabled && milestones.length ? "block" : "none";
        }

        if (!progressConfig.enabled) {
            stepsContainer.innerHTML = "";
            return;
        }

        if (!milestones.length) {
            stepsContainer.innerHTML = "";
            return;
        }

        stepsContainer.classList.toggle("cw-progress-points--single", milestones.length === 1);

        stepsContainer.innerHTML = milestones.map(function (milestone, index) {
            return (
                '<div class="cw-progress-point" id="cwProgressPoint' + index + '">' +
                '<div class="cw-progress-badge">' +
                (MILESTONE_ICONS[index] || MILESTONE_ICONS[MILESTONE_ICONS.length - 1]) +
                "</div>" +
                '<span class="cw-progress-caption">' +
                formatMilestoneValue(milestone.value, progressSettings.mode) +
                "<small>" + milestone.text + "</small>" +
                "</span>" +
                "</div>"
            );
        }).join("");
    }

    function updateMilestoneProgress(config) {
        const fill = document.getElementById("cwProgressFill");
        const message = document.getElementById("cwProgressMessage");
        const progressSettings = getProgressSettings(config);
        const milestones = progressSettings.milestones;
        const currentValue = progressSettings.currentValue;

        if (!fill || !message || !milestones.length) {
            if (progressWrapper) {
                progressWrapper.style.display = "none";
            }
            return;
        }

        if (!progressConfig.enabled) {
            if (progressWrapper) {
                progressWrapper.style.display = "none";
            }
            return;
        }

        const maxValue = Number(milestones[milestones.length - 1].value || 0);
        const pct = maxValue > 0 ? Math.min((currentValue / maxValue) * 100, 100) : 0;
        fill.style.width = pct + "%";

        milestones.forEach(function (milestone, index) {
            const stepNode = document.getElementById("cwProgressPoint" + index);

            if (!stepNode) {
                return;
            }

            stepNode.classList.remove("cw-progress-point--active", "cw-progress-point--done");

            if (currentValue >= milestone.value) {
                stepNode.classList.add("cw-progress-point--done");
            } else if (index === 0 || currentValue >= milestones[index - 1].value) {
                stepNode.classList.add("cw-progress-point--active");
            }
        });

        const nextMilestone = milestones.find(function (milestone) {
            return currentValue < milestone.value;
        });

        if (!nextMilestone) {
            message.innerHTML = "You have unlocked <strong>all milestone rewards</strong> for this order.";
            return;
        }

        const remaining = nextMilestone.value - currentValue;
        message.innerHTML = buildProgressMessage(remaining, nextMilestone.text, progressSettings.mode);
    }

    function refreshProgressBar() {
        renderMilestones(progressConfig);
        updateMilestoneProgress(progressConfig);
    }

    function ensureDomRefresh() {
        if (document.readyState === "loading") {
            if (!progressState.domReadyBound) {
                progressState.domReadyBound = true;
                document.addEventListener("DOMContentLoaded", refreshProgressBar, { once: true });
            }
            return;
        }

        refreshProgressBar();
    }

    function setProgressMode(mode) {
        progressConfig.mode = mode === "quantity" ? "quantity" : "price";
        ensureDomRefresh();
    }

    function updateProgressValues(cartTotalPrice, cartItemCount) {
        progressConfig.currentPrice = Number(cartTotalPrice) || 0;
        progressConfig.currentQuantity = Number(cartItemCount) || 0;
        ensureDomRefresh();
    }

    function updateProgressConfig(nextConfig) {
        if (!nextConfig || typeof nextConfig !== "object") {
            return;
        }

        const nextPriceMilestones = sanitizeMilestones(nextConfig?.milestones?.price);
        const nextQuantityMilestones = sanitizeMilestones(nextConfig?.milestones?.quantity);

        progressConfig = {
            ...progressConfig,
            ...nextConfig,
            enabled: typeof nextConfig.enabled === "boolean" ? nextConfig.enabled : progressConfig.enabled,
            collectionTag: String(nextConfig.collectionTag || progressConfig.collectionTag || DEFAULT_TARGET_TAG).trim() || DEFAULT_TARGET_TAG,
            mode: nextConfig.mode === "quantity" ? "quantity" : (nextConfig.mode === "price" ? "price" : progressConfig.mode),
            milestones: {
                price: nextPriceMilestones.length ? nextPriceMilestones : progressConfig.milestones.price,
                quantity: nextQuantityMilestones.length ? nextQuantityMilestones : progressConfig.milestones.quantity
            }
        };

        ensureDomRefresh();
    }

    window.CartDrawerProgressBar = {
        getConfig: function () {
            return progressConfig;
        },
        refresh: refreshProgressBar,
        setMode: setProgressMode,
        updateValues: updateProgressValues,
        updateConfig: updateProgressConfig
    };

    async function onCartUpdate() {
        try {
            await loadProgressConfig();

            const cart = await getCart();
            const taggedCartData = await getTaggedCartData(cart);

            progressConfig.currentPrice = taggedCartData.price;
            progressConfig.currentQuantity = taggedCartData.qty;

            // console.log("collectionProgressTaggedQty:", taggedCartData.qty);
            // console.log("collectionProgressTaggedPrice:", taggedCartData.price);

            ensureDomRefresh();
        } catch (error) {
            console.error("Cart update failed:", error);
        }
    }

    const triggerCartUpdate = function () {
        return onCartUpdate();
    };

    onCartUpdate();

    document.addEventListener("cart:updated", triggerCartUpdate);

    if (!window.__collectionBasedProgressBarPatched) {
        window.__collectionBasedProgressBarPatched = true;

        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            const response = await originalFetch(...args);

            try {
                const url = typeof args[0] === "string"
                    ? args[0]
                    : args[0]?.url || "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    clearTimeout(progressState.updateTimeout);
                    progressState.updateTimeout = setTimeout(triggerCartUpdate, 150);
                }
            } catch (error) {
                console.error("Cart fetch patch failed:", error);
            }

            return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", function () {
                try {
                    const url = typeof args[1] === "string" ? args[1] : "";

                    if (/\/cart\/(add|change|update)/.test(url)) {
                        clearTimeout(progressState.updateTimeout);
                        progressState.updateTimeout = setTimeout(triggerCartUpdate, 150);
                    }
                } catch (error) {
                    console.error("Cart XHR patch failed:", error);
                }
            });

            return originalOpen.apply(this, args);
        };
    }
})();
