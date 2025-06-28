import axios from 'axios';

// Use relative URL to work with Vite proxy
const API_URL = '/api/deposits';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Create axios instance with default config
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface OwnerDeposit {
  _id: string;
  listingId: {
    _id: string;
    brand: string;
    carModel: string;
    year: number;
    price: number;
    images?: string[];
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDepositData {
  notes?: string;
}

/**
 * Get deposits for cars owned by the current user
 */
export async function fetchOwnerDeposits(token: string): Promise<OwnerDeposit[]> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.get(`${API_URL}/owner/cars`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Approve deposit by car owner
 */
export async function approveDeposit(depositId: string, data: UpdateDepositData, token: string): Promise<{ message: string; deposit: OwnerDeposit }> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.put(`${API_URL}/${depositId}/approve`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Reject deposit by car owner
 */
export async function rejectDeposit(depositId: string, data: UpdateDepositData, token: string): Promise<{ message: string; deposit: OwnerDeposit }> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.put(`${API_URL}/${depositId}/reject`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
} 