import { ImageResponse } from "next/og";
import { SITE_NAME, DEFAULT_TITLE } from "@/lib/site";

export const runtime = "edge";

export const alt = "ANSH Expense — Automated Team Expense & Reimbursement Tracker";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#09090b",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
          border: "2px solid #10b981",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Logo Brand Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "16px",
              }}
            >
              <span style={{ color: "#ffffff", fontWeight: "bold", fontSize: "24px" }}>Æ</span>
            </div>
            <span
              style={{
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "900",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {SITE_NAME}
            </span>
          </div>

          {/* Title / Value Prop */}
          <span
            style={{
              color: "#ffffff",
              fontSize: "64px",
              fontWeight: "800",
              lineHeight: "1.2",
              letterSpacing: "-0.02em",
              maxWidth: "900px",
              marginBottom: "20px",
            }}
          >
            Automated Team Expense & Reimbursement Tracker
          </span>

          <span
            style={{
              color: "#a1a1aa",
              fontSize: "24px",
              fontWeight: "500",
              lineHeight: "1.4",
              maxWidth: "800px",
            }}
          >
            Streamline receipt logging, tax compliance, project budgets, and manager approvals on a premium dashboard.
          </span>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #27272a",
            paddingTop: "32px",
          }}
        >
          <span style={{ color: "#10b981", fontSize: "18px", fontWeight: "700", letterSpacing: "0.05em" }}>
            Built for Bharat, Ready for the World
          </span>
          <span style={{ color: "#71717a", fontSize: "18px", fontWeight: "600" }}>
            anshapps.com/expense
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
