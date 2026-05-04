(async function () {
    const progressState = window.__priceTierDiscountProgressBarState || {
        milestoneIcons: [],
        milestones: [],
        milestonesLoaded: false,
        renderedSignature: "",
        uiBootstrapped: false,
        updateTimeout: null
    };

    window.__priceTierDiscountProgressBarState = progressState;

    const MILESTONE_ICONS_DEFAULT = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path></svg>'
    ];

    const MILESTONE_TEXT_DEFAULT = [
        {price: 100, text: "Free Shipping @ 1999"},    
        {price: 500, text: "Free Gift @ 4999"},
        {price: 1000, text: "20% off @ 9999"}
    ];

    function applyDefaultMilestones() {
        progressState.milestoneIcons = MILESTONE_ICONS_DEFAULT.slice();
        progressState.milestones = MILESTONE_TEXT_DEFAULT.map(function (milestone) {
            return {
                price: Number(milestone.price || 0),
                text: milestone.text || ""
            };
        });
    }


    function initProductMediaWireframe() {
        const slideshowContainers = document.querySelectorAll(".product-information__media .slideshow-slides");

        slideshowContainers.forEach(function (container) {
            if (container.querySelector('[data-quickcart-wireframe="true"]')) {
                return;
            }

            const countOfSlideshow = container.querySelectorAll("slideshow-slide").length;

            const insertWireframe =
                '<slideshow-slide data-quickcart-wireframe="true" aria-hidden="true" style="--slideshow-timeline: --slide-' + countOfSlideshow + '; --product-media-fit: contain; --grid-template-rows: 50dvh 1fr; --grid-template-rows-desktop: 70dvh 1fr;" class="product-media-container constrain-height media-fit-contain product-media-container--image product-media-container--zoomable">' +
                '<div class="product-media" style="--ratio: 0.8047690014903129" data-media-id="35367829274880">' +
                '<img src="//cdn.shopify.com/s/files/1/0693/7215/0016/files/ChatGPT_Image_Apr_24_2026_11_45_45_AM.png?v=1777011375&amp;width=3840" alt="Beige men&apos;s t-shirt with Army Land Warfare text, Indian flag on sleeve, and crossed swords graphic." width="3840" height="4772" sizes="(min-width: 95rem) calc(65rem + (100vw - 95rem)), (min-width: 750px) calc(100vw - 25rem - 40px - 6px), 100vw" class="product-media__image" fetchpriority="auto" style="--focal-point: 50.0% 50.0%;">' +
                "</div>" +
                "</slideshow-slide>";

            container.insertAdjacentHTML("beforeend", insertWireframe);
        });
    }

    function bootstrapUI(renderMilestones) {
        if (progressState.uiBootstrapped) {
            renderMilestones();
            return;
        }

        renderMilestones();
        initProductMediaWireframe();
        progressState.uiBootstrapped = true;
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

    function getMilestoneSignature() {
        return JSON.stringify({
            icons: progressState.milestoneIcons,
            milestones: progressState.milestones
        });
    }

    function renderMilestones() {
        const stepsContainer = document.getElementById("milestoneProgressSteps");

        if (!stepsContainer) {
            return;
        }

        const signature = getMilestoneSignature();

        if (progressState.renderedSignature === signature && stepsContainer.children.length) {
            return;
        }

        const milestones = progressState.milestones;
        const milestoneIcons = progressState.milestoneIcons;

        stepsContainer.classList.toggle("is-single", milestones.length === 1);

        stepsContainer.innerHTML = milestones.map(function (milestone, index) {
            return (
                '<div class="milestone-progress__step" id="milestoneStep' + index + '">' +
                '<div class="milestone-progress__icon">' +
                (milestoneIcons[index] || milestoneIcons[milestoneIcons.length - 1] || "") +
                '</div>' +
                '<span class="milestone-progress__label">' +
                formatPrice(milestone.price) + "  "+
                "<small>" + milestone.text + "</small>" +
                "</span>" +
                "</div>"
            );
        }).join("");

        progressState.renderedSignature = signature;
    }

    async function loadMilestones() {
        if (progressState.milestonesLoaded) {
            return;
        }

        console.log("fetching milestones from server for shop", progressState.milestoneIcons);
        const getShopName = document.querySelector("#shop-primary-url")?.value || window.Shopify?.shop || "";
        const progressWrapper = document.querySelector(".page-shell-upcartapp_progoressbar-wrapper");

        let responseConvertedToJson = null;

        if (!getShopName) {
            console.warn("shop name not found in DOM or Shopify global");
            applyDefaultMilestones();
            if (progressWrapper) {
                progressWrapper.style.display = "none";
            }
            progressState.milestonesLoaded = true;
            return;
        }

        try {
            const reposneFroMilstones = await fetch(`https://quickcart-vf8k.onrender.com/app/quickcart/unlockprice?shop=${encodeURIComponent(getShopName)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Shop-Domain": getShopName,
                    Accept: "application/json"
                }
            });

            responseConvertedToJson = await reposneFroMilstones.json();
        } catch (error) {
            console.error("Milestone API fetch failed:", error);
        }

        const milestonesFromServer = responseConvertedToJson?.ok && responseConvertedToJson?.data
            ? responseConvertedToJson.data.milestones || []
            : [];

        const hasValidMilestones = milestonesFromServer.length > 0;

        if (hasValidMilestones) {
            progressState.milestoneIcons = milestonesFromServer.map(function (milestone, index) {
                return milestone.icon_url || MILESTONE_ICONS_DEFAULT[index] || MILESTONE_ICONS_DEFAULT[MILESTONE_ICONS_DEFAULT.length - 1] || "";
            });

            progressState.milestones = milestonesFromServer.map(function (milestone, index) {
                return {
                    price: Number(milestone.price || MILESTONE_TEXT_DEFAULT[index]?.price || 0),
                    text: milestone.text || MILESTONE_TEXT_DEFAULT[index]?.text || ""
                };
            });
        } else {
            applyDefaultMilestones();
        }

        progressState.milestonesLoaded = true;

        console.log("responseConvertedToJson", responseConvertedToJson);
        const enableMilestoneProgressBar = !!(responseConvertedToJson?.ok && responseConvertedToJson?.data?.enabled);

        if (progressWrapper) {
            progressWrapper.style.display = enableMilestoneProgressBar ? "block" : "none";
        }
    }

    function updateMilestoneProgress(currentPrice) {
        const fill = document.getElementById("milestoneProgressFill");
        const message = document.getElementById("milestoneProgressMessage");
        const milestones = progressState.milestones;

        if (!fill || !message || !milestones.length) {
            return;
        }

        const maxPrice = milestones[milestones.length - 1].price;
        const pct = maxPrice > 0 ? Math.min((currentPrice / maxPrice) * 100, 100) : 0;
        fill.style.width = pct + "%";

        milestones.forEach(function (milestone, index) {
            const stepNode = document.getElementById("milestoneStep" + index);
            if (!stepNode) {
                return;
            }

            stepNode.classList.remove("is-active", "is-complete");

            if (currentPrice >= milestone.price) {
                stepNode.classList.add("is-complete");
            } else if (index === 0 || currentPrice >= milestones[index - 1].price) {
                stepNode.classList.add("is-active");
            }
        });

        const nextMilestone = milestones.find(function (milestone) {
            return currentPrice < milestone.price;
        });

        if (!nextMilestone) {
            message.innerHTML = "You have unlocked <strong>All Milestone rewards</strong> for this order.";
            return;
        }

        const remaining = nextMilestone.price - currentPrice;
        message.innerHTML = "Spend <strong>" + formatPrice(remaining) + " more</strong> to unlock <strong>" + nextMilestone.text + "</strong>.";
    }

    async function onCartUpdate() {

        // ########################################## ##########################################

        try {
            await loadMilestones();

            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", function handleDOMContentLoaded() {
                    document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
                    bootstrapUI(renderMilestones);
                });
            } else {
                bootstrapUI(renderMilestones);
            }

            // ########################################### ############f#############################

            const res = await fetch("/cart.js", {
                headers: { Accept: "application/json" }
            });

            const cart = await res.json();
            const cartTotalPriceCents = cart?.total_price || 0;
            updateMilestoneProgress(cartTotalPriceCents / 100);

            console.log("current price", cartTotalPriceCents / 100);
            console.log("cart", cart);

        } catch (err) {
            console.error("Cart update failed:", err);
        }
    }

    // alias so your existing calls work
    const triggerCartUpdate = () => onCartUpdate();

    onCartUpdate();

    document.addEventListener("cart:updated", triggerCartUpdate);

    if (!window.__priceTierDiscountProgressBarPatched) {
        window.__priceTierDiscountProgressBarPatched = true;

        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            try {
                const url = typeof args[0] === "string"
                    ? args[0]
                    : args[0]?.url || "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    clearTimeout(progressState.updateTimeout);
                    progressState.updateTimeout = setTimeout(triggerCartUpdate, 150);
                }
            } catch (e) { }

            return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                const url = typeof args[1] === "string" ? args[1] : "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    clearTimeout(progressState.updateTimeout);
                    progressState.updateTimeout = setTimeout(triggerCartUpdate, 150);
                }
            });

            return originalOpen.apply(this, args);
        };
    }
})();

