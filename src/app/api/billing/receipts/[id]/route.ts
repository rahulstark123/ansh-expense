import { NextResponse } from "next/server";
import { getBillingAuthorizedEmployee, getEmployeeWorkspaceId } from "@/lib/billing/auth";
import { prisma } from "@/lib/db";
import { getObjectBytes } from "@/lib/s3";
import { buildReceiptPdf, ReceiptPdfInput } from "@/lib/billing/receipt-pdf";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employee = await getBillingAuthorizedEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const workspaceId = getEmployeeWorkspaceId(employee);

    // Fetch receipt from DB
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        transaction: {
          include: {
            subscription: true,
          },
        },
        workspace: true,
      },
    });

    if (!receipt || receipt.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // 1. Try reading from S3/R2 if key is set
    if (receipt.pdfKey) {
      try {
        const { bytes } = await getObjectBytes(receipt.pdfKey);
        return new NextResponse(Buffer.from(bytes), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${receipt.receiptNumber}.pdf"`,
            "Cache-Control": "private, max-age=3600",
          },
        });
      } catch (s3Error) {
        console.error(`S3 read error for key ${receipt.pdfKey}, falling back to DB/regeneration:`, s3Error);
      }
    }

    // 2. Try reading from DB blob bytes
    if (receipt.pdfData) {
      return new NextResponse(Buffer.from(receipt.pdfData), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${receipt.receiptNumber}.pdf"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // 3. Fallback: Regenerate on the fly if files were lost or not created
    console.log(`Receipt files missing for ID ${receipt.id}, regenerating on the fly.`);
    const transaction = receipt.transaction;
    if (!transaction) {
      return NextResponse.json({ error: "Transaction details missing, cannot regenerate receipt" }, { status: 404 });
    }

    const owner = await prisma.employee.findFirst({
      where: {
        wid: transaction.workspaceId,
        role: { in: ["Owner", "Admin"] },
      },
      orderBy: { createdAt: "asc" },
    });

    const seatsCount = transaction.subscription?.seatsCount || 1;
    const billingCycleText = transaction.subscription?.billingCycle === "yearly" ? "Yearly" : "Monthly";
    const planLabel = "ANSH Expense Pro Tier License";
    const descriptionText = `${seatsCount} Seat License(s) - Pro ${billingCycleText} Plan`;

    const input: ReceiptPdfInput = {
      receiptNumber: receipt.receiptNumber,
      invoiceNumber: receipt.invoiceNumber,
      issuedAt: receipt.createdAt,
      customerName: owner?.companyName || receipt.workspace.name || `Workspace #${receipt.workspaceId}`,
      ownerName: owner?.name || "Workspace Member",
      ownerEmail: owner?.email,
      ownerPhone: owner?.phoneNumber,
      description: descriptionText,
      planLabel,
      qty: seatsCount,
      amountMinor: transaction.amountPaisa,
      currency: transaction.currency,
      gatewayOrderId: transaction.razorpayOrderId,
      gatewayPaymentId: transaction.razorpayPaymentId,
      periodStart: transaction.subscription?.startsAt,
      periodEnd: transaction.subscription?.expiresAt,
      billingState: receipt.billingState,
      billingCountry: receipt.billingCountry,
    };

    const pdfBuffer = await buildReceiptPdf(input);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${receipt.receiptNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/billing/receipts/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
