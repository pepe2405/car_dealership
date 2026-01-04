import axios from "axios";

const API_URL = "/api/test-drives";

export async function createTestDriveRequest(
  data: { car: string; date: string; message?: string },
  token: string,
) {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getTestDriveRequests(token: string) {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getTestDriveRequest(id: string, token: string) {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateTestDriveRequest(
  id: string,
  status: "approved" | "rejected",
  token: string,
) {
  const res = await axios.put(
    `${API_URL}/${id}`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
}

export async function getTestDriveRequestForCar(carId: string, token: string) {
  try {
    const res = await axios.get(`/api/test-drives?car=${carId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function deleteTestDriveRequest(id: string, token: string) {
  const res = await axios.delete(`/api/test-drives/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
