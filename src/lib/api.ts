const API_BASE = "https://aliceglow-backend.onrender.com";

function getToken(): string | null {
  return localStorage.getItem("aliceglow_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem("aliceglow_token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Products
  getProducts: () => request<Product[]>("/products"),
  createProduct: (data: { name: string; costPrice: number; stock: number }) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<{ name: string; costPrice: number; stock: number }>) =>
    request<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),

  // Sales
  getSales: () => request<Sale[]>("/sales"),
  getSale: (id: number) => request<SaleDetail>(`/sales/${id}`),
  createSale: (data: { client: string; items: { productId: number; quantity: number }[] }) =>
    request<Sale>("/sales", { method: "POST", body: JSON.stringify(data) }),
  cancelSale: (id: number) =>
    request<Sale>(`/sales/${id}/cancel`, { method: "PATCH" }),

  // Users
  getUsers: () => request<User[]>("/users"),
  createUser: (data: { name: string; email: string; password: string; perfils: string[] }) =>
    request<User>("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number, data: Partial<{ name: string; email: string; password: string; perfils: string[] }>) =>
    request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: number) =>
    request<void>(`/users/${id}`, { method: "DELETE" }),
};

// Types
export interface Product {
  id: number;
  name: string;
  costPrice: number;
  stock: number;
}

export interface Sale {
  id: number;
  client: string;
  date: string;
  totalValue: number;
  status: string;
}

export interface SaleDetail extends Sale {
  items: { productId: number; quantity: number; price: number; productName?: string }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  perfils: string[];
}
