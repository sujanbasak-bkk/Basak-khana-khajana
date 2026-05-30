/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  BusinessConfig, 
  Category, 
  FoodItem, 
  Order, 
  HeroBanner, 
  AdminSession,
  OrderItem
} from './types';

// Utility for fetching with JSON bodies
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    let errMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      errMsg = data.error || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return response.json() as Promise<T>;
}

export const bkkApi = {
  // Login
  async adminLogin(username: string, password: string): Promise<AdminSession> {
    return fetchJson<AdminSession>('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  },

  // Business Config
  async getBusiness(): Promise<BusinessConfig> {
    return fetchJson<BusinessConfig>('/api/business');
  },

  async updateBusiness(config: BusinessConfig, token: string): Promise<{ success: boolean; business: BusinessConfig }> {
    return fetchJson('/api/business', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config)
    });
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return fetchJson<Category[]>('/api/categories');
  },

  async saveCategories(categories: Category[], token: string): Promise<{ success: boolean; categories: Category[] }> {
    return fetchJson('/api/categories', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categories)
    });
  },

  // Food Items
  async getItems(): Promise<FoodItem[]> {
    return fetchJson<FoodItem[]>('/api/items');
  },

  async createItem(item: Omit<FoodItem, 'id'>, token: string): Promise<{ success: boolean; item: FoodItem }> {
    return fetchJson('/api/items', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(item)
    });
  },

  async updateItem(id: string, item: Partial<FoodItem>, token: string): Promise<{ success: boolean; item: FoodItem }> {
    return fetchJson(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(item)
    });
  },

  async deleteItem(id: string, token: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/items/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Hero Banners
  async getHeroBanners(): Promise<HeroBanner[]> {
    return fetchJson<HeroBanner[]>('/api/hero');
  },

  async saveHeroBanners(banners: HeroBanner[], token: string): Promise<{ success: boolean; heroBanners: HeroBanner[] }> {
    return fetchJson('/api/hero', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(banners)
    });
  },

  // Customer Orders
  async getOrders(token: string): Promise<Order[]> {
    return fetchJson<Order[]>('/api/orders', {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  async submitOrder(customerName: string, phone: string, items: OrderItem[], totalAmount: number): Promise<{ success: boolean; order: Order }> {
    return fetchJson('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, phone, items, totalAmount })
    });
  },

  async updateOrderStatus(orderId: string, status: 'completed' | 'cancelled' | 'pending', token: string): Promise<{ success: boolean; order: Order }> {
    return fetchJson(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
  },

  // Upload Photo to Server Disk
  async uploadImage(imageData: string, fileName: string): Promise<{ success: boolean; imageUrl: string }> {
    return fetchJson('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData, fileName })
    });
  }
};
