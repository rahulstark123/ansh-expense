import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ReceiptPdfInput = {
  receiptNumber: string;
  invoiceNumber: string;
  issuedAt: Date;
  customerName: string;      // workspace name
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  description: string;
  planLabel: string;
  qty: number;
  amountMinor: number;       // paisa (INR) or cents (USD)
  currency: string;          // INR | USD
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  billingState?: string | null;
  billingCountry?: string | null;
};

// Strips non-ASCII characters and replaces Rupee symbols to prevent pdf-lib crash (Helvetica only supports WinAnsi)
function pdfSafe(str: string): string {
  if (!str) return "";
  return str
    .replace(/₹/g, "INR ")
    .replace(/[^\x00-\x7F]/g, "");
}

// Format date consistently
function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function buildReceiptPdf(input: ReceiptPdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 page dimensions
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const totalAmount = input.amountMinor / 100;
  const isINR = input.currency.toUpperCase() === "INR";
  const isOutsideIndia = !isINR || (input.billingCountry && input.billingCountry.toUpperCase() !== "IN");
  
  // Tax calculations
  let baseAmount = totalAmount;
  let gstAmount = 0;
  if (!isOutsideIndia) {
    baseAmount = totalAmount / 1.18;
    gstAmount = totalAmount - baseAmount;
  }

  const isBihar = !isOutsideIndia && input.billingState && input.billingState.toLowerCase().includes("bihar");

  // --- DRAW HEADER BAR (Slate Gray) ---
  page.drawRectangle({
    x: 50,
    y: 720,
    width: 495.28,
    height: 80,
    color: rgb(0.08, 0.12, 0.18), // rgb 20, 30, 46
  });

  // Left header info
  page.drawText("ANSH APPS", {
    x: 65,
    y: 772,
    size: 16,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("ANSH Expense", {
    x: 65,
    y: 754,
    size: 11,
    font: helveticaBold,
    color: rgb(0.9, 0.92, 0.95),
  });
  page.drawText("Premium Workspace Ecosystem", {
    x: 65,
    y: 738,
    size: 8,
    font: helveticaFont,
    color: rgb(0.7, 0.73, 0.78),
  });

  // Right header info
  page.drawText("PAYMENT RECEIPT", {
    x: 350,
    y: 765,
    size: 14,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText(`Receipt: ${pdfSafe(input.receiptNumber)}`, {
    x: 350,
    y: 748,
    size: 8,
    font: helveticaFont,
    color: rgb(0.7, 0.73, 0.78),
  });
  page.drawText(`Invoice: ${pdfSafe(input.invoiceNumber)}`, {
    x: 350,
    y: 735,
    size: 8,
    font: helveticaFont,
    color: rgb(0.7, 0.73, 0.78),
  });

  // --- DRAW META CARDS ---
  // Left: Billed to
  page.drawRectangle({
    x: 50,
    y: 605,
    width: 240,
    height: 95,
    borderColor: rgb(0.9, 0.92, 0.95),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.99),
  });
  page.drawText("BILLED TO", {
    x: 65,
    y: 682,
    size: 8,
    font: helveticaBold,
    color: rgb(0.5, 0.55, 0.6),
  });
  page.drawText(pdfSafe(input.customerName), {
    x: 65,
    y: 668,
    size: 10,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.2),
  });
  if (input.ownerName) {
    page.drawText(`Attn: ${pdfSafe(input.ownerName)}`, {
      x: 65,
      y: 654,
      size: 8,
      font: helveticaFont,
      color: rgb(0.3, 0.35, 0.4),
    });
  }
  if (input.ownerEmail) {
    page.drawText(`Email: ${pdfSafe(input.ownerEmail)}`, {
      x: 65,
      y: 641,
      size: 8,
      font: helveticaFont,
      color: rgb(0.3, 0.35, 0.4),
    });
  }
  if (input.ownerPhone) {
    page.drawText(`Phone: ${pdfSafe(input.ownerPhone)}`, {
      x: 65,
      y: 628,
      size: 8,
      font: helveticaFont,
      color: rgb(0.3, 0.35, 0.4),
    });
  }

  // Right: Document Details
  page.drawRectangle({
    x: 305,
    y: 605,
    width: 240,
    height: 95,
    borderColor: rgb(0.9, 0.92, 0.95),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.99),
  });
  page.drawText("RECEIPT DETAILS", {
    x: 320,
    y: 682,
    size: 8,
    font: helveticaBold,
    color: rgb(0.5, 0.55, 0.6),
  });
  page.drawText(`Date Issued: ${formatDate(input.issuedAt)}`, {
    x: 320,
    y: 668,
    size: 9,
    font: helveticaFont,
    color: rgb(0.2, 0.25, 0.3),
  });
  page.drawText(`Payment Method: Razorpay`, {
    x: 320,
    y: 654,
    size: 9,
    font: helveticaFont,
    color: rgb(0.2, 0.25, 0.3),
  });
  
  // Status Pill
  page.drawRectangle({
    x: 320,
    y: 626,
    width: 50,
    height: 18,
    color: rgb(0.88, 0.97, 0.92), // light green
    borderColor: rgb(0.7, 0.9, 0.8),
    borderWidth: 0.5,
  });
  page.drawText("PAID", {
    x: 333,
    y: 631,
    size: 8,
    font: helveticaBold,
    color: rgb(0.05, 0.45, 0.2),
  });

  // --- DRAW LINE ITEMS TABLE ---
  // Teal table header
  page.drawRectangle({
    x: 50,
    y: 555,
    width: 495.28,
    height: 25,
    color: rgb(0.05, 0.45, 0.45), // teal
  });
  page.drawText("DESCRIPTION", {
    x: 65,
    y: 563,
    size: 8,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("QTY", {
    x: 380,
    y: 563,
    size: 8,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("AMOUNT", {
    x: 450,
    y: 563,
    size: 8,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  // Line item row
  page.drawRectangle({
    x: 50,
    y: 475,
    width: 495.28,
    height: 80,
    borderColor: rgb(0.9, 0.92, 0.95),
    borderWidth: 1,
  });

  page.drawText(pdfSafe(input.planLabel), {
    x: 65,
    y: 535,
    size: 10,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.2),
  });
  
  page.drawText(pdfSafe(input.description), {
    x: 65,
    y: 520,
    size: 8.5,
    font: helveticaFont,
    color: rgb(0.4, 0.45, 0.5),
  });

  if (input.periodStart && input.periodEnd) {
    const periodText = `Billing Period: ${formatDate(input.periodStart)} to ${formatDate(input.periodEnd)}`;
    page.drawText(periodText, {
      x: 65,
      y: 505,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.55, 0.6),
    });
  }

  page.drawText(String(input.qty), {
    x: 380,
    y: 525,
    size: 9.5,
    font: helveticaFont,
    color: rgb(0.1, 0.15, 0.2),
  });

  page.drawText(`${input.currency} ${baseAmount.toFixed(2)}`, {
    x: 450,
    y: 525,
    size: 9.5,
    font: helveticaFont,
    color: rgb(0.1, 0.15, 0.2),
  });

  // --- DRAW TOTALS ---
  // Subtotal / Taxable Value
  page.drawText("Taxable Value:", {
    x: 360,
    y: 450,
    size: 9,
    font: helveticaFont,
    color: rgb(0.4, 0.45, 0.5),
  });
  page.drawText(`${input.currency} ${baseAmount.toFixed(2)}`, {
    x: 450,
    y: 450,
    size: 9,
    font: helveticaFont,
    color: rgb(0.1, 0.15, 0.2),
  });

  let currentY = 435;

  if (isOutsideIndia) {
    page.drawText("GST (0%):", {
      x: 360,
      y: currentY,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.4, 0.45, 0.5),
    });
    page.drawText(`${input.currency} 0.00`, {
      x: 450,
      y: currentY,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.1, 0.15, 0.2),
    });
    currentY -= 15;
  } else if (isBihar) {
    // Intra-state (Bihar): CGST 9% + SGST 9%
    page.drawText("CGST (9%):", {
      x: 360,
      y: currentY,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.4, 0.45, 0.5),
    });
    page.drawText(`${input.currency} ${(gstAmount / 2).toFixed(2)}`, {
      x: 450,
      y: currentY,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.1, 0.15, 0.2),
    });
    currentY -= 15;

    page.drawText("SGST (9%):", {
      x: 360,
      y: currentY,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.4, 0.45, 0.5),
    });
    page.drawText(`${input.currency} ${(gstAmount / 2).toFixed(2)}`, {
      x: 450,
      y: currentY,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.1, 0.15, 0.2),
    });
    currentY -= 15;
  } else {
    // Inter-state (Other states): IGST 18%
    page.drawText("IGST (18%):", {
      x: 360,
      y: currentY,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.4, 0.45, 0.5),
    });
    page.drawText(`${input.currency} ${gstAmount.toFixed(2)}`, {
      x: 450,
      y: currentY,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.1, 0.15, 0.2),
    });
    currentY -= 15;
  }

  // Total Paid accent band
  const bandY = currentY - 15;
  page.drawRectangle({
    x: 300,
    y: bandY,
    width: 245,
    height: 30,
    color: rgb(0.93, 0.98, 0.98), // light teal
  });
  
  page.drawText("TOTAL PAID (NET):", {
    x: 312,
    y: bandY + 11,
    size: 9,
    font: helveticaBold,
    color: rgb(0.05, 0.45, 0.45),
  });
  
  page.drawText(`${input.currency} ${totalAmount.toFixed(2)}`, {
    x: 450,
    y: bandY + 11,
    size: 10,
    font: helveticaBold,
    color: rgb(0.05, 0.45, 0.45),
  });

  // --- DRAW PAYMENT REFERENCE BOX ---
  const refBoxY = bandY - 100;
  page.drawRectangle({
    x: 50,
    y: refBoxY,
    width: 495.28,
    height: 80,
    borderColor: rgb(0.9, 0.92, 0.95),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.99),
  });
  page.drawText("PAYMENT GATEWAY REFERENCE", {
    x: 65,
    y: refBoxY + 62,
    size: 8,
    font: helveticaBold,
    color: rgb(0.5, 0.55, 0.6),
  });
  page.drawText(`Provider: Razorpay Secure`, {
    x: 65,
    y: refBoxY + 46,
    size: 8.5,
    font: helveticaFont,
    color: rgb(0.3, 0.35, 0.4),
  });
  page.drawText(`Razorpay Order ID: ${pdfSafe(input.gatewayOrderId)}`, {
    x: 65,
    y: refBoxY + 31,
    size: 8.5,
    font: helveticaFont,
    color: rgb(0.3, 0.35, 0.4),
  });
  if (input.gatewayPaymentId) {
    page.drawText(`Razorpay Payment ID: ${pdfSafe(input.gatewayPaymentId)}`, {
      x: 65,
      y: refBoxY + 16,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.3, 0.35, 0.4),
    });
  }

  // --- DRAW LEGAL FOOTER ---
  page.drawText("ANSH APPS PRIVATE LIMITED", {
    x: 50,
    y: 160,
    size: 9,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.2),
  });
  page.drawText("Corporate Registry Details:", {
    x: 50,
    y: 147,
    size: 8,
    font: helveticaBold,
    color: rgb(0.4, 0.45, 0.5),
  });
  page.drawText("GSTIN: 10DIUPR1358M1ZP | Udyam Registration: UDYAM-BR-23-0127857", {
    x: 50,
    y: 135,
    size: 8,
    font: helveticaFont,
    color: rgb(0.4, 0.45, 0.5),
  });
  page.drawText("Corporate Address: Muzaffarpur, Bihar, India 842001", {
    x: 50,
    y: 123,
    size: 8,
    font: helveticaFont,
    color: rgb(0.4, 0.45, 0.5),
  });
  page.drawText("For billing support, reach out to support@anshapps.com", {
    x: 50,
    y: 111,
    size: 8,
    font: helveticaFont,
    color: rgb(0.4, 0.45, 0.5),
  });

  page.drawText("This is a computer-generated payment receipt and does not require a physical signature.", {
    x: 50,
    y: 75,
    size: 8,
    font: helveticaFont,
    color: rgb(0.6, 0.63, 0.68),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
