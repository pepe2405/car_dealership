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

export interface Deposit {
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

export interface CreateDepositData {
  listingId: string;
  amount: number;
  notes?: string;
}

export interface UpdateDepositData {
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  notes?: string;
}

export interface DepositStatusResponse {
  hasDeposit: boolean;
  deposit?: Deposit;
}

/**
 * Create a new deposit for a car
 */
export async function createDeposit(data: CreateDepositData, token: string): Promise<{ message: string; deposit: Deposit }> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Get all deposits for the current user
 */
export async function fetchUserDeposits(token: string): Promise<Deposit[]> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Check if user has a deposit for a specific car
 */
export async function checkDepositStatus(listingId: string, token: string): Promise<DepositStatusResponse> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  try {
    const response = await api.get(`${API_URL}/${listingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { hasDeposit: false };
    }
    throw error;
  }
}

/**
 * Update deposit status (admin only)
 */
export async function updateDepositStatus(listingId: string, data: UpdateDepositData, token: string): Promise<{ message: string; deposit: Deposit }> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.put(`${API_URL}/${listingId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
} 