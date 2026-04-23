const nodemailer = require("nodemailer");

const sendInvoiceEmail = async (toEmail, invoiceNumber, pdfBuffer) => {
  try {
    // Automatically generate a fake testing account
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter using the fake Ethereal SMTP server
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const mailOptions = {
      from: '"CS308 Store" <noreply@cs308store.com>',
      to: toEmail,
      subject: `Your Invoice for Order #${invoiceNumber} - CS308 Store`,
      text: "Thank you for your purchase! Please find your invoice attached.",
      attachments: [
        {
          filename: `Invoice_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    
    // This logs a clickable link to your terminal where you can view the sent email and PDF!
    console.log("Email sent successfully!");
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

module.exports = { sendInvoiceEmail };