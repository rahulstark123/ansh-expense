import { SITE_NAME } from "@/lib/site";
import { WHAT_EXPENSE_DOES, EXPENSE_FEATURES, LANDING_FAQS } from "@/lib/landing-seo";

export function LandingSeoContent() {
  return (
    <noscript>
      <div style={{ display: "none" }}>
        <h1>{SITE_NAME} — Automated Team Expense & Reimbursement Tracker</h1>
        <p>{WHAT_EXPENSE_DOES}</p>
        
        <h2>Key Features of {SITE_NAME}</h2>
        <ul>
          {EXPENSE_FEATURES.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
        
        <h2>Frequently Asked Questions</h2>
        {LANDING_FAQS.map((faq, idx) => (
          <div key={idx}>
            <h3>{faq.q}</h3>
            <p>{faq.a}</p>
          </div>
        ))}
      </div>
    </noscript>
  );
}
export default LandingSeoContent;
