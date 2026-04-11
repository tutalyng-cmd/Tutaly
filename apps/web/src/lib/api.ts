import axios from 'axios';

// Ensure this matches the NestJS backend URL from environment or hardcode for dev
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true, // Crucial for sending/receiving the HttpOnly refresh cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiAuth = {
  // Pass the access token in the Authorization header
  withToken: (token: string) => {
    return axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
