import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cars';

// Configure axios defaults
axios.defaults.withCredentials = true;

export interface Car {
  _id: string;
  brand: string;
  carModel: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  images: string[];
  description: string;
  features: string[];
  seller: { name: string; email: string };
  status: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function fetchCars(): Promise<Car[]> {
  const response = await axios.get(API_URL);
  return response.data;
}

export async function fetchMyCars(token: string): Promise<Car[]> {
  const response = await axios.get(`${API_URL}/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateCar(id: string, data: Partial<Car>, token: string): Promise<Car> {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteCar(id: string, token: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
} 