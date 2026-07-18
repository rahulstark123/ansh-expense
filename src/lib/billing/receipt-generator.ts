import { prisma } from "@/lib/db";
import { isS3Configured, putObject } from "@/lib/s3";
import { buildReceiptPdf, ReceiptPdfInput } from "./receipt-pdf";

export async function generateReceipt(transactionId: string): Promise<void> {
  try {
    // 1. Idempotency check: If a receipt already exists for this transaction, skip
    const existing = await prisma.receipt.findUnique({
      where: { transactionId },
    });
    if (existing) {
      console.log(`Receipt already exists for transaction ${transactionId}, skipping generation.`);
      return;
    }

    // 2. Load the transaction with workspace and subscription details
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        workspace: true,
        subscription: true,
      },
    });

    if (!transaction) {
      console.error(`Transaction ${transactionId} not found, cannot generate receipt.`);
      return;
    }

    if (!transaction.workspace) {
      console.error(`Workspace not found for transaction ${transactionId}, cannot generate receipt.`);
      return;
    }

    // 3. Find the owner/admin who purchased the plan
    const owner = await prisma.employee.findFirst({
      where: {
        wid: transaction.workspaceId,
        role: { in: ["Owner", "Admin"] },
      },
      orderBy: { createdAt: "asc" },
    });

    // 4. Generate unique, stable receipt and invoice numbers from the transaction ID
    const year = new Date(transaction.createdAt).getFullYear();
    const suffix = transaction.id.slice(-6).toUpperCase();
    const receiptNumber = `RCPT-${year}-${suffix}`;
    const invoiceNumber = `INV-${year}-${suffix}`;

    // 5. Calculate descriptions
    const seatsCount = transaction.subscription?.seatsCount || 1;
    const billingCycleText = transaction.subscription?.billingCycle === "yearly" ? "Yearly" : "Monthly";
    const planLabel = "ANSH Expense Pro Tier License";
    const descriptionText = `${seatsCount} Seat License(s) - Pro ${billingCycleText} Plan`;

    // Resolve state and country for GST tax rules
    let address = owner?.companyAddress || "";
    if (!address && transaction.workspace.settingsJson) {
      try {
        const settings = JSON.parse(transaction.workspace.settingsJson);
        address = settings.companyProfile?.address || "";
      } catch (e) {
        console.error("Failed to parse settingsJson in generateReceipt:", e);
      }
    }

    let billingState: string | null = null;
    let billingCountry: string | null = null;

    if (address) {
      if (/bihar|muzaffarpur|patna/i.test(address)) {
        billingState = "Bihar";
      } else {
        billingState = "Other State";
      }

      if (/india|delhi|mumbai|bangalore|bihar|patna|karnataka|maharashtra|haryana|up|punjab|tamil|gujarat|telangana/i.test(address)) {
        billingCountry = "IN";
      }
    }

    if (!billingCountry) {
      billingCountry = transaction.currency.toUpperCase() === "INR" ? "IN" : "US";
    }

    // 6. Map into ReceiptPdfInput structure
    const input: ReceiptPdfInput = {
      receiptNumber,
      invoiceNumber,
      issuedAt: transaction.createdAt || new Date(),
      customerName: owner?.companyName || transaction.workspace.name || `Workspace #${transaction.workspaceId}`,
      ownerName: owner?.name || "Workspace Member",
      ownerEmail: owner?.email,
      ownerPhone: owner?.phoneNumber,
      description: descriptionText,
      planLabel,
      qty: seatsCount,
      amountMinor: transaction.amountPaisa,
      currency: transaction.currency || "INR",
      gatewayOrderId: transaction.razorpayOrderId,
      gatewayPaymentId: transaction.razorpayPaymentId,
      periodStart: transaction.subscription?.startsAt,
      periodEnd: transaction.subscription?.expiresAt,
      billingState,
      billingCountry,
    };

    // 7. Render PDF Buffer
    const pdfBuffer = await buildReceiptPdf(input);

    // 8. Upload to S3/R2 if configured, or fallback to database blob storage
    let pdfKey: string | null = null;
    let pdfData: Buffer | null = null;

    if (isS3Configured()) {
      pdfKey = `receipts/${transaction.workspaceId}/${receiptNumber}.pdf`;
      try {
        await putObject(pdfKey, pdfBuffer, "application/pdf");
      } catch (uploadError) {
        console.error("Failed to upload receipt to S3, falling back to database storage:", uploadError);
        pdfData = pdfBuffer;
      }
    } else {
      pdfData = pdfBuffer;
    }

    // 9. Insert Receipt record
    await prisma.receipt.create({
      data: {
        workspaceId: transaction.workspaceId,
        transactionId: transaction.id,
        receiptNumber,
        invoiceNumber,
        amountPaisa: transaction.amountPaisa,
        currency: transaction.currency,
        billingState,
        billingCountry,
        pdfKey,
        pdfData: pdfData as any,
      },
    });

    console.log(`Successfully generated and saved receipt ${receiptNumber} for transaction ${transactionId}.`);
  } catch (error) {
    console.error(`Error generating receipt for transaction ${transactionId}:`, error);
  }
}
