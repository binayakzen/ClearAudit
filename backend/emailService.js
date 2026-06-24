const nodemailer = require('nodemailer');

const sendRejectionEmail = async (job) => {
    // If credentials are not provided, we will just log the email to console
    const useRealSMTP = process.env.SMTP_USER && process.env.SMTP_PASS;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER || 'dummy',
            pass: process.env.SMTP_PASS || 'dummy'
        }
    });

    const mailOptions = {
        from: process.env.SMTP_USER || '"ClearAudit System" <no-reply@clearaudit.inc>',
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
        if (useRealSMTP) {
            await transporter.sendMail(mailOptions);
            console.log('Rejection email successfully sent to HR manager.');
        } else {
            console.log('SMTP credentials not found in .env. Skipping real email dispatch. Email content:');
            console.log(mailOptions.text);
        }
    } catch (error) {
        console.error('Failed to send rejection email:', error);
    }
};

const sendMonthlyReportEmail = async (pdfBuffer) => {
    const useRealSMTP = process.env.SMTP_USER && process.env.SMTP_PASS;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER || 'dummy',
            pass: process.env.SMTP_PASS || 'dummy'
        }
    });

    const mailOptions = {
        from: process.env.SMTP_USER || '"ClearAudit System" <no-reply@clearaudit.inc>',
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
        if (useRealSMTP) {
            await transporter.sendMail(mailOptions);
            console.log('Monthly report email successfully sent to HR manager.');
        } else {
            console.log('SMTP credentials not found in .env. Skipping real email dispatch. Email content attached with PDF buffer length:', pdfBuffer.length);
        }
    } catch (error) {
        console.error('Failed to send monthly report email:', error);
    }
};

module.exports = { sendRejectionEmail, sendMonthlyReportEmail };
