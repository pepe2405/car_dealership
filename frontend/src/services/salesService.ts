import axios from 'axios';


const API_URL = '/api/sales';


axios.defaults.withCredentials = true;


const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Sale {
  _id: string;
  carId: {
    _id: string;
    brand: string;
    carModel: string;
    year: number;
    price: number;
    images?: string[];
  };
  buyerId: {
    _id: string;
    name: string;
    email: string;
  };
  sellerId: {
    _id: string;
    name: string;
    email: string;
  };
  saleType: 'full' | 'leasing';
  totalAmount: number;
  downPayment?: number;
  monthlyPayment?: number;
  leaseTerm?: number;
  interestRate?: number;
  status: 'pending' | 'completed' | 'cancelled';
  saleDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleData {
  carId: string;
  buyerId: string;
  saleType: 'full' | 'leasing';
  totalAmount: number;
  downPayment?: number;
  monthlyPayment?: number;
  leaseTerm?: number;
  interestRate?: number;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  _id: string;
  saleId: string;
  invoiceNumber: string;
  buyerInfo: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  sellerInfo: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  carInfo: {
    brand: string;
    model: string;
    year: number;
    vin?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceData {
  buyerInfo: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  sellerInfo: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  carInfo: {
    brand: string;
    model: string;
    year: number;
    vin?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms?: string;
  dueDate: string;
  notes?: string;
}

/**
 * Create a new sale
 */
export async function createSale(data: CreateSaleData, token: string): Promise<{ message: string; sale: Sale }> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Get all sales (admin/seller only)
 */
export async function fetchSales(token: string): Promise<Sale[]> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Generate invoice for a sale
 */
export async function generateInvoice(saleId: string, data: CreateInvoiceData, token: string): Promise<{ message: string; invoice: Invoice }> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.post(`${API_URL}/${saleId}/invoice`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Get invoice for a sale
 */
export async function getInvoice(saleId: string, token: string): Promise<{ sale: Sale; invoice: Invoice }> {
  if (!token) {
    throw new Error('Не сте влезли в профила си.');
  }

  const response = await api.get(`${API_URL}/${saleId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
} 