const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api';

export const api = {
  async register(email: string, password: string, name: string) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async getAccounts(token: string) {
    const res = await fetch(`${API_URL}/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  },

  async createAccount(token: string, account: { name: string; type: string; initialBalance: number }) {
    const res = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(account),
    });
    if (!res.ok) throw new Error('Failed to create account');
    return res.json();
  },
};
