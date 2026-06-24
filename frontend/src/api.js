import axios from 'axios';
import { supabase } from './supabase';

const API_BASE = '/api';

const apiInstance = axios.create({ baseURL: API_BASE });

apiInstance.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const uploadExpense = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  const response = await apiInstance.post(`/expenses/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getJobStatus = async (jobId) => {
  const response = await apiInstance.get(`/expenses/status/${jobId}`);
  return response.data;
};

export const getMetrics = async (userId = null) => {
  const url = userId ? `/dashboard/metrics?userId=${userId}` : `/dashboard/metrics`;
  const response = await apiInstance.get(url);
  return response.data;
};

export const sendChatMessage = async (message, userId, role = 'worker') => {
  const response = await apiInstance.post(`/chat`, { message, userId, role });
  return response.data;
};

export const uploadReceipt = async (jobId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  const response = await apiInstance.post(`/expenses/${jobId}/receipt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const approveJob = async (jobId) => {
  const response = await apiInstance.post(`/expenses/${jobId}/approve`);
  return response.data;
};

export const rejectJob = async (jobId) => {
  const response = await apiInstance.post(`/expenses/${jobId}/reject`);
  return response.data;
};

export const getEmployees = async () => {
  const response = await apiInstance.get(`/employees`);
  return response.data;
};

export const addEmployee = async (email, limit) => {
  const response = await apiInstance.post(`/employees`, { email, limit });
  return response.data;
};

