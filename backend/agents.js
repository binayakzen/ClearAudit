const { supabase } = require('./supabase');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

async function callGemini(prompt, isJson = true) {
    if (!process.env.GEMINI_API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: isJson ? { responseMimeType: 'application/json' } : {}
        });
        return isJson ? JSON.parse(response.text) : response.text;
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
}

const MOCK_MERCHANTS = ['Uber', 'AWS', 'Starbucks', 'WeWork', 'Stripe', 'Delta Airlines', 'Google Cloud', 'Salesforce'];

class ExtractionAgent {
    static async process(jobId, preExtractedData = null) {
        if (preExtractedData) {
            return {
                merchant: preExtractedData.merchant || MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)],
                date: preExtractedData.date || new Date().toISOString().split('T')[0],
                amount: parseFloat(preExtractedData.amount) || parseFloat((Math.random() * 500 + 10).toFixed(2)),
                items: ['Service/Product charge (Extracted from Chat)']
            };
        }

        const prompt = `Generate a realistic mock expense receipt extraction. Return a JSON with exactly these keys: { "merchant": "Name", "date": "YYYY-MM-DD", "amount": 123.45, "items": ["item1"] }.`;
        const aiResult = await callGemini(prompt, true);
        
        if (aiResult && aiResult.amount) {
            return {
                merchant: aiResult.merchant,
                date: aiResult.date,
                amount: parseFloat(aiResult.amount),
                items: aiResult.items || ['General Service']
            };
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        const randomAmount = (Math.random() * 500 + 10).toFixed(2);
        return {
            merchant: MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)],
            date: new Date().toISOString().split('T')[0],
            amount: parseFloat(randomAmount),
            items: ['Service/Product charge']
        };
    }
}

class CategorizationAgent {
    static async process(extractedData) {
        const prompt = `Categorize this expense: Merchant: ${extractedData.merchant}, Amount: $${extractedData.amount}. Return JSON { "category": "category name" }. Use standard corporate accounting categories like Travel, Software, Meals, Office Space, etc.`;
        const aiResult = await callGemini(prompt, true);
        if (aiResult && aiResult.category) return aiResult;

        await new Promise(resolve => setTimeout(resolve, 800));
        const merchantLower = extractedData.merchant.toLowerCase();
        let category = "Miscellaneous";
        if (merchantLower.includes('uber') || merchantLower.includes('delta')) category = "Travel & Transit";
        else if (merchantLower.includes('aws') || merchantLower.includes('software')) category = "Software & Infrastructure";
        else if (merchantLower.includes('starbucks') || merchantLower.includes('cafe')) category = "Meals & Entertainment";
        else if (merchantLower.includes('wework')) category = "Office Space";
        return { category };
    }
}

class PolicyAgent {
    static async process(extractedData) {
        // Simulate corporate policy checking
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch current limit from database
        const { data } = await supabase.from('company_settings').select('expense_limit').eq('id', 1).single();
        const currentLimit = data ? data.expense_limit : 200;

        let policyViolations = [];
        // Check against dynamic limit
        if (extractedData.amount > currentLimit) {
            policyViolations.push(`Amount $${extractedData.amount} exceeds $${currentLimit} limit without prior approval.`);
        }
        
        return {
            isCompliant: policyViolations.length === 0,
            violations: policyViolations
        };
    }
}

class RiskAnalysisAgent {
    static async process(extractedData, categoryResult) {
        const prompt = `Analyze this expense for corporate fraud risk: Merchant: ${extractedData.merchant}, Amount: $${extractedData.amount}, Category: ${categoryResult.category}. Return JSON { "fraudScore": number between 0-100, "isFlagged": boolean (true if score > 60), "reason": "brief explanation", "riskFactors": ["factor1"] }. High amount for meals or round numbers are riskier.`;
        const aiResult = await callGemini(prompt, true);
        if (aiResult && aiResult.fraudScore !== undefined) return aiResult;

        await new Promise(resolve => setTimeout(resolve, 1200));
        let riskFactors = [];
        let fraudScore = Math.random() * 20;

        if (extractedData.amount % 100 === 0) {
            riskFactors.push('Unusually round number amount.');
            fraudScore += 40;
        }

        if (categoryResult.category === 'Meals & Entertainment' && extractedData.amount > 150) {
            riskFactors.push('High expenditure for Meals & Entertainment category.');
            fraudScore += 30;
        }
        
        const isFlagged = fraudScore > 60; 
        return {
            fraudScore: fraudScore.toFixed(1),
            isFlagged: isFlagged,
            reason: isFlagged ? riskFactors.join(' ') : 'Normal transaction pattern.',
            riskFactors
        };
    }
}

