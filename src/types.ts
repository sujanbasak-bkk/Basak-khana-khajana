/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BusinessConfig {
  name: string;
  logoUrl: string;
  contactPhones: string[];
  address: string;
  locationDetails: string;
  mapIframeUrl: string;
  aboutUsText: string;
}

export interface Category {
  id: string;
  name: string; // Breakfast, Lunch, Fastfood, Dinner, Tea etc.
}

export interface FoodItem {
  id: string;
  name: string;
  category: string; // references Category.name or Category.id
  price: number;
  stock: number;
  description: string;
  photoUrl: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  token: string; // Serial/Token number (e.g. BKK-1004)
  customerName: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface HeroBanner {
  id: string;
  imageUrl: string;
  title: string;
}

export interface AdminSession {
  success: boolean;
  token?: string;
  username?: string;
}
