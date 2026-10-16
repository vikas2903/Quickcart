const NAMESPACE = "custom";
const MAX_TEXT_LENGTH = 255;
const MAX_IMAGE_URL_LENGTH = 2048;

export const CART_DRAWER_BOTTOM_CONTENT_METAFIELDS = Object.freeze({
  text: Object.freeze({ namespace: NAMESPACE, key: "quickcart_cart_drawer_bottom_text" }),
  imageUrl: Object.freeze({ namespace: NAMESPACE, key: "quickcart_cart_drawer_bottom_image_url" }),
});

export function normalizeCartDrawerBottomContent(value = {}) {
  const text = String(value.text || "").trim().slice(0, MAX_TEXT_LENGTH);
  const imageUrl = String(value.imageUrl || "").trim().slice(0, MAX_IMAGE_URL_LENGTH);

  if (imageUrl) {
    let url;
    try {
      url = new URL(imageUrl);
    } catch {
      throw new Error("Bottom cart image must be a valid HTTPS image URL");
    }

    if (url.protocol !== "https:") {
      throw new Error("Bottom cart image must use an HTTPS URL");
    }
  }

  return { text, imageUrl };
}

function getErrorMessage(payload) {
  if (payload?.errors?.length) {
    return payload.errors.map((error) => error.message).join(", ");
  }

  const errors = payload?.data?.metafieldsSet?.userErrors ||
    payload?.data?.metafieldsDelete?.userErrors ||
    [];
  return errors.map((error) => error.message).filter(Boolean).join(", ");
}

async function getShopId(admin) {
  const response = await admin.graphql(`query GetShopForCartDrawerBottomContent { shop { id } }`);
  const payload = await response.json();

  if (payload?.errors?.length || !payload?.data?.shop?.id) {
    throw new Error(payload?.errors?.[0]?.message || "Unable to access shop metafields");
  }

  return payload.data.shop.id;
}

export async function readCartDrawerBottomContentMetafields(admin) {
  const response = await admin.graphql(`
    query GetCartDrawerBottomContent($namespace: String!, $textKey: String!, $imageKey: String!) {
      shop {
        text: metafield(namespace: $namespace, key: $textKey) { value }
        imageUrl: metafield(namespace: $namespace, key: $imageKey) { value }
      }
    }
  `, {
    variables: {
      namespace: NAMESPACE,
      textKey: CART_DRAWER_BOTTOM_CONTENT_METAFIELDS.text.key,
      imageKey: CART_DRAWER_BOTTOM_CONTENT_METAFIELDS.imageUrl.key,
    },
  });
  const payload = await response.json();

  if (payload?.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  return normalizeCartDrawerBottomContent({
    text: payload?.data?.shop?.text?.value,
    imageUrl: payload?.data?.shop?.imageUrl?.value,
  });
}

export async function saveCartDrawerBottomContentMetafields(admin, value) {
  const content = normalizeCartDrawerBottomContent(value);
  const shopId = await getShopId(admin);
  const metafields = [];
  const metafieldsToDelete = [];

  [
    ["text", "single_line_text_field"],
    ["imageUrl", "url"],
  ].forEach(([field, type]) => {
    const definition = CART_DRAWER_BOTTOM_CONTENT_METAFIELDS[field];
    const fieldValue = content[field];

    if (fieldValue) {
      metafields.push({
        ownerId: shopId,
        namespace: definition.namespace,
        key: definition.key,
        type,
        value: fieldValue,
      });
    } else {
      metafieldsToDelete.push({
        ownerId: shopId,
        namespace: definition.namespace,
        key: definition.key,
      });
    }
  });

  if (metafields.length) {
    const response = await admin.graphql(`
      mutation SaveCartDrawerBottomContent($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors { field message }
        }
      }
    `, { variables: { metafields } });
    const payload = await response.json();
    const errorMessage = getErrorMessage(payload);
    if (errorMessage) throw new Error(errorMessage);
  }

  if (metafieldsToDelete.length) {
    const response = await admin.graphql(`
      mutation DeleteCartDrawerBottomContent($metafields: [MetafieldIdentifierInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          userErrors { field message }
        }
      }
    `, { variables: { metafields: metafieldsToDelete } });
    const payload = await response.json();
    const errorMessage = getErrorMessage(payload);
    if (errorMessage) throw new Error(errorMessage);
  }

  return content;
}
