# ClearAudit — React Single Page Application (Frontend UI) 🎨⚡

The **ClearAudit Frontend** is a modern, responsive Single Page Application (SPA) built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**. It implements role-based dashboards delivering real-time polling, interactive AI chat interfaces, and reactive accounting visualizations.

---

## 🏛️ Frontend Architecture & Component Topology

```
                  +-----------------------------------+
                  |          src/App.jsx              |
                  |  (Auth State | Route Dispatcher)  |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            v                                               v
+-----------------------+                       +-----------------------+
|   Worker Dashboard    |                       |    Chief Dashboard    |
|  (/worker | role: 2)  |                       |  (/chief | role: 1)   |
+-----------+-----------+                       +-----------+-----------+
            |                                               |
            +-----------------------+-----------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |      src/components/Shared.jsx    |
                  |   [AnalyticsOverview | BudgetArc] |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  |      src/api.js & supabase.js     |
                  |  (Axios HTTP Client | Auth Bridge)|
                  +-----------------------------------+
```

---

## 👨‍💻 1. Worker Dashboard (`/worker`)

Designed for corporate employees to submit, attach, and track expense audits.

* **Demo Account:** `worker@clearaudit.inc` | **Password:** `2`
* **Natural Language Chat AI (`Ask ClearAudit`):** Type natural commands like *"audit $45 from Delta on 2026-06-25 for client trip"*. The AI extracts fields and launches the backend multi-agent pipeline.
* **Drag & Drop Upload:** Multipart boundary upload handler transmitting receipt buffers safely to Supabase cloud storage.
* **Live Pipeline Badges:** Polls `GET /dashboard/metrics` every 3 seconds to animate top row progress live (`Extracting Data` ➔ `Categorizing` ➔ `Checking Policy` ➔ `Analyzing Risk` ➔ `Approved`).
* **Interactive Calendar Section (`CalendarSection.jsx`):** Dual status badge calendar highlighting month-to-date spending (**Green** for approved, **Amber** for flagged/pending).
* **Receipt Attachment Action:** Upload supporting PDF receipt documents directly onto flagged rows.

---

## 👑 2. Chief Executive CFO Dashboard (`/chief`)

Designed for finance executives to monitor budget burn, review fraud reasoning, and execute administrative actions.

* **Demo Account:** `chief@clearaudit.inc` | **Password:** `1`
* **Version 2.0 Accounting Precision:**
  * **Monthly Budget Gauge (`$657 / $12,000`):** Tracks gross submitted corporate expenditure volume across all statuses.
  * **Approved Amount Card (`$236.50`):** Strictly aggregates cleared expenditures with green `Approved` authorization.
* **Fraud & Risk Reasoning Review:** Expand table rows to inspect exact Gemini AI fraud rationale and risk score factors on flagged transactions.
* **Conversational Policy Control:** Message the chat assistant *"set expense limit to $150"* to update database thresholds dynamically.
* **Instant 1-Page PDF Generation:** Type *"generate monthly expense pdf"* to trigger instant browser download of formatted executive summary sheets.
* **1-Click Rejection to HR:** Clicking **`Reject`** (or typing *"reject Starbucks"*) updates state to *Rejected* and triggers backend Nodemailer to dispatch formal denial memos with attached receipt files directly to the HR Manager (`binayakrath1234@gmail.com`).

---

## 📂 Core File Directory

* **`src/App.jsx`**: Main router managing authentication sessions and `/worker` vs `/chief` routing.
* **`src/api.js`**: Axios HTTP service layer configured with Render live hosting fallback URLs and multipart boundaries.
* **`src/supabase.js`**: Supabase authentication and storage client.
* **`src/components/Dashboards.jsx`**: Dashboard container layouts.
* **`src/components/Shared.jsx`**: Reusable UI cards (`AnalyticsOverview`), animated SVG gauges (`BudgetMeter`), and transaction directory (`DataTable`).
* **`src/components/CalendarSection.jsx`**: Monthly calendar grid component.
* **`vercel.json`**: Vercel SPA routing rewrite rules (`/(.*) -> /index.html`) eliminating 404 navigation errors.

---

## 🛠️ Local Development

```bash
# Install Dependencies
npm install

# Start Vite Dev Server (Runs on http://localhost:5173)
npm run dev

# Build Production Bundle
npm run build
```
