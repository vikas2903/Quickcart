import nodemailer from "nodemailer";

const BREVO_USER = process.env.BREVO_SMTP_USER;
const BREVO_PASS = process.env.BREVO_SMTP_PASS;

function makeTransport() {
  // Prefer Brevo in prod; fall back to Ethereal if present
  if (BREVO_USER && BREVO_PASS) {
    return nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: { user: BREVO_USER, pass: BREVO_PASS },
    });
  }
 
  throw new Error("No SMTP credentials. Set BREVO_* or ETH_* envs.");
}

export async function sendSupportEmail({shop, name, email, storeEmail, description}) {
  const transporter = makeTransport();

  const adminHtml = `
    <h2>New Support Request from ${shop}</h2>
    <p><strong>Name:</strong> ${name || "-"}</p>
    <p><strong>Email:</strong> ${email || "-"}</p>
    <p><strong>Store Email:</strong> ${storeEmail || "-"}</p>
    <p><strong>Message:</strong><br/>${(description || "").replace(/\n/g,"<br/>")}</p>
  `;

  const userHtml = `
    <h2>Hi ${name || "there"},</h2>
    <p>We’ve received your request from <b>${shop}</b>. Our team will reply within 2 business days.</p>
    <hr/>
    ${adminHtml}
  `;

  const infoAdmin = await transporter.sendMail({
    from: `"Digi Sidekick Support" <${process.env.MAIL_FROM || "no-reply@yourdomain.com"}>`,
    to: "vikasprasad@digisidekick.com",
    cc: "vikasprasad2903@gmail.com",
    subject: `New Support Request — ${shop}`,
    html: adminHtml,
  });

  let previewUrlAdmin = nodemailer.getTestMessageUrl?.(infoAdmin);

  if (email) {
    const infoUser = await transporter.sendMail({
      from: `"Digi Sidekick Support" <${process.env.MAIL_FROM || "no-reply@yourdomain.com"}>`,
      to: email,
      subject: `We received your support request`,
      html: userHtml,
    });
    var previewUrlUser = nodemailer.getTestMessageUrl?.(infoUser);
  }

  return {messageId: infoAdmin.messageId, previewUrlAdmin, previewUrlUser};
}
