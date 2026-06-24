# ClearAudit - Frontend (Client) 🎨

The frontend of ClearAudit is built with React, Tailwind CSS, and Vite. It provides two distinct, interactive dashboards for different user roles within the company.

## 👨‍💻 Worker Dashboard Features

The Worker Dashboard is designed for standard employees to easily submit and track their expenses.

- **AI Chat Assistant**: A conversational interface where workers can upload PDFs/images or simply type their expenses (e.g., "Audit $50 from Uber"). The AI automatically extracts the details.
- **File Uploads**: Direct file upload support for receipts and invoices.
- **Live Tracking**: A real-time data table displaying all submitted expenses and their live processing status (Extracting Data ➔ Categorizing ➔ Checking Policy ➔ Analyzing Risk ➔ Approved/Flagged).
- **Personal Metrics**: A quick overview of the worker's total submitted expenses, including approved, pending, and flagged counts.

## 👔 Chief Dashboard Features

The Chief Dashboard provides administrators and finance managers with a birds-eye view of company spending.

- **Company-Wide Metrics**: Real-time statistics showing the total money processed, overall company budget utilization, and the ratio of approved vs. flagged expenses.
- **Expense Triage**: A dedicated data table where chiefs can review expenses that the AI has flagged for fraud or policy violations. Chiefs have the authority to manually **Approve** or **Reject** these items.
- **Conversational Settings Management**: Chiefs can use the AI Chat Assistant to naturally update company policies (e.g., *"Update the monthly budget to $50000"*).
- **One-Click Reporting**: Chiefs can ask the AI to *"Generate the monthly report"*, and the system will automatically compile all expenses into a clean PDF and email it directly.
- **Employee Management**: A dedicated settings tab to add new employees and set individual limits.

## ⚙️ Setup & Installation

1. Open your terminal and navigate to this folder: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `client` folder:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server: `npm run dev` (Runs on port 5173)
