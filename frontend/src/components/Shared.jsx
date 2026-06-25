import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Search, Settings, Home, Activity, FileDigit, Send, Bot, User, Paperclip, Check, Upload, Mail, Lock, Loader2, LogOut, LayoutDashboard, XCircle, X, Calendar, ChevronLeft, ChevronRight, Menu, Sun, Moon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import { supabase } from '../supabase';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  return { theme, toggleTheme };
};

export const Sidebar = ({ role, activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audits', label: 'My Audits', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div className={`w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-gray-100 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col shadow-sm dark:shadow-slate-900/50 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-slate-800">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center gap-2">
          <Activity className="w-7 h-7 text-blue-600" /> ClearAudit
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm dark:shadow-slate-900/50' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 hover:text-gray-900 dark:text-gray-100'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-3 truncate">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-inner flex-shrink-0 ${role === 'chief' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
              {role === 'chief' ? 'CF' : 'WK'}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize truncate">{role}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={userEmail || `${role}@clearaudit.inc`}>{userEmail || `${role}@clearaudit.inc`}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export const TopNav = ({ title, searchQuery, setSearchQuery, setIsMobileMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  return (
  <header className="h-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 z-30 sticky top-0 shadow-sm dark:shadow-slate-900/50 transition-all">
    <div className="flex items-center gap-3">
      <button onClick={toggleTheme} className="p-2 md:mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg transition-colors">
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
      </button>
      <button 
        className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-lg"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 tracking-tight truncate max-w-[150px] sm:max-w-none">
        {title}
      </div>
    </div>
    <div className="relative group flex-1 max-w-[180px] sm:max-w-xs md:max-w-sm ml-2 md:ml-0 md:w-auto">
      <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute left-3 md:left-3.5 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search expenses..." 
        className="pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 transition-all w-full md:w-72 lg:w-96 shadow-inner"
      />
    </div>
  </header>
  );
};

