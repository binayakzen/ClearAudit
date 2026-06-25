# ClearAudit — Enterprise AI-Powered Expense Auditing Platform 🚀📈

![ClearAudit Hero Cover](./docs/cover.png)

**ClearAudit** is a state-of-the-art, autonomous multi-agent corporate expense auditing platform. Designed to eliminate boardroom approval bottlenecks and manual accounting friction, ClearAudit leverages **Google Gemini AI** agents orchestrated by a reactive **Node.js Express** backend and a modern **React Single Page Application (SPA)** interface to deliver zero-latency expense lifecycle management.

---

## 🏛️ System Architecture & Multi-Agent Topology

![ClearAudit Complex Architecture](./docs/architecture.png)

ClearAudit is structured around a central **State Machine Orchestrator** that coordinates data flows between client dashboards, AI reasoning engines, document generators, email dispatchers, and Supabase cloud infrastructure.

```
       +-----------------------------------------------------------------------+
       |                        React SPA Client (Vite)                        |
       |  [Worker Dashboard: Submissions]    [Chief Dashboard: Reactive CFO]   |
       +----------------------------------+------------------------------------+
                                          |
                                 3-Sec Live Polling
                                          v
       +-----------------------------------------------------------------------+
       |                  Node.js / Express State Orchestrator                 |
       |            (API Gateway | JWT Auth | Polling State Engine)            |
       +-----+-------------------+-----------------+---------------------+-----+
             |                   |                 |                     |
             v                   v                 v                     v
   +-------------------+  +--------------+  +--------------+  +--------------------+
   | AI Chat Engine    |  | 4 Gemini     |  | PDFKit JS    |  | Nodemailer SMTP    |
   | Intent Parsing    |  | AI Agents    |  | Report Eng.  |  | HR Dispatch Bridge |
   +-------------------+  +--------------+  +--------------+  +--------------------+
                                          |
                                          v
       +-----------------------------------------------------------------------+
       |                  Supabase Cloud Infrastructure (PostgreSQL)           |
       |      [Relational Audit Database]         [Receipt Binary Storage]     |
       +-----------------------------------------------------------------------+
```

---

## 🤖 The 4 Autonomous Gemini AI Agents (`Orchestrator.processJob`)

Whenever an employee submits an expense—either via drag-and-drop receipt upload or natural language chat prompt—the backend Orchestrator transitions the job through an autonomous pipeline of **four specialized Gemini AI Agents**:

1. **📄 OCR Data Extraction Agent (`Extracting Data`)**
   * **Function:** Ingests receipt image/PDF binary buffers or conversational text prompts.
   * **Mechanics:** Extracts key fiscal data points into strict JSON schema: `amount` (numeric), `date` (YYYY-MM-DD), and `merchant` name.
2. **🗂️ Ledger Categorization Agent (`Categorizing`)**
   * **Function:** Maps transactions into corporate general ledger accounts based on merchant semantic context.
   * **Categories:** *Travel & Transit*, *Meals & Entertainment*, *Software & Infrastructure*, *Office Supplies*, or *Miscellaneous*.
3. **🛡️ Corporate Policy Checker Agent (`Checking Policy`)**
   * **Function:** Cross-references extracted figures against corporate policy rules.
   * **Mechanics:** Verifies receipt document attachment presence and flags claims exceeding baseline company expense thresholds.
4. **🚨 Fraud & Risk Analysis Agent (`Analyzing Risk`)**
   * **Function:** Evaluates behavioral anomaly indicators.
   * **Mechanics:** Calculates fraud risk scores by detecting suspicious round numbers (e.g., exact $500.00 charges), category inflation anomalies (e.g., $500 for *Meals*), and abnormal submission velocity.

---

## 👥 Dual User Role Dashboards (Worker vs. Chief)

ClearAudit features role-based access control (RBAC) delivering tailored user experiences:

### 💼 1. Worker Dashboard (`role === 'worker'`)
* **Demo Access:** `worker@clearaudit.inc` | **Pass:** `2`
* **Natural Language Chat Submission (`Ask ClearAudit`):** Employees can simply message the AI assistant: *"audit $35.50 from Uber on 2026-06-25 for client transit"*. The AI parses intent, extracts fields, and queues the job.
* **Live Pipeline Badges:** Because the client polls the server every 3 seconds, workers watch their submission progress live through the AI reasoning stages (`Extracting Data` ➔ `Categorizing` ➔ `Approved` / `Flagged`).
* **Interactive Calendar View:** Transparently tracks monthly spending with dual color-coded status badges (**Green** for cleared approvals, **Amber** for flagged claims).
* **Receipt Attachment Bridge:** Allows workers to upload supporting PDF/image receipt documentation onto flagged claims to resolve audit inquiries.

