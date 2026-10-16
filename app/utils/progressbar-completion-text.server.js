const NAMESPACE = "custom";
const MAX_COMPLETION_TEXT_LENGTH = 255;

export const COMPLETION_TEXT_METAFIELDS = Object.freeze({
  price: Object.freeze({
    namespace: NAMESPACE,
    key: "quickcart_price_progress_completion_text",
  }),
  quantity: Object.freeze({
    namespace: NAMESPACE,
    key: "quickcart_quantity_progress_completion_text",
  }),
});

export function normalizeCompletionText(value) {
  return String(value || "").trim().slice(0, MAX_COMPLETION_TEXT_LENGTH);
}

function getUserErrorMessage(payload) {
  const errors = payload?.data?.metafieldsSet?.userErrors ||
    payload?.data?.metafieldsDelete?.userErrors ||
    [];

  if (payload?.errors?.length) {
    return payload.errors.map((error) => error.message).join(", ");
  }

  return errors.map((error) => error.message).filter(Boolean).join(", ");
}

async function getShopId(admin) {
  const response = await admin.graphql(`
    query GetShopForProgressBarCompletionText {
      shop {
        id
      }
    }
  `);
  const payload = await response.json();

  if (payload?.errors?.length || !payload?.data?.shop?.id) {
    throw new Error(payload?.errors?.[0]?.message || "Unable to access the shop metafields");
  }

  return payload.data.shop.id;
}

export async function readCompletionTextMetafield(admin, definition) {
  const response = await admin.graphql(
    `
      query GetProgressBarCompletionText($namespace: String!, $key: String!) {
        shop {
          metafield(namespace: $namespace, key: $key) {
            value
          }
        }
      }
    `,
    {
      variables: {
        namespace: definition.namespace,
        key: definition.key,
      },
    },
  );
  const payload = await response.json();

  if (payload?.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  return normalizeCompletionText(payload?.data?.shop?.metafield?.value);
}

export async function saveCompletionTextMetafield(admin, definition, value) {
  const completionText = normalizeCompletionText(value);
  const shopId = await getShopId(admin);

  if (!completionText) {
    const response = await admin.graphql(
      `
        mutation DeleteProgressBarCompletionText($metafields: [MetafieldIdentifierInput!]!) {
          metafieldsDelete(metafields: $metafields) {
            deletedMetafields {
              key
              namespace
              ownerId
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          metafields: [
            {
              ownerId: shopId,
              namespace: definition.namespace,
              key: definition.key,
            },
          ],
        },
      },
    );
    const payload = await response.json();
    const errorMessage = getUserErrorMessage(payload);

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return "";
  }

  const response = await admin.graphql(
    `
      mutation SaveProgressBarCompletionText($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: definition.namespace,
            key: definition.key,
            type: "single_line_text_field",
            value: completionText,
          },
        ],
      },
    },
  );
  const payload = await response.json();
  const errorMessage = getUserErrorMessage(payload);

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return completionText;
}
