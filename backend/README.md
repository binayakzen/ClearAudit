# ClearAudit — Node.js Express Multi-Agent State Machine Backend ⚙️🤖

The **ClearAudit Backend** is an enterprise-grade **Node.js** and **Express.js** API server. It manages multi-agent pipeline orchestration, PostgreSQL state persistence, Supabase cloud storage bridges, Nodemailer email automations, and pure JavaScript PDF report compilation.

---

## 🏛️ Backend Architecture & Pipeline Event Loop

```
                       +---------------------------------------+
                       |           Express REST API            |
                       |     (server.js & routes.js Routes)    |
                       +-------------------+-------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |        Auth Middleware (JWT)          |
                       |      (Verifies Supabase Session)      |
                       +-------------------+-------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |         Orchestrator Engine           |
                       |       (orchestrator.js State Mach.)   |
                       +-------------------+-------------------+
                                           |
         +---------------------------------+---------------------------------+
         |                                 |                                 |
         v                                 v                                 v
+-----------------+               +-----------------+               +-----------------+
| processJob()    |               | emailService.js |               | pdfGenerator.js |
| 4 Gemini Agents |               | Nodemailer SMTP |               | PDFKit JS Eng.  |
+--------+--------+               +--------+--------+               +--------+--------+
         |                                 |                                 |
         +---------------------------------+---------------------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |        Supabase Cloud Infrastructure  |
                       |   [PostgreSQL DB] [Storage Buckets]   |
                       +---------------------------------------+
```

---

## 🤖 The 4 Autonomous Gemini AI Agents (`orchestrator.js`)

When an audit job is queued via `POST /api/expenses/upload` or `POST /api/chat`, `Orchestrator.processJob(jobId)` runs a sequential multi-agent pipeline:

1. **📄 OCR Data Extraction Agent**
   * **Prompt:** Parses input text or OCR file buffers.
   * **Output:** Structured JSON `{ "amount": number, "date": "YYYY-MM-DD", "merchant": "string" }`.
2. **🗂️ Ledger Categorization Agent**
   * **Function:** Evaluates merchant context and assigns corporate accounting ledger buckets (*Travel & Transit*, *Meals*, *Software & Infrastructure*, etc.).
3. **🛡️ Corporate Policy Checker Agent**
   * **Function:** Validates receipt document attachment presence and compares dollar figures against active company limits.
4. **🚨 Fraud & Risk Analysis Agent**
   * **Function:** Forensic anomaly detection. Evaluates round number charges (e.g. exact $500.00), category price anomalies, and suspicious submission velocity to calculate a **Fraud Score**. High risk items transition state to `Flagged`.

---

## 📂 Core File & Function Directory

* **`server.js`**: Initializes Express app, registers CORS middleware for Vercel origins, mounts JSON/urlencoded body parsers, and binds server port `3001`.
* **`routes.js`**: RESTful API endpoints:
  * `GET /api/dashboard/metrics`: Computes gross budget burn (`totalAmountProcessed`) vs cleared approval sum (`approvedAmount`).
  * `POST /api/expenses/upload`: Multer multipart upload route executing `safeUploadToStorage` with auto bucket creation.
  * `POST /api/expenses/:id/approve` & `/reject`: Chief triage endpoints updating state and firing HR emails.
  * `POST /api/chat`: AI chat intent handler.
* **`orchestrator.js`**: State engine managing job state transitions (`Pending` ➔ `Extracting Data` ➔ `Categorizing` ➔ `Checking Policy` ➔ `Analyzing Risk` ➔ `Approved`/`Flagged`).
* **`emailService.js`**: Nodemailer SMTP transport bridge configured with permanent fallback credentials (`binayakrath1234@gmail.com`) to guarantee email delivery on serverless cloud containers.
* **`pdfGenerator.js`**: Pure JS `PDFKit` engine compiling single-page executive Month-End Expense Reports.

---

## 🛠️ Environment Variables (`.env`)

```env
PORT=3001
GOOGLE_CLOUD_API_KEY=your_google_gemini_api_key
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:pass@db.project.supabase.co:5432/postgres
SMTP_USER=binayakrath1234@gmail.com
SMTP_PASS=your_gmail_app_password
```

---

## 💻 Running Locally

```bash
# Install Node Packages
npm install

# Run Server with Nodemon (Runs on http://localhost:3001)
npm run dev
```
