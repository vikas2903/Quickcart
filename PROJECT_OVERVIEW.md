# Upcart — Progress Bar & Upsell

## Project summary

Upcart is an embedded Shopify application that improves the cart experience through a configurable cart drawer, promotional progress bars, product upsells, and reward-based offers. Merchants manage settings from Shopify Admin; a Theme App Extension renders the selected features directly on the storefront.

The app is designed to increase average order value by making shipping thresholds, gifts, bundles, discounts, and recommended products visible while customers are shopping.

## Core features

| Feature | What it does | Merchant setup summary |
| --- | --- | --- |
| Cart drawer customization | Lets merchants match the cart drawer and checkout button to their brand with configurable colors and border radii. | Open **Cart customization**, configure the Cart Drawer tab, then save. |
| Announcement bar | Displays promotional messages at the top of the cart drawer; comma-separated messages can rotate as a carousel. | Enable it, enter the message(s), choose colors, and save. |
| Countdown timer | Adds urgency with a configurable timer component in the cart. | Enable it, set colors and radius, then save. |
| Upsell collection | Recommends products from a selected Shopify collection, excluding products already in the cart. | Enable it, choose a collection, and save. |
| Free gift product | Automatically offers a selected gift once the cart reaches a configured minimum amount. | Enable it, choose the product, set the cart-value threshold, and save. |
| Free-shipping / shipping progress bar | Shows customers how close they are to free shipping and updates as their cart changes. | Enable it, set the threshold, customize text and colors, and save. |
| Price-based progress bar | Presents up to three ascending cart-value milestones with reward messaging such as free shipping, a gift, or a discount. | Enable it, set milestone values and messages in order, preview, and save. |
| Quantity-based progress bar | Unlocks milestones based on number of items in the cart, supporting buy-more-save-more campaigns. | Enable it, configure ascending quantity tiers and reward text, then save. |
| Collection-based progress bar | Counts only products with a configured product tag; supports price-based and quantity-based reward modes. | Enable it, add the tag, select a mode, create ordered milestones, and save. |
| Buy X Get Y progress bar | Provides a visual tracker for BOGO and bundle promotions, such as Buy 3 Get 1 Free. | Configure Buy X / Get Y rules and messaging, enable, then save. |
| Cart note and delivery estimate | Adds a customer note field and an expected-delivery message to the cart drawer. | Enable either option, set the delivery-day value if needed, and save. |
| Third-party checkout integration | Replaces or supplements the default checkout action with merchant-provided HTML/Liquid integration code. | Enable the integration, add the code, save, and test in a preview theme. |
| Product search and selection | Uses Shopify product data to search for and select products for gifts and promotion rules. | Search from the relevant configuration page and select the desired product(s). |
| Multilingual interface | Includes application and extension locale files for English, Arabic, German, Spanish, French, Italian, Portuguese (Brazil), and Swedish. | The appropriate translation is loaded through the app and extension locale configuration. |
| Help and support | Provides an in-app support page and support-request endpoint. | Use the Help and Support page to submit setup questions or issues. |

## Merchant setup flow

1. Install the embedded app in a Shopify store and complete Shopify authentication.
2. In Shopify Theme Editor, open **App embeds**, enable the **QuickCart** app block, and save the theme.
3. Open **Cart customization** to configure the cart drawer’s appearance and optional components, such as announcements, countdown timer, upsells, shipping bar, cart note, and delivery estimate.
4. Choose the promotion type that matches the campaign:
   - **Price-based** for cart-value thresholds.
   - **Quantity-based** for item-count thresholds.
   - **Collection-based** when only tagged products should count.
   - **Buy X Get Y** for BOGO or bundle incentives.
5. Enable the feature, complete its values in ascending milestone order where applicable, and save the configuration.
6. Add test products on the storefront and open the cart drawer to verify progress, reward messaging, gift behavior, and checkout flow.
7. For third-party checkout code, test in a preview theme before publishing changes.

