export const WHAT_EXPENSE_DOES = "ANSH Expense is a premium, state-of-the-art expense management and reimbursement tracker designed specifically for MSME teams. It streamlines receipt logging, tax/VAT calculations, project costing, and multi-stage manager approvals into one unified, blazing-fast dashboard.";

export const LANDING_FAQS = [
  {
    category: "Features",
    q: "What core features does ANSH Expense offer?",
    a: "ANSH Expense is a premium tool offering multi-currency claim logging, automatic VAT calculations, tax & compliance tools, dynamic client/project cost allocation, interactive spend analytics, and a multi-role workspace audit system (Employee, Manager, Admin, Owner)."
  },
  {
    category: "Security",
    q: "How secure is my financial data?",
    a: "Security is built in. All user sessions are authenticated securely via Supabase. Workspaces are strictly isolated at the database level using Prisma. Every action log is audited, and file uploads are handled with secure backend integrations."
  },
  {
    category: "Billing",
    q: "How does the seat license checkout work?",
    a: "Upgrading to a Pro plan is managed securely via our integrated Razorpay subscription portal. Workspace owners can dynamically add or remove seat licenses monthly or yearly. Payment statuses are tracked in real-time with instant access provisioning."
  },
  {
    category: "Uploads",
    q: "Where are receipt images and attachments stored?",
    a: "Attachments are uploaded to Cloudflare R2 object storage via a secure server-side API. If storage keys are not set, the platform uses a base64 Data URL fallback. Uploaded images are compressed client-side to keep storage lightweight."
  },
  {
    category: "Support",
    q: "How does the Help Center and Ticketing work?",
    a: "Users can raise tickets directly in the app's Help Center, attaching up to 3 compressed images. Support managers can manage, reply to, or delete tickets using the dedicated administrative Support Panel dashboard."
  }
];

export const ECOSYSTEM_LINKS = [
  { name: "ANSH Tasks", url: "https://tasks.anshapps.com" },
  { name: "ANSH HR", url: "https://hr.anshapps.com" },
  { name: "ANSH Expense", url: "https://expense.anshapps.com" },
  { name: "ANSH Visitor", url: "https://visitor.anshapps.com" }
];

export const EXPENSE_FEATURES = [
  "Multi-currency claims logging & receipt attachment support",
  "Automatic tax, VAT, and conversion calculation tools",
  "Dynamic client & project allocation mapping for billing costing",
  "Multi-stage manager approval workflows with real-time status tracking",
  "Interactive spend analytics & audit log trails for complete transparency",
  "Cloudflare R2 secure attachment vault and local compression",
  "Comprehensive Help Desk & support ticket management platform"
];