### 👑 2. Chief Executive CFO Dashboard (`role === 'chief'`)
* **Demo Access:** `chief@clearaudit.inc` | **Pass:** `1`
* **Accounting Separation Logic (Version 2.0):**
  * **Monthly Budget Arc Gauge (`$657 / $12,000`):** Aggregates gross submitted employee spending across all statuses (*Approved*, *Flagged*, *Rejected*, *Processing*) to give executives full visibility into company spending volume.
  * **Approved Amount Card (`$236.50`):** Strictly isolates and sums **only** cleared transactions with authorized *Approved* status.
* **Fraud Audit Review:** Executives examine exact AI fraud reasoning, risk scores, and anomaly breakdowns on flagged transactions.
* **Conversational Policy Administration:** CFOs can modify corporate spending parameters dynamically by messaging the AI: *"set expense limit to $150"*.
* **Instant 1-Page PDF Report Engine:** Issuing the prompt *"generate monthly expense pdf"* triggers pure JS (`PDFKit`) to compile a formatted executive summary sheet with immediate browser download.
* **Guaranteed Nodemailer HR Notification:** Clicking the **`Reject`** button on any audit row—or issuing the chat command *"reject Starbucks claim"*—instantly marks the claim *Rejected* and dispatches an official denial memorandum with attached receipt documentation straight to the HR Manager's Primary inbox (`binayakrath1234@gmail.com`).

---

## 📂 Complete File & Function Reference

### ⚙️ Backend Core (`/backend`)
* **`server.js`**: Core Express server initialization, CORS configuration, Supabase authentication middleware, and REST route registration.
* **`routes.js`**: Defines RESTful endpoints:
  * `GET /api/dashboard/metrics`: Computes separated gross budget totals and cleared approval sums.
  * `POST /api/expenses/upload`: Handles multipart receipt uploads with automatic Supabase storage bucket fallback creation.
  * `POST /api/expenses/:id/reject`: Triggers job rejection state and dispatches HR Nodemailer notice.
  * `POST /api/chat`: Handles conversational AI submissions, executive policy updates, and PDF report generation.
* **`orchestrator.js`**: The multi-agent pipeline state machine. Manages sequential job progression through the 4 Gemini AI agents and updates PostgreSQL job states.
* **`emailService.js`**: Nodemailer SMTP transport bridge. Configured with hardcoded fallback authentication credentials (`binayakrath1234@gmail.com`) to guarantee live server email delivery.
* **`pdfGenerator.js`**: Lightweight, pure JavaScript `PDFKit` document generator creating single-page month-end financial summaries.

### 🎨 Frontend UI (`/frontend`)
* **`src/App.jsx`**: Main application router handling SPA navigation between `/worker` and `/chief` dashboards.
* **`src/api.js`**: Axios HTTP client layer with robust error catch blocks and Render live hosting fallback URLs.
* **`src/supabase.js`**: Supabase client initialization.
* **`src/components/Dashboards.jsx`**: Layout wrappers for Worker and Chief interfaces.
* **`src/components/Shared.jsx`**: Contains reusable design system components:
  * `AnalyticsOverview`: Renders top-level KPI metrics cards with Version 2.0 accounting fallback logic.
  * `BudgetMeter`: Animated SVG circular arc meter tracking monthly capacity percentage.
  * `DataTable`: Company-wide transaction table with view, approve, and reject action handlers.
* **`src/components/CalendarSection.jsx`**: Interactive monthly grid calendar rendering dual green/amber expense badges.

---

## 🚀 Live Cloud Deployment

* **🌐 Live Frontend (Vercel):** [clear-audit.vercel.app](https://clear-audit.vercel.app)
  * Configured with `vercel.json` SPA rewrite rules (`/(.*) -> /index.html`) to prevent 404 refresh errors.
* **☁️ Live Backend (Render):** [clearaudit.onrender.com](https://clearaudit.onrender.com)
  * Serverless Node.js container hosting Express API, Gemini intelligence, and Nodemailer SMTP engine.

---

## 💻 Local Development Setup

```bash
# 1. Clone Repository
git clone https://github.com/binayakzen/ClearAudit.git
cd ClearAudit

# 2. Start Backend Server
cd backend
npm install
npm run dev

# 3. Start Frontend Client (In a new terminal)
cd ../frontend
npm install
npm run dev
```

*Built with ❤️ by the ClearAudit Engineering Team for Advanced Agentic Coding.*
