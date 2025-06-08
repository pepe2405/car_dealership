import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
}

export async function getProfile(token: string): Promise<UserProfile> {
  const res = await axios.get(`${API_URL}/auth/me`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
  return res.data;
}

export async function updateProfile(token: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await axios.put(`${API_URL}/users/me`, data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
  return res.data;
} 