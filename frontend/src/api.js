// Django backend bilan aloqa. Manzilni .env faylida VITE_API_URL orqali o'zgartirish mumkin.
export const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

async function request(path, { timeout = 8000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(API_URL + path, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(`API ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export const fetchCatalog = () => request('/catalog/', { timeout: 4000 });
export const createOrder = (body) => request('/orders/', { method: 'POST', body: JSON.stringify(body) });
export const fetchOrder = (id) => request(`/orders/${id}/`);
