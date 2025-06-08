import axios from 'axios';
import { UserProfile } from './userService';

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