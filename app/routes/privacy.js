export const loader = () => {
  const html = `

  <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UpCart Privacy Policy</title>
<style>
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 20px;
    background-color: #f9f9f9;
  }
  h1, h2 {
    color: #1a1a1a;
  }
  h1 {
    font-size: 28px;
    margin-bottom: 10px;
  }
  h2 {
    font-size: 20px;
    margin-top: 20px;
  }
  p, li {
    font-size: 14px;
    margin-bottom: 10px;
  }
  ul {
    margin-left: 20px;
  }
  a {
    color: #0073aa;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  .container {
    max-width: 800px;
    margin: auto;
    background: #fff;
    padding: 20px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }
</style>
</head>
<body>
<div class="container">
  <h1>UpCart – ProgressBar & Upsell Privacy Policy</h1>
  <p>UpCart – ProgressBar & Upsell provides merchants with tools to enhance their cart experience, including dynamic progress bars, BXGY offers, product incentives, upsell/cross-sell widgets, countdown timers, and announcement bars. This Privacy Policy explains how personal information is collected, used, and shared when you install or use the App in connection with your Shopify-supported store.</p>

  <h2>Personal Information the App Collects</h2>
  <p>When you install the App, we automatically access certain information from your Shopify account:</p>
  <ul>
    <li><strong>Shop Name:</strong> Your store's name (e.g., "yourstore.myshopify.com").</li>
    <li><strong>Store Theme Information:</strong> Accessed to manage and display app features like progress bars and upsells.</li>
    <li><strong>API Access:</strong> Permission to read and write your store's theme for enabling app functionality.</li>
  </ul>
  <p>We do not collect or store customer data, order information, or payment details.</p>
  <p>We also collect store owner information: name, email, phone number, and billing information.</p>

  <h2>Technologies Used</h2>
  <ul>
    <li><strong>Cookies:</strong> Small files placed on your device with anonymous identifiers. <a href="https://www.allaboutcookies.org" target="_blank">Learn more</a></li>
    <li><strong>Web Beacons, Tags, and Pixels:</strong> Used to monitor app usage and analyze performance.</li>
  </ul>

  <h2>How We Use Your Personal Information</h2>
  <ul>
    <li><strong>Optimize the App:</strong> Improve features such as progress bars, upsell widgets, and countdown timers.</li>
    <li><strong>Provide Information:</strong> Send relevant updates or notifications about the App’s functionality.</li>
  </ul>
  <p>We do not use your data for behavioral or targeted advertising.</p>

  <h2>Sharing Your Personal Information</h2>
  <p>We do not sell, share, or transmit your data. Data may be shared only to:</p>
  <ul>
    <li>Comply with legal obligations</li>
    <li>Respond to lawful requests or protect our rights</li>
  </ul>

  <h2>Data Retention</h2>
  <p>We retain store and owner data only while the app is installed. Upon uninstallation, all data is deleted immediately.</p>

  <h2>Changes to This Privacy Policy</h2>
  <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. Any updates will be posted here.</p>

  <h2>Contact</h2>
  <p>For questions about this Privacy Policy or your data, contact us at: <a href="mailto:support@digisidekick.com">support@digisidekick.com</a></p>
</div>
</body>
</html>

  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};