export const ChatInterface = ({ onMessageSent, userId, role = 'worker' }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your ClearAudit Agent. How can I help you audit your expenses today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isUploading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isUploading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(userMessage, userId, role);
      setMessages(prev => [...prev, { role: 'assistant', content: response.reply, fileData: response.fileData, fileName: response.fileName }]);
      onMessageSent();
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error communicating with the server.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      const userMessage = `Please audit this file: ${fileName}`;
      
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setIsUploading(true);

      // Simulate file upload delay for realism before calling API
      await new Promise(r => setTimeout(r, 1200));
      setIsUploading(false);
      setIsTyping(true);

      try {
        const response = await api.uploadExpense(files[0]);
        setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
        onMessageSent();
      } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error uploading the file.' }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-shadow flex flex-col h-[480px] overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 dark:from-slate-800 to-white dark:to-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" /> Ask ClearAudit
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm dark:shadow-slate-900/50 border border-blue-200">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm dark:shadow-slate-900/50 leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-100 rounded-bl-none'}`}>
              {msg.content}
              {msg.fileData && (
                <div className="mt-3">
                  <a href={msg.fileData} download={msg.fileName} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100 w-max">
                    <FileText className="w-4 h-4" /> Download {msg.fileName}
                  </a>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 shadow-sm dark:shadow-slate-900/50">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isUploading && (
           <div className="flex gap-3 justify-end">
              <div className="px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm dark:shadow-slate-900/50 bg-blue-500 text-white rounded-br-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading file...
              </div>
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 shadow-sm dark:shadow-slate-900/50">
                <User className="w-4 h-4 text-white" />
              </div>
           </div>
        )}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 rounded-bl-none text-sm flex items-center gap-1.5 shadow-sm dark:shadow-slate-900/50">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <label className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-colors rounded-xl border border-transparent">
            <Paperclip className="w-5 h-5" />
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or drop an invoice..." 
            className="flex-1 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white dark:bg-slate-900 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={(!input.trim() && !isTyping) || isUploading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export const CalendarView = ({ allJobs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const dailyTotals = {};
  
  (allJobs || []).forEach(job => {
    if (job.status === 'Approved' && job.extractedData?.date && job.extractedData?.amount) {
      const date = String(job.extractedData.date);
      const amountStr = String(job.extractedData.amount).replace(/[^0-9.-]+/g, "");
      const amt = parseFloat(amountStr);
      if (!isNaN(amt)) {
        dailyTotals[date] = (dailyTotals[date] || 0) + amt;
      }
    }
  });

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => {
    let day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); 
  
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => {
    const dayNum = daysInPrevMonth - firstDay + i + 1;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    return { dayNum, isCurrentMonth: false, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` };
  });

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    return { dayNum, isCurrentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` };
  });

  const totalSlots = blanks.length + days.length;
  const trailingBlanksCount = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
  const trailingBlanks = Array.from({ length: trailingBlanksCount }, (_, i) => {
    const dayNum = i + 1;
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    return { dayNum, isCurrentMonth: false, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` };
  });

  const allCalendarDays = [...blanks, ...days, ...trailingBlanks];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const formattedDate = `${new Date().getDate()} ${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 tracking-tight min-w-[160px] text-center">
            {monthNames[month]} {year}
          </h2>
          <button onClick={handleNextMonth} className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={handleToday} className="ml-4 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 transition-colors shadow-sm dark:shadow-slate-900/50">
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-slate-700 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr">
        {allCalendarDays.map((calDay, i) => {
          const spent = dailyTotals[calDay.dateStr];
          const isToday = calDay.dateStr === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

          return (
            <div key={`${calDay.dateStr}-${i}`} className={`min-h-[140px] p-3 border-r border-b border-gray-200 dark:border-slate-700 relative ${!calDay.isCurrentMonth ? 'bg-gray-50/50 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-900'} ${i % 7 === 6 ? 'border-r-0' : ''}`}>
               <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${isToday ? 'bg-blue-600 text-white shadow-sm dark:shadow-slate-900/50' : calDay.isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                 {calDay.dayNum}
               </span>
               {spent && (
                 <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-lg shadow-sm dark:shadow-slate-900/50 group hover:bg-green-100 transition-colors cursor-pointer">
                   <p className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                      <span className="text-green-600 text-xs">US$</span> 
                      {spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </p>
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BudgetMeter = ({ totalAmount, monthlyBudget }) => {
  const amountNum = parseFloat(totalAmount || 0);
  const budgetNum = parseFloat(monthlyBudget || 12000);
  const percentage = Math.min(100, Math.round((amountNum / budgetNum) * 100));
  const radius = 60;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-shadow flex flex-col items-center relative overflow-hidden group h-full">
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 w-full text-left relative z-10">Monthly Budget</h3>
      <div className="relative w-40 h-24 flex items-end justify-center mt-2 z-10">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 160 80">
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke={percentage > 90 ? "#ef4444" : "#10b981"}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="flex flex-col items-center mb-0.5">
          <span className="text-3xl font-black tracking-tight" style={{ color: percentage > 90 ? "#ef4444" : "#10b981" }}>{percentage}%</span>
        </div>
      </div>
      <div className="text-center mt-3 z-10">
        <p className="text-xs font-bold text-gray-400">
          <span className="text-gray-800 dark:text-gray-200 text-sm">${amountNum.toLocaleString()}</span> / ${budgetNum.toLocaleString()}
        </p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/30 rounded-full opacity-30 group-hover:scale-110 transition-transform"></div>
    </div>
  );
};

export const AnalyticsOverview = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6 mb-8">
    <div className="xl:col-span-2">
      <BudgetMeter totalAmount={metrics.totalAmountProcessed} monthlyBudget={metrics.monthlyBudget} />
    </div>
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 relative z-10">Total Expenses</h3>
      <p className="text-3xl font-black text-gray-900 dark:text-gray-100 relative z-10 tracking-tight">{metrics.totalExpenses || 0}</p>
    </div>
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-900/30 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 relative z-10">Approved Amount</h3>
      <p className="text-3xl font-black text-gray-900 dark:text-gray-100 relative z-10 tracking-tight">${metrics.totalAmountProcessed || '0.00'}</p>
    </div>
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-50 dark:bg-yellow-900/30 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 relative z-10">Needs Attention</h3>
      <div className="flex items-center gap-3 relative z-10">
        <p className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{metrics.flagged || 0}</p>
        {(metrics.flagged > 0) && <span className="bg-yellow-100 text-yellow-700 text-xs px-2.5 py-1 rounded-md font-bold shadow-sm dark:shadow-slate-900/50 animate-pulse">Flags</span>}
      </div>
    </div>
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 dark:bg-red-900/30 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 relative z-10">Rejected</h3>
      <p className="text-3xl font-black text-gray-900 dark:text-gray-100 relative z-10 tracking-tight">{metrics.rejected || 0}</p>
    </div>
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 dark:bg-purple-900/30 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 relative z-10">Processing</h3>
      <p className="text-3xl font-black text-gray-900 dark:text-gray-100 relative z-10 tracking-tight">{metrics.processing || 0}</p>
    </div>
  </div>
);

export const DataTable = ({ jobs, role, refreshData }) => {
  const [uploadingId, setUploadingId] = useState(null);

  const handleUploadReceipt = async (jobId, file) => {
    if (!file) return;
    setUploadingId(jobId);
    try {
      // Fake delay for realism
      await new Promise(r => setTimeout(r, 1000));
      await api.uploadReceipt(jobId, file);
      refreshData();
    } catch (e) {
      console.error("Upload receipt error:", e);
      alert(e?.response?.data?.error || e.message || "Failed to upload receipt");
    } finally {
      setUploadingId(null);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await api.approveJob(jobId);
      refreshData();
    } catch (e) {
      console.error("Approve error:", e);
      alert(e?.response?.data?.error || e.message || "Failed to approve");
    }
  };

  const handleReject = async (jobId) => {
    try {
      await api.rejectJob(jobId);
      refreshData();
    } catch (e) {
      console.error("Reject error:", e);
      alert(e?.response?.data?.error || e.message || "Failed to reject");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-shadow overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-white dark:from-slate-900 to-gray-50/50 dark:to-slate-800/50">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">{role === 'chief' ? 'Company-Wide Audits' : 'My Recent Audits'}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-xs uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">
              <th className="px-6 py-4">File Name</th>
              <th className="px-6 py-4">Merchant</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/30">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileDigit className="w-8 h-8 text-gray-300" />
                    <p className="font-medium">No expenses found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : jobs.map((job) => (
              <tr key={job.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors group">
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <FileDigit className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  {job.fileName}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">{job.extractedData?.merchant || '-'}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{job.extractedData?.date || '-'}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  <span className="bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-slate-700">
                     {job.categoryResult?.category || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-bold">{job.extractedData?.amount ? `$${job.extractedData.amount}` : '-'}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-6 py-4">
                  {role === 'worker' && job.status === 'Flagged' && (
                    <label className={`flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all w-32 ${uploadingId === job.id ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer shadow-sm dark:shadow-slate-900/50'}`}>
                      {uploadingId === job.id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading</>
                      ) : (
                        <><Upload className="w-3.5 h-3.5" /> Upload Receipt</>
                      )}
                      <input type="file" className="hidden" disabled={uploadingId === job.id} onChange={(e) => handleUploadReceipt(job.id, e.target.files[0])} />
                    </label>
                  )}
                  {role === 'chief' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                            const fileName = job.receiptFileName || job.fileName;
                            if (!fileName || fileName === 'unknown_receipt.pdf') {
                                alert("No receipt file available.");
                                return;
                            }
                            const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
                            window.open(data.publicUrl, '_blank');
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 hover:text-gray-900 dark:text-gray-100 transition-colors shadow-sm dark:shadow-slate-900/50"
                      >
                        <FileText className="w-3.5 h-3.5" /> View
                      </button>
                      {(job.status === 'Flagged' || job.status === 'Pending Chief Review') && (
                        <>
                          <button 
                            onClick={() => handleApprove(job.id)}
                            className="flex items-center gap-1.5 text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm dark:shadow-slate-900/50"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(job.id)}
                            className="flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm dark:shadow-slate-900/50"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  let colorClass = 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700';
  let Icon = null;

  if (status === 'Approved') {
    colorClass = 'bg-green-50 text-green-700 border-green-200';
    Icon = CheckCircle;
  } else if (status === 'Rejected') {
    colorClass = 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700';
    Icon = XCircle;
  } else if (status === 'Flagged') {
    colorClass = 'bg-red-50 text-red-700 border-red-200';
    Icon = AlertCircle;
  } else if (['Pending', 'Extracting Data'].includes(status)) {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['Categorizing', 'Checking Policy', 'Analyzing Risk'].includes(status)) {
    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (status === 'Pending Chief Review') {
    colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${colorClass} shadow-sm dark:shadow-slate-900/50`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {status}
    </span>
  );
};

