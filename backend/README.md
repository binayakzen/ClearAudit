# ClearAudit - Backend (Server) ⚙️

The backend of ClearAudit is a robust Node.js and Express API. It is responsible for orchestrating the AI analysis pipeline, securely communicating with the Supabase database, and providing endpoints for the frontend.

## 🧠 AI Agent Pipeline

When an expense is submitted, the backend runs it through a series of intelligent AI Agents powered by the Google Gemini API:

1. **Extraction Agent**: Reads the chat text or receipt file and extracts the exact merchant name, transaction date, and numerical amount.
2. **Categorization Agent**: Evaluates the merchant and automatically assigns the expense to a standard corporate accounting category (e.g., "Software", "Travel").
3. **Policy Agent**: Checks the expense amount against the dynamic, company-wide expense limit stored in the database.
4. **Risk Analysis Agent**: Acts as a forensic accountant to identify suspicious behavior. It looks for anomalies like unusually round numbers or massive meal expenses, generating a "Fraud Score". High scores automatically flag the transaction for Chief review.

## 🔒 Security & Integrations
- **Supabase Auth Middleware**: All API routes are protected. The backend intercepts requests and verifies the user's Supabase JWT token before allowing access.
- **File Handling**: Uses `multer` to accept `multipart/form-data` uploads, streaming PDFs and images directly to Supabase Storage buckets.
- **Email Service**: Uses `nodemailer` to automatically send PDF expense reports and rejection notifications.

## ⚙️ Setup & Installation

1. Open your terminal and navigate to this folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` folder:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_google_gemini_api_key
   EMAIL_USER=your_nodemailer_email
   EMAIL_PASS=your_nodemailer_password
   ```
4. Initialize your database: Ensure your Supabase instance has the required `expenses`, `company_settings`, and `employees` tables. You can use the `clearData.js` script to reset your database if needed.
5. Start the server: `npm start` (Runs on port 3000)
