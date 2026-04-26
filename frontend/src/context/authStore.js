import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      set({ user: data, token: data.token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
      return false;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      set({ user: data, token: data.token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  updateProfile: async (fields) => {
    try {
      const { data } = await api.patch('/profile', fields);
      const updated = { ...data };
      localStorage.setItem('user', JSON.stringify({ _id: updated._id, name: updated.name, email: updated.email }));
      set({ user: updated });
      return true;
    } catch (err) {
      return false;
    }
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/profile');
      set({ user: data });
    } catch (err) {}
  },

  bumpStreak: async () => {
    try {
      const { data } = await api.post('/profile/streak');
      set(state => ({ user: { ...state.user, streak: data.streak, lastStudiedDate: data.lastStudiedDate } }));
    } catch (err) {}
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;