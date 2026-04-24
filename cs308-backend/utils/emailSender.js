const nodemailer = require("nodemailer");

const createTransporter = async () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendInvoiceEmail = async (toEmail, invoiceNumber, pdfBuffer) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || '"CS308 Store" <noreply@cs308store.com>',
      to: toEmail,
      subject: `Your Invoice for Order #${invoiceNumber} - CS308 Store`,
      text: "Thank you for choosing CS308 Store! Please find your invoice attached.",
      attachments: [
        {
          filename: `Invoice_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`Invoice email sent to ${toEmail}`);
    if (previewUrl) {
      console.log("Preview URL: %s", previewUrl);
    }
    
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

module.exports = { sendInvoiceEmail };
