import axios from "axios";

const API_URL = "/api/deposits";

axios.defaults.withCredentials = true;

const api = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AdminDeposit {
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
  status: "pending" | "approved" | "rejected" | "refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDepositData {
  status: "pending" | "approved" | "rejected" | "refunded";
  notes?: string;
}

/**
 * Get all deposits (admin only)
 */
export async function fetchAllDeposits(token: string): Promise<AdminDeposit[]> {
  if (!token) {
    throw new Error("Не сте влезли в профила си.");
  }

  const response = await api.get(`${API_URL}/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Update deposit status (admin only)
 */
export async function updateDepositStatus(
  depositId: string,
  data: UpdateDepositData,
  token: string,
): Promise<{ message: string; deposit: AdminDeposit }> {
  if (!token) {
    throw new Error("Не сте влезли в профила си.");
  }

  const response = await api.put(`${API_URL}/${depositId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
