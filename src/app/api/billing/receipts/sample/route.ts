import { NextResponse } from "next/server";
import { getBillingAuthorizedEmployee } from "@/lib/billing/auth";
import { buildReceiptPdf, ReceiptPdfInput } from "@/lib/billing/receipt-pdf";

export async function GET(req: Request) {
  try {
    const employee = await getBillingAuthorizedEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock input data for testing design layout
    const sampleInput: ReceiptPdfInput = {
      receiptNumber: "RCPT-2026-MOCK99",
      invoiceNumber: "INV-2026-MOCK99",
      issuedAt: new Date(),
      customerName: "Acme Analytics Systems Private Limited",
      ownerName: "Sanjay Kumar",
      ownerEmail: "sanjay.kumar@acmeanalytics.in",
      ownerPhone: "+91 98765 43210",
      description: "5 Seat License(s) - Pro Monthly Plan",
      planLabel: "ANSH Expense Pro Tier Seat License",
      qty: 5,
      amountMinor: 117410, // INR 1,174.10 (inclusive of 18% GST on base INR 995.00)
      currency: "INR",
      gatewayOrderId: "order_mock12345order",
      gatewayPaymentId: "pay_mock98765payment",
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      billingState: "Delhi",
      billingCountry: "IN",
    };

    const pdfBuffer = await buildReceiptPdf(sampleInput);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="sample_receipt.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/billing/receipts/sample error:", error);
    return NextResponse.json({ error: "Failed to generate sample receipt" }, { status: 500 });
  }
}
