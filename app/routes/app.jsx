import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Dashboard</Link>
        <Link to="/app/settings">Cart customization</Link>
        <Link to="/app/progressbar-guide">Progress bar guide</Link>
        <Link to="/app/progressbar">Price based progress bar</Link>
        <Link to="/app/quantitytrieddiscount">Quantity based progress bar</Link>
        <Link to="/app/progressbaron1">Buy X Get Y progress bar</Link>
        <Link to="/app/collection-based-progressbar-qty-price-based-modals">Collection based progress bar</Link>
        <Link to="/app/giftproduct">Free gift setup</Link>
        <Link to="/app/documentation">Documentation</Link>
        <Link to="/app/help">Help and support</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
}; 
