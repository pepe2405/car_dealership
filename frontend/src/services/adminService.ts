import axios from 'axios';
import { UserProfile } from './userService';
import { Car } from './carService';

const API_URL = '/api';

export const getAllUsers = async (token: string): Promise<UserProfile[]> => {
  const response = await axios.get(`${API_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUser = async (token: string, userId: string, userData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await axios.put(
    `${API_URL}/admin/users/${userId}`,
    userData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteUser = async (token: string, userId: string): Promise<void> => {
  await axios.delete(`${API_URL}/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Car management functions
export const getAllCars = async (token: string): Promise<Car[]> => {
  const response = await axios.get(`${API_URL}/admin/cars`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateCar = async (token: string, carId: string, carData: Partial<Car>): Promise<Car> => {
  const response = await axios.put(
    `${API_URL}/admin/cars/${carId}`,
    carData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteCar = async (token: string, carId: string): Promise<void> => {
  await axios.delete(`${API_URL}/admin/cars/${carId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllUsersForChat = async (token: string): Promise<UserProfile[]> => {
  const response = await axios.get(`/api/users-list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}; 