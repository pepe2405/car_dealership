import axios from 'axios';

const API_URL = '/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
}

export const getProfile = async (token: string): Promise<UserProfile> => {
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateProfile = async (token: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await axios.put(
    `${API_URL}/auth/profile`,
    profileData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}; 