const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('./supabase');
const { Orchestrator, callGemini } = require('./agents');
const { generateMonthlyReport } = require('./pdfGenerator');
const { sendRejectionEmail, sendMonthlyReportEmail } = require('./emailService');

const upload = multer({ storage: multer.memoryStorage() });

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Malformed Authorization header' });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    
    req.user = user;
    next();
};

router.use(authMiddleware);

async function safeUploadToStorage(fileName, file) {
    try {
        let { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(fileName, file.buffer, { contentType: file.mimetype });
            
        if (uploadError && (uploadError.message?.toLowerCase().includes('not found') || uploadError.error?.toLowerCase().includes('not found'))) {
            await supabase.storage.createBucket('receipts', { public: true }).catch(() => {});
            let retry = await supabase.storage
                .from('receipts')
                .upload(fileName, file.buffer, { contentType: file.mimetype });
            uploadError = retry.error;
        }
        if (uploadError) {
            console.warn("Storage upload warning:", uploadError.message || uploadError);
        }
    } catch (err) {
        console.warn("Storage upload error:", err.message);
    }
}

// POST /api/expenses/upload
router.post('/expenses/upload', upload.single('file'), async (req, res) => {
    try {
        let fileName = req.body.fileName || 'unknown_receipt.pdf';
        
        if (req.file) {
            fileName = `${Date.now()}_${req.file.originalname}`;
            await safeUploadToStorage(fileName, req.file);
        }

        const job = await Orchestrator.createJob(fileName, null, req.user.id);
        
        res.status(202).json({
            message: 'Expense uploaded and processing started.',
            jobId: job.id,
            status: job.status
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/expenses/status/:id
router.get('/expenses/status/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Orchestrator.getJob(jobId);
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dashboard/metrics
router.get('/dashboard/metrics', async (req, res) => {
    try {
        const userId = req.user.id;
        const jobs = await Orchestrator.getAllJobs(userId);
        
        const totalExpenses = jobs.length;
        const approved = jobs.filter(j => j.status === 'Approved').length;
        const flagged = jobs.filter(j => j.status === 'Flagged').length;
        const rejected = jobs.filter(j => j.status === 'Rejected').length;
        const processing = jobs.filter(j => ['Pending', 'Extracting Data', 'Categorizing', 'Checking Policy', 'Analyzing Risk'].includes(j.status)).length;
        
        let totalAmountProcessed = 0;
        let approvedAmount = 0;
        jobs.forEach(j => {
            if (j.status !== 'Rejected' && j.extractedData && j.extractedData.amount) {
                const amt = typeof j.extractedData.amount === 'number' ? j.extractedData.amount : parseFloat(String(j.extractedData.amount).replace(/[^0-9.-]+/g, '')) || 0;
                totalAmountProcessed += amt;
                if (j.status === 'Approved') {
                    approvedAmount += amt;
                }
            }
        });

        const monthlyBudget = await Orchestrator.getMonthlyBudget();
        res.json({
            totalExpenses,
            approved,
            flagged,
            rejected,
            processing,
            totalAmountProcessed,
            approvedAmount,
            monthlyBudget: monthlyBudget,
            recentJobs: jobs.slice(0, 10), // return top 10 recent
            allJobs: jobs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/chat
router.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message || '';
        const userId = req.user.id;
        const role = req.body.role || 'worker';
        
        // Simulate thinking delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let reply = "";
        
        // Simple intent matching
        const lowerMsg = userMessage.toLowerCase();

        if (role === 'chief') {
            const reportMatch = lowerMsg.match(/(?:monthly expense pdf|monthly report|total monthly expense|total monthly report)/);
            if (reportMatch) {
                const pdfBuffer = await generateMonthlyReport();
                await sendMonthlyReportEmail(pdfBuffer);
                const base64Pdf = pdfBuffer.toString('base64');
                reply = "I have generated the Total Monthly Expense Report formatted to a single page. It has been automatically emailed to the HR manager. You can also download it below.";
                return res.json({ reply, fileData: `data:application/pdf;base64,${base64Pdf}`, fileName: 'Monthly_Expense_Report.pdf' });
            }

            const budgetMatch = lowerMsg.match(/(?:monthly limit|monthly budget|total limit|overall limit)[\s\w]*?\$?\b(\d+)\b/);
            if (budgetMatch) {
                const newBudget = parseInt(budgetMatch[1], 10);
                await Orchestrator.updateMonthlyBudget(newBudget);
                reply = `I have successfully updated the company-wide monthly budget limit to $${newBudget}. The budget meter will now reflect this new capacity.`;
                return res.json({ reply });
            }

            const limitMatch = lowerMsg.match(/(?:limit|policy|expenses?)[\s\w]*?\$?\b(\d+)\b/);
            if (limitMatch) {
                const newLimit = parseInt(limitMatch[1], 10);
                await Orchestrator.updateExpenseLimit(newLimit);
                reply = `I have successfully updated the company-wide expense limit to $${newLimit}. Any future expenses exceeding this amount will be flagged for your review.`;
                return res.json({ reply });
            }
        }
        
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            reply = "Hello! I am the ClearAudit Agent. How can I help you with expense auditing today?";
        } else if (lowerMsg.includes('audit') || lowerMsg.includes('upload') || lowerMsg.includes('receipt') || lowerMsg.includes('file')) {
            
            let amount = null, date = null, merchant = null;
            const prompt = `Extract expense details from this text: "${userMessage}". Return JSON { "amount": "number without $", "date": "YYYY-MM-DD", "merchant": "name of place" }. If not found, return null for the field.`;
            const aiIntent = await callGemini(prompt, true);
            
            if (aiIntent) {
                amount = aiIntent.amount;
                date = aiIntent.date;
                merchant = aiIntent.merchant;
            } else {
                const amountMatch = userMessage.match(/\$?\b(\d+(?:\.\d{2})?)\b/);
                amount = amountMatch ? amountMatch[1] : null;

                const dateMatch = userMessage.match(/\b(\d{4}-\d{2}-\d{2})\b/);
                date = dateMatch ? dateMatch[1] : null;

                const merchantMatch = userMessage.match(/(?:from|at)\s+([A-Z][a-zA-Z\s]+?)(?=\s+on|\s+for|\s+the|\.|$)/);
                merchant = merchantMatch ? merchantMatch[1].trim() : null;
            }

            const words = userMessage.split(' ');
            let fileName = 'unknown_receipt.pdf';
            const possibleFiles = words.filter(w => w.includes('.pdf') || w.includes('.png') || w.includes('.jpg') || w.includes('.jpeg'));
            if (possibleFiles.length > 0) {
                fileName = possibleFiles[0];
            } else {
                const safeMerchant = merchant ? merchant.replace(/\s+/g, '_').toLowerCase() : 'receipt';
                fileName = `${safeMerchant}_${Math.floor(Math.random() * 1000)}.pdf`;
            }

            const preExtractedData = (amount || date || merchant) ? { amount, date, merchant } : null;

            const job = await Orchestrator.createJob(fileName, preExtractedData, req.user.id);
            
            if (preExtractedData) {
                reply = `I've received your request to audit **${fileName}**. I extracted the explicit details you provided: \n\n- **Amount**: ${amount ? '$'+amount : 'Unknown'}\n- **Merchant**: ${merchant || 'Unknown'}\n- **Date**: ${date || 'Unknown'}\n\nI have initiated the modern pipeline (Categorization and Risk Analysis). You can track its live status in the Recent Audits table!`;
            } else {
                reply = `I've received your request to audit **${fileName}**. I have initiated the extraction and policy checks. You can track its live status in the Recent Audits table!`;
            }
        } else {
            reply = "I see. If you have an expense receipt or invoice you'd like me to review, just ask me to audit it! You can even specify details like 'audit $150 from Uber on 2026-06-20'.";
        }

        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/expenses/:id/receipt
router.post('/expenses/:id/receipt', upload.single('file'), async (req, res) => {
    try {
        let fileName = req.body.fileName || 'unknown_receipt.pdf';
        
        if (req.file) {
            fileName = `${Date.now()}_${req.file.originalname}`;
            await safeUploadToStorage(fileName, req.file);
        }

        const job = await Orchestrator.uploadReceipt(req.params.id, fileName);
        res.json({ message: 'Receipt uploaded', job });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// POST /api/expenses/:id/approve
router.post('/expenses/:id/approve', async (req, res) => {
    try {
        const job = await Orchestrator.approveJob(req.params.id);
        res.json({ message: 'Job approved', job });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// POST /api/expenses/:id/reject
router.post('/expenses/:id/reject', async (req, res) => {
    try {
        const job = await Orchestrator.rejectJob(req.params.id);
        
        // Send email to HR manager
        await sendRejectionEmail(job);

        res.json({ message: 'Job rejected and HR notified', job });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /api/employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await Orchestrator.getEmployees();
        res.json(employees);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/employees
router.post('/employees', async (req, res) => {
    try {
        const { email, limit } = req.body;
        if (!email || !limit) {
            return res.status(400).json({ error: 'Email and limit are required' });
        }
        const newEmp = await Orchestrator.addEmployee(email, limit);
        res.json({ message: 'Employee added', employee: newEmp });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
