import { json } from "@remix-run/node";
import { Layout, Page, Grid , BlockStack, LegacyCard, Checkbox, Select} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";


// React Component
import {useState, useCallback} from 'react';

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function FreeProduct() {
  // const { shop } = useLoaderData(); 
  // console.log("#StoreName in freeproduct.jsx:", shop);

  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState('Select Product');
  

  const handleChange = useCallback((newChecked) => setChecked(newChecked), []);
  const handleSelectChange = useCallback((value) => setSelected(value), []);

   const options = [
    {label: 'Select Product', value: ' '},
    {label: 'Today', value: 'today'},
    {label: 'Yesterday', value: 'yesterday'},
    {label: 'Last 7 days', value: 'lastWeek'},
  ];

  // console.log('Checkbox checked:', checked);
  // console.log('Selected option:', selected);

  return (
    <Page>
      <TitleBar title="Free Product" />
      <Layout>
        <Layout.Section>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
               <LegacyCard sectioned>
                <BlockStack gap={500}>
                   <Checkbox label="Enable Free Product" checked={checked} onChange={handleChange} />
                   <Select label="Select Product" options={options} onChange={handleSelectChange} value={selected} />
                </BlockStack>
               </LegacyCard>  
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
              <LegacyCard sectioned>
                  <BlockStack gap={500}>
                    Image Previews
                  </BlockStack>
                </LegacyCard>
            </Grid.Cell>
          </Grid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
