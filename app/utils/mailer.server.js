import nodemailer from "nodemailer";

function makeTransport() {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER || "920ddb002@smtp-brevo.com",
      pass: process.env.BREVO_PASS || "y2IFTnXJvhY1WM65",
    },
  });
}

export async function sendSupportEmail({ shop, name, email, description }) {
  const transporter = makeTransport();

  const adminHtml = `
    <h2>New Support Request from ${shop}</h2>
    <p><strong>Name:</strong> ${name || "-"}</p>
    <p><strong>Email:</strong> ${email || "-"}</p>
    <p><strong>Message:</strong><br/>${(description || "").replace(/\n/g, "<br/>")}</p>
  `;

  const userHtml = `
    <h2>Hi ${name || "there"},</h2>
    <p>We’ve received your request from <b>${shop}</b>. Our team will reply within 2 business days.</p>
    <hr/>
    ${adminHtml}
  `;

  // --- Admin notification
  const infoAdmin = await transporter.sendMail({
    from: `"Digi Sidekick Support" <${process.env.MAIL_FROM || "no-reply@yourdomain.com"}>`,
    to: "vikasprasad@digisidekick.com",
    cc: "vikasprasad2903@gmail.com",
    subject: `New Support Request — ${shop}`,
    html: adminHtml,
    replyTo: email || undefined,
  });

  // --- User confirmation
  if (email) {
    await transporter.sendMail({
      from: `"Digi Sidekick Support" <${process.env.MAIL_FROM || "no-reply@yourdomain.com"}>`,
      to: email,
      subject: `We received your support request`,
      html: userHtml,
    });
  }

  return { messageId: infoAdmin.messageId };
}