const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER || 'binayakrath1234@gmail.com';
const smtpPass = process.env.SMTP_PASS || 'djvursqacbwlooxs';

const sendRejectionEmail = async (job) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    const mailOptions = {
        from: `"ClearAudit System" <${smtpUser}>`,
        to: 'binayakrath1234@gmail.com',
        subject: `Audit Rejected: Action Required for Expense ${job.fileName}`,
        text: `Dear HR Manager,

Please be advised that the audit for the expense receipt "${job.fileName}" has been rejected during the chief review process.

Expense Details:
- Merchant: ${job.extractedData?.merchant || 'Unknown'}
- Amount: $${job.extractedData?.amount || '0.00'}
- Date: ${job.extractedData?.date || 'Unknown'}

Kindly recheck the attached receipt and follow up with the employee accordingly.

Sincerely,
ClearAudit System`,
        attachments: [
            {
                filename: job.receiptFileName || job.fileName || 'receipt.pdf',
                content: 'This is a placeholder for the uploaded receipt PDF document.',
                contentType: 'text/plain'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Rejection email successfully sent to HR manager.');
    } catch (error) {
        console.error('Failed to send rejection email:', error.message);
    }
};

const sendMonthlyReportEmail = async (pdfBuffer) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    const mailOptions = {
        from: `"ClearAudit System" <${smtpUser}>`,
        to: 'binayakrath1234@gmail.com',
        subject: `Monthly Expense Report`,
        text: `Dear HR Manager,\n\nPlease find attached the requested monthly expense report.\n\nSincerely,\nClearAudit System`,
        attachments: [
            {
                filename: 'Monthly_Expense_Report.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Monthly report email successfully sent to HR manager.');
    } catch (error) {
        console.error('Failed to send monthly report email:', error.message);
    }
};

module.exports = { sendRejectionEmail, sendMonthlyReportEmail };
