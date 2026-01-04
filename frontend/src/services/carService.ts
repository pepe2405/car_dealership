import axios from "axios";

const API_URL = "/api/cars";

axios.defaults.withCredentials = true;

const api = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
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

export async function fetchCars(token?: string): Promise<Car[]> {
  if (token) {
    const response = await api.get(`${API_URL}/authenticated`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } else {
    const response = await api.get(API_URL);
    return response.data;
  }
}

export async function fetchCarsUnauthenticated(): Promise<Car[]> {
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

export async function updateCar(
  id: string,
  data: Partial<Car>,
  token: string,
): Promise<Car> {
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
    console.error("No token provided to addFavorite!");
    throw new Error("Не сте влезли в профила си.");
  }
  console.debug("addFavorite token:", token);
  await api.post(
    `/api/auth/favorites/${carId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export async function removeFavorite(
  carId: string,
  token: string,
): Promise<void> {
  if (!token) {
    console.error("No token provided to removeFavorite!");
    throw new Error("Не сте влезли в профила си.");
  }
  console.debug("removeFavorite token:", token);
  await api.delete(`/api/auth/favorites/${carId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchFavorites(token: string): Promise<Car[]> {
  if (!token) {
    console.error("No token provided to fetchFavorites!");
    throw new Error("Не сте влезли в профила си.");
  }
  console.debug("fetchFavorites token:", token);
  const response = await api.get("/api/auth/favorites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Get all cars including those with deposits (admin/seller only)
 */
export async function fetchAllCars(token: string): Promise<Car[]> {
  if (!token) {
    throw new Error("Не сте влезли в профила си.");
  }

  const response = await api.get("/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
