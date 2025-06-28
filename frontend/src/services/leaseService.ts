const API = '/api/lease-options';

export interface LeaseOption {
  _id: string;
  name: string;
  duration: number;
  downPayment: number;
  interestRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getLeaseOptions(): Promise<LeaseOption[]> {
  const res = await fetch(API);
  return res.json();
}

export async function getLeaseOption(id: string): Promise<LeaseOption> {
  const res = await fetch(`${API}/${id}`);
  return res.json();
}

export async function createLeaseOption(data: {
  name: string;
  duration: number;
  downPayment: number;
  interestRate: number;
}, token: string): Promise<LeaseOption> {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateLeaseOption(id: string, data: Partial<LeaseOption>, token: string): Promise<LeaseOption> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteLeaseOption(id: string, token: string): Promise<void> {
  await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Калкулатор за лизинг - изчислява всички стойности според цената на автомобила
export function calculateLease(carPrice: number, leaseOption: LeaseOption) {
  const downPaymentAmount = (carPrice * leaseOption.downPayment) / 100;
  const financedAmount = carPrice - downPaymentAmount;
  const totalInterest = (financedAmount * leaseOption.interestRate * leaseOption.duration) / (12 * 100);
  const totalAmount = financedAmount + totalInterest;
  const monthlyPayment = totalAmount / leaseOption.duration;

  return {
    carPrice,
    downPaymentAmount,
    financedAmount,
    totalInterest,
    totalAmount,
    monthlyPayment,
    totalPayments: monthlyPayment * leaseOption.duration
  };
} 