import axios from 'axios';

// Use relative URL to work with Vite proxy
const API_URL = '/api/cars';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Create axios instance with default config
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const response = await api.get(API_URL);
  return response.data;
}

export async function fetchCarById(id: string): Promise<Car> {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
}

export async function fetchMyCars(token: string): Promise<Car[]> {
  const response = await api.get(`${API_URL}/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateCar(id: string, data: Partial<Car>, token: string): Promise<Car> {
  const response = await api.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteCar(id: string, token: string): Promise<void> {
  await api.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addFavorite(carId: string, token: string): Promise<void> {
  if (!token) {
    console.error('No token provided to addFavorite!');
    throw new Error('Не сте влезли в профила си.');
  }
  console.debug('addFavorite token:', token);
  await api.post(`/api/auth/favorites/${carId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeFavorite(carId: string, token: string): Promise<void> {
  if (!token) {
    console.error('No token provided to removeFavorite!');
    throw new Error('Не сте влезли в профила си.');
  }
  console.debug('removeFavorite token:', token);
  await api.delete(`/api/auth/favorites/${carId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchFavorites(token: string): Promise<Car[]> {
  if (!token) {
    console.error('No token provided to fetchFavorites!');
    throw new Error('Не сте влезли в профила си.');
  }
  console.debug('fetchFavorites token:', token);
  const response = await api.get('/api/auth/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
} 