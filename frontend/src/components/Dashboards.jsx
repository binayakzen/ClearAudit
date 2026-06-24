import React, { useState, useEffect } from 'react';
import { FileText, Settings, Loader2, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import { supabase } from '../supabase';
import { 
  Sidebar, TopNav, AnalyticsOverview, ChatInterface, 
  DataTable, CalendarView 
} from './Shared';

const EmployeeSettings = () => {
  const [employees, setEmployees] = useState([]);
  const [email, setEmail] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email || !limit) return;
    setLoading(true);
    try {
      await api.addEmployee(email, limit);
      setEmail('');
      setLimit('');
      fetchEmployees();
    } catch (e) {
      alert("Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-800 p-8 min-h-[400px]">
       <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
         <Settings className="w-8 h-8 text-blue-500" />
         <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Employee Daily Limits</h2>
       </div>
       
       <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
         <div className="flex-1">
           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Employee Email</label>
           <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="worker@clearaudit.inc" className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
         </div>
         <div className="w-full md:w-48">
           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Daily Limit ($)</label>
           <input type="number" value={limit} onChange={(e)=>setLimit(e.target.value)} required placeholder="e.g. 150" min="1" className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
         </div>
         <div className="flex items-end">
           <button type="submit" disabled={loading} className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors h-[42px] flex items-center justify-center">
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Limit'}
           </button>
         </div>
       </form>

       <div>
         <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">Current Employee Limits</h3>
         <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
           <table className="w-full text-left">
             <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-gray-400">
               <tr>
                 <th className="px-6 py-3">Email</th>
                 <th className="px-6 py-3">Daily Limit</th>
                 <th className="px-6 py-3 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {employees.length === 0 ? (
                 <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">No custom limits set.</td></tr>
               ) : employees.map(emp => (
                 <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50">
                   <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> {emp.email}</td>
                   <td className="px-6 py-3 text-sm font-bold text-green-600">${emp.limit}</td>
                   <td className="px-6 py-3 text-right"><button className="text-xs text-red-500 hover:underline">Remove</button></td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
};

export const WorkerDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [jobs, setJobs] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get actual user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        // Redirect if not logged in
        navigate('/login');
      }
    });
  }, [navigate]);

  const fetchDashboardData = async () => {
    if (!userId) return;
    try {
      const data = await api.getMetrics(userId);
      setMetrics(data);
      setJobs(data.recentJobs || []);
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 3000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Filter jobs based on search
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (
      (job.fileName && job.fileName.toLowerCase().includes(lowerQ)) ||
      (job.extractedData?.merchant && job.extractedData.merchant.toLowerCase().includes(lowerQ)) ||
      (job.status && job.status.toLowerCase().includes(lowerQ)) ||
      (job.categoryResult?.category && job.categoryResult.category.toLowerCase().includes(lowerQ))
    );
  });

  if (!userId) return <div className="min-h-screen bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      <Sidebar role="worker" activeTab={activeTab} setActiveTab={setActiveTab} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
        <TopNav title={activeTab === 'dashboard' ? 'Worker Dashboard' : activeTab === 'audits' ? 'My Audits' : activeTab === 'calendar' ? 'Calendar' : 'Settings'} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="p-4 md:p-8 w-full max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <>
              <AnalyticsOverview metrics={metrics} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <ChatInterface onMessageSent={fetchDashboardData} userId={userId} role="worker" />
                </div>
                <div className="lg:col-span-2">
                  <DataTable jobs={filteredJobs} role="worker" refreshData={fetchDashboardData} />
                </div>
              </div>
            </>
          )}
          {activeTab === 'audits' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-800 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
               <FileText className="w-16 h-16 text-blue-200 mb-4" />
               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Extended Audit History</h2>
               <p className="text-gray-500 dark:text-gray-400 mt-2">View and export your complete audit history here.</p>
               <button onClick={() => setActiveTab('dashboard')} className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors">Return to Dashboard</button>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-800 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
               <Settings className="w-16 h-16 text-blue-200 mb-4" />
               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Account Settings</h2>
               <p className="text-gray-500 dark:text-gray-400 mt-2">Configure your notification preferences and default upload behaviors.</p>
            </div>
          )}
          {activeTab === 'calendar' && (
            <CalendarView allJobs={metrics?.allJobs} />
          )}
        </main>
      </div>
    </div>
  );
};

export const ChiefDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/login');
      } else {
         setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getMetrics('chief'); // chief sees all
      setMetrics(data);
      setJobs(data.recentJobs || []);
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    }
  };

  useEffect(() => {
    if (userId) {
       fetchDashboardData();
       const interval = setInterval(fetchDashboardData, 3000);
       return () => clearInterval(interval);
    }
  }, [userId]);

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (
      (job.fileName && job.fileName.toLowerCase().includes(lowerQ)) ||
      (job.extractedData?.merchant && job.extractedData.merchant.toLowerCase().includes(lowerQ)) ||
      (job.status && job.status.toLowerCase().includes(lowerQ))
    );
  });

  if (!userId) return <div className="min-h-screen bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      <Sidebar role="chief" activeTab={activeTab} setActiveTab={setActiveTab} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
        <TopNav title={activeTab === 'dashboard' ? 'Chief Dashboard' : activeTab === 'audits' ? 'Company Audits' : activeTab === 'calendar' ? 'Calendar' : 'Settings'} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="p-4 md:p-8 w-full max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
             <>
                <AnalyticsOverview metrics={metrics} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <ChatInterface onMessageSent={fetchDashboardData} userId={userId} role="chief" />
                  </div>
                  <div className="lg:col-span-2">
                    <DataTable jobs={filteredJobs} role="chief" refreshData={fetchDashboardData} />
                  </div>
                </div>
             </>
          )}
          {activeTab === 'audits' && (
             <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-800 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Extended Audits View</h2>
               <button onClick={() => setActiveTab('dashboard')} className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100">Return to Dashboard</button>
             </div>
          )}
          {activeTab === 'calendar' && (
             <CalendarView allJobs={metrics?.allJobs} />
          )}
          {activeTab === 'settings' && (
             <EmployeeSettings />
          )}
        </main>
      </div>
    </div>
  );
};