class Orchestrator {
    static async startProcessing(jobId, preExtractedData) {
        try {
            // Step 1: Extraction
            await supabase.from('expenses').update({ status: 'Extracting Data' }).eq('id', jobId);
            const extractedData = await ExtractionAgent.process(jobId, preExtractedData);
            
            await supabase.from('expenses').update({
                merchant: extractedData.merchant,
                expense_date: extractedData.date,
                amount: extractedData.amount
            }).eq('id', jobId);

            // Step 2: Categorization (Modern feature)
            await supabase.from('expenses').update({ status: 'Categorizing' }).eq('id', jobId);
            const categoryResult = await CategorizationAgent.process(extractedData);
            await supabase.from('expenses').update({ category: categoryResult.category }).eq('id', jobId);

            // Step 3: Policy Check
            await supabase.from('expenses').update({ status: 'Checking Policy' }).eq('id', jobId);
            const policyResult = await PolicyAgent.process(extractedData);

            // Step 4: Risk Analysis (Modern feature)
            await supabase.from('expenses').update({ status: 'Analyzing Risk' }).eq('id', jobId);
            const fraudResult = await RiskAnalysisAgent.process(extractedData, categoryResult);

            // Finalizing Status
            const finalStatus = (policyResult.isCompliant && !fraudResult.isFlagged) ? 'Approved' : 'Flagged';
            await supabase.from('expenses').update({ status: finalStatus }).eq('id', jobId);
            
        } catch (error) {
            console.error(`Error processing job ${jobId}:`, error);
            await supabase.from('expenses').update({ status: 'Failed' }).eq('id', jobId);
        }
    }

    static async createJob(fileName, preExtractedData = null, userId = 'unknown') {
        const { data, error } = await supabase
            .from('expenses')
            .insert([{
                file_name: fileName,
                user_id: 'shared',
                status: 'Pending',
                merchant: preExtractedData ? preExtractedData.merchant : null,
                amount: preExtractedData && preExtractedData.amount ? parseFloat(preExtractedData.amount) : null,
                expense_date: preExtractedData ? preExtractedData.date : null
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        // Kick off async processing (background)
        this.startProcessing(data.id, preExtractedData);
        
        return this.mapDbToJob(data);
    }

    static async getJob(jobId) {
        const { data, error } = await supabase.from('expenses').select('*').eq('id', jobId).single();
        if (error) return null;
        
        return this.mapDbToJob(data);
    }
    
    static async getAllJobs(userId = null) {
        let query = supabase.from('expenses').select('*').order('created_at', { ascending: false });
        // Sync chief and worker data by removing userId filtering so they share the same data
        
        const { data, error } = await query;
        if (error) return [];
        
        return data.map(row => this.mapDbToJob(row));
    }

    static async uploadReceipt(jobId, receiptFileName) {
        const { data, error } = await supabase
            .from('expenses')
            .update({ 
                status: 'Pending Chief Review',
                receipt_file_name: receiptFileName || 'unknown_receipt.pdf'
            })
            .eq('id', jobId)
            .select()
            .single();
            
        if (error) throw new Error('Job not found or update failed');
        return this.mapDbToJob(data);
    }

    static async approveJob(jobId) {
        const { data, error } = await supabase
            .from('expenses')
            .update({ status: 'Approved' })
            .eq('id', jobId)
            .select()
            .single();
            
        if (error) throw new Error('Job not found or approve failed');
        return this.mapDbToJob(data);
    }

    static async rejectJob(jobId) {
        const { data, error } = await supabase
            .from('expenses')
            .update({ status: 'Rejected' })
            .eq('id', jobId)
            .select()
            .single();
            
        if (error) throw new Error('Job not found or reject failed');
        return this.mapDbToJob(data);
    }

    static async updateExpenseLimit(newLimit) {
        await supabase.from('company_settings').update({ expense_limit: newLimit }).eq('id', 1);
        return newLimit;
    }

    static async updateMonthlyBudget(newBudget) {
        await supabase.from('company_settings').update({ monthly_budget: newBudget }).eq('id', 1);
        return newBudget;
    }

    static async getMonthlyBudget() {
        const { data } = await supabase.from('company_settings').select('monthly_budget').eq('id', 1).single();
        return data ? data.monthly_budget : 12000;
    }

    static async addEmployee(email, limit) {
        const { data, error } = await supabase
            .from('employees')
            .insert([{ email, expense_limit: parseFloat(limit) }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getEmployees() {
        const { data, error } = await supabase.from('employees').select('*');
        if (error) return [];
        return data;
    }
    
    static mapDbToJob(row) {
        return {
            id: row.id,
            fileName: row.file_name,
            receiptFileName: row.receipt_file_name,
            userId: row.user_id,
            status: row.status,
            createdAt: row.created_at,
            extractedData: {
                merchant: row.merchant,
                amount: row.amount,
                date: row.expense_date
            },
            categoryResult: {
                category: row.category
            }
        };
    }
}

module.exports = {
    Orchestrator,
    callGemini
};