## Technical architecture

```text
Shopify Admin
  -> Embedded Remix + React application (merchant configuration)
  -> Shopify Admin GraphQL API / app API routes
  -> MongoDB configuration models + Prisma session storage
  -> Theme App Extension (Liquid, JavaScript, CSS)
  -> Storefront cart drawer and promotional UI
```

## Tech stack

| Area | Technologies used | Purpose |
| --- | --- | --- |
| Application framework | Remix, React 18, Vite | Builds the embedded admin application, route handlers, and frontend screens. |
| Shopify platform | Shopify App Remix, Shopify App Bridge React, Shopify Polaris, Shopify CLI, Shopify Admin GraphQL API | Handles embedded authentication, Shopify Admin integration, merchant UI, local development, deployment, and product data access. |
| Storefront extension | Shopify Theme App Extension, Liquid, JavaScript, CSS | Renders the QuickCart app block, cart drawer, progress bars, and storefront interactions without modifying the host theme’s core files. |
| Data storage | MongoDB, Mongoose | Stores shop-specific feature settings, promotion rules, cart drawer configuration, and related app data. |
| Session storage | Prisma, SQLite, Shopify Prisma session-storage adapter | Persists Shopify authentication sessions. |
| UI and styling | Shopify Polaris, Ant Design, styled-components, CSS modules, React Toastify | Provides admin UI components, styling, forms, previews, and user notifications. |
| Internationalization | i18next, react-i18next, i18next-browser-languagedetector | Supports localized admin and theme-extension content. |
| Server utilities | Node.js, Express, CORS, Nodemailer | Supports server runtime behavior, API access, and support email delivery. |
| Tooling | npm, ESLint, Prettier, TypeScript configuration, Docker | Dependency management, linting, formatting, type tooling, and containerized deployment support. |

## Key implementation steps

1. **Embedded app foundation** — The app uses Shopify App Remix authentication and App Bridge so the configuration interface runs inside Shopify Admin.
2. **Merchant configuration pages** — Remix routes provide dedicated screens for cart customization, price and quantity rewards, collection-based rewards, free gifts, Buy X Get Y rules, documentation, and support.
3. **Shopify product integration** — Authenticated Admin GraphQL requests power product lookup and search for gift-product and promotion configuration.
4. **Shop-specific persistence** — Mongoose models store each store’s settings and promotional rules. A separate Prisma-backed session layer maintains Shopify authentication sessions.
5. **Theme extension delivery** — The Theme App Extension contains the QuickCart block plus Liquid snippets for timers, shipping bars, gift wrap, cart notes, progress bars, and announcement content.
6. **Real-time cart behavior** — Storefront JavaScript reads the cart state, recalculates progress toward thresholds, updates messages, and applies configured rules as customers change cart contents.
7. **Localization and support** — Locale dictionaries are available for the app and extension, while the help route and support API provide a merchant support channel.
8. **Lifecycle and privacy handling** — Shopify webhook routes handle uninstall, scope-update, and required customer/shop data privacy events.

## Resume-ready project description

Built **Upcart — Progress Bar & Upsell**, an embedded Shopify application and Theme App Extension for improving cart conversion and average order value. Delivered a customizable cart drawer with announcements, countdowns, upsells, free gifts, shipping thresholds, price/quantity/collection-based progress bars, Buy X Get Y offers, cart notes, delivery estimates, and third-party checkout integration. Developed with Remix, React, Shopify App Bridge, Polaris, Liquid, JavaScript, MongoDB/Mongoose, Prisma, and Shopify Admin GraphQL APIs.

## Notes

- All storefront components are delivered through the Shopify Theme App Extension, keeping the host theme’s core files untouched.
- Promotion and cart-drawer settings are stored per shop, allowing each merchant to maintain an independent configuration.
- Reward thresholds and tiers should be tested using a storefront cart before a promotion is published.
