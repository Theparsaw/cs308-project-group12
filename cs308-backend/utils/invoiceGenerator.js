const PDFDocument = require("pdfkit");

const generateInvoicePDF = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text("INVOICE", { align: "right" });
      doc.fontSize(10).text(`Invoice Number: INV-${order._id}`, { align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
      doc.moveDown();

      // Customer Info
      doc.fontSize(12).text("Billed To:");
      doc.fontSize(10).text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Address: ${user.address || "Not provided"}`);
      doc.moveDown(2);

      // Items Table
      doc.fontSize(12).text("Items Purchased:", { underline: true });
      doc.moveDown();
      
      order.items.forEach(item => {
        doc.fontSize(10).text(
          `${item.name} - Qty: ${item.quantity} x $${item.unitPrice}`
        );
      });

      doc.moveDown();
      doc.fontSize(14).text(`Total: $${order.totalPrice}`, { align: "right", bold: true });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
